// docs/refatoracao-carrinho-cupons/codigo-novo/api-validate-coupon.ts
// NOVA API DE VALIDAÇÃO DE CUPOM - Segura e simples

import { NextRequest, NextResponse } from 'next/server';

// Esta seria a função para buscar cupom no Strapi
async function fetchCouponFromStrapi(code: string) {
  const baseURL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";
  const endpoint = `${baseURL}/api/cupoms?filters[codigo][$eq]=${code}&populate=*`;

  const response = await fetch(endpoint, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  const data = await response.json();
  return data.data?.[0] || null;
}

// Converte cupom do Strapi para formato do frontend
function formatCouponForFrontend(strapiCoupon: any) {
  if (!strapiCoupon) return null;
  
  // Sistema atual usa 'multiplacar' e 'diminuir'
  // Convertemos para formato mais claro
  const isPercentage = strapiCoupon.multiplacar && strapiCoupon.multiplacar !== 1;
  const isFixed = strapiCoupon.diminuir && strapiCoupon.diminuir > 0;
  
  if (isPercentage) {
    // multiplacar 0.8 = 20% de desconto
    const discountPercent = (1 - strapiCoupon.multiplacar) * 100;
    return {
      code: strapiCoupon.codigo,
      type: 'percentage' as const,
      value: discountPercent,
      minimumValue: strapiCoupon.valor_minimo || 0,
      name: strapiCoupon.nome || strapiCoupon.codigo
    };
  } else if (isFixed) {
    return {
      code: strapiCoupon.codigo,
      type: 'fixed' as const,
      value: strapiCoupon.diminuir,
      minimumValue: strapiCoupon.valor_minimo || 0,
      name: strapiCoupon.nome || strapiCoupon.codigo
    };
  }
  
  return null;
}

// =============================================================================
// API Route Handler - app/api/validate-coupon/route.ts
// =============================================================================

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code } = body;
    
    // Validação básica
    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { 
          valid: false, 
          message: 'Código de cupom inválido' 
        },
        { status: 400 }
      );
    }
    
    // Normaliza código
    const normalizedCode = code.trim().toUpperCase();
    
    // Busca cupom no Strapi
    const strapiCoupon = await fetchCouponFromStrapi(normalizedCode);
    
    if (!strapiCoupon) {
      return NextResponse.json(
        { 
          valid: false, 
          message: 'Cupom não encontrado' 
        },
        { status: 404 }
      );
    }
    
    // Validações adicionais
    
    // 1. Verifica se cupom está ativo
    if (strapiCoupon.ativo === false) {
      return NextResponse.json(
        { 
          valid: false, 
          message: 'Cupom inativo' 
        },
        { status: 400 }
      );
    }
    
    // 2. Verifica data de validade se existir
    if (strapiCoupon.data_expiracao) {
      const expirationDate = new Date(strapiCoupon.data_expiracao);
      if (expirationDate < new Date()) {
        return NextResponse.json(
          { 
            valid: false, 
            message: 'Cupom expirado' 
          },
          { status: 400 }
        );
      }
    }
    
    // 3. Verifica data de início se existir
    if (strapiCoupon.data_inicio) {
      const startDate = new Date(strapiCoupon.data_inicio);
      if (startDate > new Date()) {
        return NextResponse.json(
          { 
            valid: false, 
            message: 'Cupom ainda não está válido' 
          },
          { status: 400 }
        );
      }
    }
    
    // 4. Verifica limite de uso se existir
    if (strapiCoupon.limite_uso && strapiCoupon.uso_atual >= strapiCoupon.limite_uso) {
      return NextResponse.json(
        { 
          valid: false, 
          message: 'Cupom esgotado' 
        },
        { status: 400 }
      );
    }
    
    // Formata cupom para o frontend
    const formattedCoupon = formatCouponForFrontend(strapiCoupon);
    
    if (!formattedCoupon) {
      return NextResponse.json(
        { 
          valid: false, 
          message: 'Formato de cupom inválido' 
        },
        { status: 500 }
      );
    }
    
    // Retorna cupom válido
    return NextResponse.json(
      {
        valid: true,
        message: 'Cupom válido',
        coupon: formattedCoupon
      },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Erro ao validar cupom:', error);
    
    return NextResponse.json(
      { 
        valid: false, 
        message: 'Erro ao validar cupom' 
      },
      { status: 500 }
    );
  }
}

// =============================================================================
// Validação Server-Side para Checkout (mais segura)
// =============================================================================

export async function validateCouponForCheckout(
  code: string,
  subtotal: number
): Promise<{
  valid: boolean;
  discount: number;
  couponData?: any;
  error?: string;
}> {
  try {
    // Busca cupom novamente (não confia no frontend)
    const strapiCoupon = await fetchCouponFromStrapi(code);
    
    if (!strapiCoupon) {
      return { 
        valid: false, 
        discount: 0, 
        error: 'Cupom não encontrado' 
      };
    }
    
    // Todas as validações novamente
    if (strapiCoupon.ativo === false) {
      return { 
        valid: false, 
        discount: 0, 
        error: 'Cupom inativo' 
      };
    }
    
    // Valida valor mínimo
    if (strapiCoupon.valor_minimo && subtotal < strapiCoupon.valor_minimo) {
      return { 
        valid: false, 
        discount: 0, 
        error: `Valor mínimo não atingido: R$ ${strapiCoupon.valor_minimo}` 
      };
    }
    
    // Calcula desconto
    let discount = 0;
    
    if (strapiCoupon.multiplacar && strapiCoupon.multiplacar !== 1) {
      // Desconto percentual
      discount = subtotal * (1 - strapiCoupon.multiplacar);
    } else if (strapiCoupon.diminuir && strapiCoupon.diminuir > 0) {
      // Desconto fixo
      discount = Math.min(strapiCoupon.diminuir, subtotal);
    }
    
    // Aplica limite máximo se existir
    if (strapiCoupon.desconto_maximo && discount > strapiCoupon.desconto_maximo) {
      discount = strapiCoupon.desconto_maximo;
    }
    
    return {
      valid: true,
      discount: Number(discount.toFixed(2)),
      couponData: {
        code: strapiCoupon.codigo,
        name: strapiCoupon.nome,
        type: strapiCoupon.multiplacar ? 'percentage' : 'fixed',
        value: strapiCoupon.multiplacar 
          ? (1 - strapiCoupon.multiplacar) * 100 
          : strapiCoupon.diminuir
      }
    };
    
  } catch (error) {
    console.error('Erro ao validar cupom para checkout:', error);
    return { 
      valid: false, 
      discount: 0, 
      error: 'Erro ao processar cupom' 
    };
  }
}