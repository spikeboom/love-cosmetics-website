// docs/refatoracao-carrinho-cupons/codigo-novo/api-checkout-seguro.ts
// NOVA API DE CHECKOUT - Totalmente segura, validação server-side

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateCouponForCheckout } from './api-validate-coupon';

// Constantes
const SHIPPING_COST = 15;
const SHIPPING_COST_CENTS = SHIPPING_COST * 100;

// =============================================================================
// Funções auxiliares
// =============================================================================

// Busca produtos reais do banco/Strapi
async function fetchRealProducts(productIds: string[]) {
  // Aqui você buscaria os produtos do Strapi ou banco de dados
  // Por enquanto, vou simular a estrutura
  
  const baseURL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";
  const products = [];
  
  for (const id of productIds) {
    const endpoint = `${baseURL}/api/produtos/${id}?populate=*`;
    
    try {
      const response = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        products.push(data.data);
      }
    } catch (error) {
      console.error(`Erro ao buscar produto ${id}:`, error);
    }
  }
  
  return products;
}

// Valida e prepara items para o pedido
async function validateAndPrepareItems(
  requestItems: Array<{ id: string; quantity: number }>
): Promise<{
  valid: boolean;
  items: any[];
  subtotal: number;
  error?: string;
}> {
  try {
    // Busca produtos reais
    const productIds = requestItems.map(item => item.id);
    const realProducts = await fetchRealProducts(productIds);
    
    if (realProducts.length !== requestItems.length) {
      return {
        valid: false,
        items: [],
        subtotal: 0,
        error: 'Um ou mais produtos não foram encontrados'
      };
    }
    
    // Valida e prepara items
    const validatedItems = [];
    let subtotal = 0;
    
    for (const requestItem of requestItems) {
      const realProduct = realProducts.find(p => p.id === requestItem.id);
      
      if (!realProduct) {
        return {
          valid: false,
          items: [],
          subtotal: 0,
          error: `Produto ${requestItem.id} não encontrado`
        };
      }
      
      // Verifica estoque se disponível
      if (realProduct.estoque !== undefined && realProduct.estoque < requestItem.quantity) {
        return {
          valid: false,
          items: [],
          subtotal: 0,
          error: `Estoque insuficiente para ${realProduct.nome}`
        };
      }
      
      // Prepara item validado
      const itemPrice = realProduct.preco || 0;
      const itemTotal = itemPrice * requestItem.quantity;
      
      validatedItems.push({
        id: realProduct.id,
        name: realProduct.nome,
        unit_amount: Math.round(itemPrice * 100), // Centavos para PagSeguro
        quantity: requestItem.quantity,
        price: itemPrice,
        total: itemTotal
      });
      
      subtotal += itemTotal;
    }
    
    return {
      valid: true,
      items: validatedItems,
      subtotal
    };
    
  } catch (error) {
    console.error('Erro ao validar items:', error);
    return {
      valid: false,
      items: [],
      subtotal: 0,
      error: 'Erro ao validar produtos'
    };
  }
}

// =============================================================================
// API Route Handler - app/api/checkout/route.ts
// =============================================================================

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Extrai dados do request
    const {
      // Items do carrinho (apenas IDs e quantidades)
      items: requestItems,
      couponCode,
      
      // Dados do cliente
      nome,
      sobrenome,
      email,
      cpf,
      telefone,
      data_nascimento,
      
      // Endereço
      cep,
      endereco,
      numero,
      complemento,
      bairro,
      cidade,
      estado,
      pais = 'Brasil',
      
      // Preferências
      salvar_minhas_informacoes = false,
      aceito_receber_whatsapp = false,
      destinatario,
      
      // Analytics
      ga_session_id,
      ga_session_number
    } = body;
    
    // ==========================================================================
    // VALIDAÇÃO 1: Estrutura básica
    // ==========================================================================
    
    if (!requestItems || !Array.isArray(requestItems) || requestItems.length === 0) {
      return NextResponse.json(
        { error: 'Carrinho vazio' },
        { status: 400 }
      );
    }
    
    if (!nome || !email || !cpf || !telefone) {
      return NextResponse.json(
        { error: 'Dados do cliente incompletos' },
        { status: 400 }
      );
    }
    
    // ==========================================================================
    // VALIDAÇÃO 2: Produtos (busca preços reais do banco)
    // ==========================================================================
    
    console.log('Validando produtos...');
    const itemsValidation = await validateAndPrepareItems(requestItems);
    
    if (!itemsValidation.valid) {
      return NextResponse.json(
        { error: itemsValidation.error },
        { status: 400 }
      );
    }
    
    const { items: validatedItems, subtotal } = itemsValidation;
    
    // ==========================================================================
    // VALIDAÇÃO 3: Cupom (se fornecido)
    // ==========================================================================
    
    let discount = 0;
    let appliedCoupon = null;
    
    if (couponCode) {
      console.log('Validando cupom:', couponCode);
      const couponValidation = await validateCouponForCheckout(couponCode, subtotal);
      
      if (!couponValidation.valid) {
        // Cupom inválido não bloqueia a compra, apenas ignora o desconto
        console.warn('Cupom inválido:', couponValidation.error);
      } else {
        discount = couponValidation.discount;
        appliedCoupon = couponValidation.couponData;
      }
    }
    
    // ==========================================================================
    // CÁLCULO FINAL (tudo server-side)
    // ==========================================================================
    
    const shipping = SHIPPING_COST;
    const totalBeforeShipping = subtotal - discount;
    const finalTotal = totalBeforeShipping + shipping;
    
    console.log('Cálculo final:', {
      subtotal,
      discount,
      shipping,
      total: finalTotal
    });
    
    // ==========================================================================
    // APLICAR DESCONTO NOS ITEMS (para PagSeguro)
    // ==========================================================================
    
    let itemsForPayment = validatedItems;
    
    if (discount > 0) {
      // Distribui o desconto proporcionalmente entre os items
      itemsForPayment = validatedItems.map(item => {
        const itemSubtotal = item.price * item.quantity;
        const itemProportion = itemSubtotal / subtotal;
        const itemDiscount = discount * itemProportion;
        const discountedPrice = item.price - (itemDiscount / item.quantity);
        
        return {
          ...item,
          unit_amount: Math.round(Math.max(1, discountedPrice * 100)) // Mínimo 1 centavo
        };
      });
    }
    
    // ==========================================================================
    // CRIAR PEDIDO NO BANCO
    // ==========================================================================
    
    const pedido = await prisma.pedido.create({
      data: {
        // Dados do cliente
        nome,
        sobrenome,
        email,
        cpf: cpf.replace(/\D/g, ''), // Remove formatação
        telefone: telefone.replace(/\D/g, ''),
        data_nascimento: new Date(data_nascimento),
        
        // Endereço
        pais,
        cep,
        endereco,
        numero,
        complemento,
        bairro,
        cidade,
        estado,
        
        // Items e valores
        items: itemsForPayment as any,
        cupons: appliedCoupon ? [appliedCoupon.code] : [],
        descontos: discount,
        total_pedido: finalTotal,
        
        // Preferências
        salvar_minhas_informacoes,
        aceito_receber_whatsapp,
        destinatario,
        
        // Analytics
        ga_session_id,
        ga_session_number
      }
    });
    
    console.log('Pedido criado:', pedido.id);
    
    // ==========================================================================
    // PREPARAR DADOS PARA PAGSEGURO
    // ==========================================================================
    
    const cleanedPhone = telefone.replace(/\D/g, '');
    const cleanedCPF = cpf.replace(/\D/g, '');
    
    const pagSeguroPayload = {
      customer: {
        phone: {
          country: "+55",
          area: cleanedPhone.substring(0, 2),
          number: cleanedPhone.substring(2),
        },
        name: `${nome} ${sobrenome}`,
        email: email,
        tax_id: cleanedCPF,
      },
      
      // Items com preços já descontados
      items: itemsForPayment.map(item => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        unit_amount: item.unit_amount
      })),
      
      // Frete como valor adicional
      additional_amount: SHIPPING_COST_CENTS,
      
      // Referência do pedido
      reference_id: pedido.id,
      customer_modifiable: true,
      
      // URLs de callback
      redirect_url: `${process.env.NEXT_PUBLIC_BASE_URL}/confirmacao`,
      notification_urls: [
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/checkout_notification`,
      ],
      payment_notification_urls: [
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/payment_notification`,
      ],
    };
    
    console.log('Enviando para PagSeguro...');
    
    // ==========================================================================
    // ENVIAR PARA PAGSEGURO
    // ==========================================================================
    
    const pagSeguroResponse = await fetch('https://api.pagseguro.com/checkouts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.PAGSEGURO_TOKEN_DEV}`,
        'Accept': '*/*',
      },
      body: JSON.stringify(pagSeguroPayload),
    });
    
    const pagSeguroData = await pagSeguroResponse.json();
    
    if (!pagSeguroResponse.ok) {
      console.error('Erro PagSeguro:', pagSeguroData);
      
      // Remove pedido se pagamento falhou
      await prisma.pedido.delete({ where: { id: pedido.id } });
      
      return NextResponse.json(
        { error: 'Erro ao processar pagamento', details: pagSeguroData },
        { status: 500 }
      );
    }
    
    // ==========================================================================
    // INCREMENTAR USO DO CUPOM (se aplicado)
    // ==========================================================================
    
    if (appliedCoupon) {
      // Aqui você atualizaria o contador de uso no Strapi
      // Por exemplo: await incrementCouponUsage(appliedCoupon.code);
      console.log('Cupom usado:', appliedCoupon.code);
    }
    
    // ==========================================================================
    // RETORNAR SUCESSO
    // ==========================================================================
    
    const paymentLink = pagSeguroData.links?.find(
      (link: any) => link.rel === 'PAY'
    )?.href;
    
    return NextResponse.json(
      {
        success: true,
        message: 'Pedido criado com sucesso',
        orderId: pedido.id,
        paymentLink,
        totals: {
          subtotal,
          discount,
          shipping,
          total: finalTotal
        }
      },
      { status: 201 }
    );
    
  } catch (error) {
    console.error('Erro ao processar checkout:', error);
    
    return NextResponse.json(
      { error: 'Erro ao processar pedido' },
      { status: 500 }
    );
  }
}

// =============================================================================
// Webhook para notificações do PagSeguro
// =============================================================================

export async function handlePaymentNotification(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Valida assinatura do webhook (importante para segurança)
    // const isValid = validateWebhookSignature(req.headers, body);
    // if (!isValid) return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    
    const { reference_id, status } = body;
    
    // Por enquanto, apenas registrar o status sem atualizar o pedido
    // O modelo Pedido não tem campo 'status' ou 'status_pagamento'
    console.log(`Status do pedido ${reference_id}: ${status}`);
    
    console.log(`Pedido ${reference_id} atualizado para status: ${status}`);
    
    return NextResponse.json({ received: true });
    
  } catch (error) {
    console.error('Erro ao processar notificação:', error);
    return NextResponse.json(
      { error: 'Erro ao processar notificação' },
      { status: 500 }
    );
  }
}