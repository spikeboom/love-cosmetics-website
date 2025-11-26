import qs from "qs";

interface OrderItem {
  reference_id: string;
  name: string;
  quantity: number;
  preco: number;
  unit_amount: number;
  image_url?: string;
  bling_number?: string;
}

interface CupomData {
  codigo: string;
  multiplacar: number;
  diminuir: number;
  ativo?: boolean;
  data_expiracao?: string;
  usos_restantes?: number;
}

interface ValidationResult {
  valid: boolean;
  error?: string;
  code?: string;
  calculatedTotal: number;
  calculatedDescontos: number;
  details?: {
    itemsSubtotal: number;
    cupomDesconto: number;
    freteValidado: number;
  };
}

// Tolerância de R$ 0.50 para erros de arredondamento (ponto flutuante JS)
const TOLERANCE = 0.50;

// Busca produtos por documentId OU id numérico no Strapi
async function fetchProdutosByIds(ids: string[]): Promise<Map<string, any>> {
  const baseURL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";

  // Separar IDs numéricos de documentIds (strings alfanuméricas)
  const numericIds: number[] = [];
  const documentIds: string[] = [];

  for (const id of ids) {
    if (!id) continue;
    const numId = parseInt(id, 10);
    if (!isNaN(numId) && String(numId) === id) {
      numericIds.push(numId);
    } else {
      documentIds.push(id);
    }
  }

  // Construir filtro com $or para buscar por id OU documentId
  const filters: any = {};
  if (numericIds.length > 0 && documentIds.length > 0) {
    filters.$or = [
      { id: { $in: numericIds } },
      { documentId: { $in: documentIds } },
    ];
  } else if (numericIds.length > 0) {
    filters.id = { $in: numericIds };
  } else if (documentIds.length > 0) {
    filters.documentId = { $in: documentIds };
  }

  const query = qs.stringify(
    {
      filters,
      fields: ["id", "documentId", "nome", "preco"],
    },
    { encodeValuesOnly: true }
  );

  const endpoint = `${baseURL}/api/produtos?${query}`;

  const response = await fetch(endpoint, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}`,
    },
    cache: "no-store",
  });

  const result = await response.json();

  if (!response.ok) {
    console.error("Erro ao buscar produtos no Strapi:", {
      status: response.status,
      statusText: response.statusText,
      endpoint,
      result,
    });
    throw new Error("Falha ao buscar produtos para validação");
  }

  // Criar map com AMBOS id e documentId como chaves para encontrar o produto
  const produtosMap = new Map<string, any>();
  for (const produto of result.data || []) {
    produtosMap.set(String(produto.id), produto);
    if (produto.documentId) {
      produtosMap.set(produto.documentId, produto);
    }
  }

  return produtosMap;
}

// Busca produtos por nome no Strapi (fallback quando ID muda após republicar)
async function fetchProdutosByNomes(nomes: string[]): Promise<Map<string, any>> {
  const baseURL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";

  // Criar filtro $or para buscar por nome exato
  const filters = {
    $or: nomes.map(nome => ({ nome: { $eq: nome } }))
  };

  const query = qs.stringify(
    {
      filters,
      fields: ["id", "documentId", "nome", "preco"],
    },
    { encodeValuesOnly: true }
  );

  const endpoint = `${baseURL}/api/produtos?${query}`;

  const response = await fetch(endpoint, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}`,
    },
    cache: "no-store",
  });

  const result = await response.json();

  if (!response.ok) {
    console.error("Erro ao buscar produtos por nome no Strapi:", result);
    return new Map();
  }

  // Criar map usando nome como chave
  const produtosMap = new Map<string, any>();
  for (const produto of result.data || []) {
    produtosMap.set(produto.nome, produto);
  }

  return produtosMap;
}

// Busca e valida cupom no servidor
async function fetchAndValidateCupom(codigo: string): Promise<CupomData | null> {
  const baseURL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";
  const endpoint = `${baseURL}/api/cupoms?filters[codigo][$eq]=${codigo}&populate=*`;

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

  const result = await response.json();
  const cupom = result.data?.[0];

  if (!cupom) {
    return null;
  }

  // Validar se cupom está ativo
  if (cupom.ativo === false) {
    return null;
  }

  // Validar data de expiração
  if (cupom.data_expiracao) {
    const expiracao = new Date(cupom.data_expiracao);
    if (expiracao < new Date()) {
      return null;
    }
  }

  // Validar usos restantes
  if (cupom.usos_restantes !== undefined && cupom.usos_restantes <= 0) {
    return null;
  }

  return {
    codigo: cupom.codigo,
    multiplacar: cupom.multiplacar || 1,
    diminuir: cupom.diminuir || 0,
    ativo: cupom.ativo,
    data_expiracao: cupom.data_expiracao,
    usos_restantes: cupom.usos_restantes,
  };
}

// Valida frete (range razoável)
function validateFrete(freteEnviado: number): { valid: boolean; error?: string } {
  // Frete grátis ou dentro de range razoável (0 a 150 reais)
  if (freteEnviado < 0) {
    return { valid: false, error: "Valor de frete inválido (negativo)" };
  }

  if (freteEnviado > 150) {
    return { valid: false, error: "Valor de frete suspeito (muito alto)" };
  }

  return { valid: true };
}

// Função principal de validação
export async function validateOrder(
  items: OrderItem[],
  cupons: string[],
  descontosEnviado: number,
  totalEnviado: number,
  freteEnviado: number
): Promise<ValidationResult> {
  try {
    // 1. Validar se há items
    if (!items || items.length === 0) {
      return {
        valid: false,
        error: "Carrinho vazio",
        code: "EMPTY_CART",
        calculatedTotal: 0,
        calculatedDescontos: 0,
      };
    }

    // 2. Buscar cupom PRIMEIRO (para validar preços com desconto)
    let multiplicador = 1;
    let diminuir = 0;

    if (cupons && cupons.length > 0) {
      const cupomCodigo = cupons[0];
      const cupomValido = await fetchAndValidateCupom(cupomCodigo);

      if (!cupomValido) {
        return {
          valid: false,
          error: `Cupom "${cupomCodigo}" inválido ou expirado`,
          code: "INVALID_COUPON",
          calculatedTotal: 0,
          calculatedDescontos: 0,
        };
      }

      multiplicador = cupomValido.multiplacar;
      diminuir = cupomValido.diminuir;
    }

    // 3. Buscar produtos reais do Strapi por id ou documentId
    const productIds = items.map((item) => item.reference_id);
    let produtosReais = await fetchProdutosByIds(productIds);

    // 3.1 Se não encontrou todos, buscar por nome como fallback (para IDs que mudaram no Strapi)
    const itemsNaoEncontrados = items.filter(item => !produtosReais.has(item.reference_id));
    if (itemsNaoEncontrados.length > 0) {
      const produtosPorNome = await fetchProdutosByNomes(itemsNaoEncontrados.map(i => i.name));
      for (const item of itemsNaoEncontrados) {
        const produtoEncontrado = produtosPorNome.get(item.name);
        if (produtoEncontrado) {
          produtosReais.set(item.reference_id, produtoEncontrado);
        }
      }
    }

    // 4. Validar cada item
    let subtotalOriginal = 0;
    let subtotalComCupom = 0;

    for (const item of items) {
      const produtoReal = produtosReais.get(item.reference_id);

      if (!produtoReal) {
        return {
          valid: false,
          error: `Produto não encontrado: ${item.name}`,
          code: "PRODUCT_NOT_FOUND",
          calculatedTotal: 0,
          calculatedDescontos: 0,
        };
      }

      // Preço original do produto
      const precoOriginal = produtoReal.preco;

      // Preço com cupom aplicado (como o frontend faz)
      const precoComCupom = precoOriginal * multiplicador - diminuir;

      // Preço enviado pelo cliente
      const precoEnviado = item.preco;

      // Validar se o preço enviado bate com o preço calculado (com cupom)
      if (Math.abs(precoComCupom - precoEnviado) > TOLERANCE) {
        return {
          valid: false,
          error: `O preço do produto "${item.name}" foi atualizado. Por favor, atualize seu carrinho. Preço atual: R$ ${precoComCupom.toFixed(2)}`,
          code: "PRICE_MISMATCH",
          calculatedTotal: 0,
          calculatedDescontos: 0,
        };
      }

      // Validar quantidade
      if (item.quantity <= 0) {
        return {
          valid: false,
          error: `Quantidade inválida para "${item.name}"`,
          code: "INVALID_QUANTITY",
          calculatedTotal: 0,
          calculatedDescontos: 0,
        };
      }

      if (item.quantity > 100) {
        return {
          valid: false,
          error: `Quantidade suspeita para "${item.name}" (máximo 100 unidades)`,
          code: "SUSPICIOUS_QUANTITY",
          calculatedTotal: 0,
          calculatedDescontos: 0,
        };
      }

      // Calcular subtotais
      subtotalOriginal += precoOriginal * item.quantity;
      subtotalComCupom += precoComCupom * item.quantity;
    }

    // 5. Calcular desconto (preco_de - preco, igual ao frontend)
    // Cupom já foi aplicado nos preços individuais, não aplicar novamente
    const descontoCalculado = subtotalOriginal - subtotalComCupom;

    // 6. Validar frete
    const freteValidacao = validateFrete(freteEnviado);
    if (!freteValidacao.valid) {
      return {
        valid: false,
        error: freteValidacao.error,
        code: "INVALID_FREIGHT",
        calculatedTotal: 0,
        calculatedDescontos: 0,
      };
    }

    // 7. Calcular total final
    const totalCalculado = Math.max(0, subtotalComCupom) + freteEnviado;

    // 8. Comparar valores
    if (Math.abs(descontoCalculado - descontosEnviado) > TOLERANCE) {
      return {
        valid: false,
        error: `Valor do desconto divergente. Por favor, atualize seu carrinho.`,
        code: "DISCOUNT_MISMATCH",
        calculatedTotal: totalCalculado,
        calculatedDescontos: descontoCalculado,
      };
    }

    if (Math.abs(totalCalculado - totalEnviado) > TOLERANCE) {
      return {
        valid: false,
        error: `Valor total divergente. Por favor, atualize seu carrinho.`,
        code: "TOTAL_MISMATCH",
        calculatedTotal: totalCalculado,
        calculatedDescontos: descontoCalculado,
      };
    }

    // Tudo válido!
    return {
      valid: true,
      calculatedTotal: totalCalculado,
      calculatedDescontos: descontoCalculado,
      details: {
        itemsSubtotal: subtotalOriginal,
        cupomDesconto: descontoCalculado,
        freteValidado: freteEnviado,
      },
    };
  } catch (error) {
    console.error("Erro na validação do pedido:", error);
    return {
      valid: false,
      error: "Erro interno ao validar pedido",
      code: "VALIDATION_ERROR",
      calculatedTotal: 0,
      calculatedDescontos: 0,
    };
  }
}
