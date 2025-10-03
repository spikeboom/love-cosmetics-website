"use server";

// ============================================
// FRENET API - NOVA INTEGRAÇÃO
// ============================================

interface FrenetShippingItem {
  Weight: number; // peso em kg
  Length: number; // comprimento em cm
  Height: number; // altura em cm
  Width: number; // largura em cm
  Quantity: number;
  SKUCode?: string;
}

interface FrenetQuoteRequest {
  SellerCEP: string;
  RecipientCEP: string;
  ShipmentInvoiceValue: number;
  ShippingItemArray: FrenetShippingItem[];
  RecipientCountry?: string;
}

interface FrenetShippingService {
  ServiceCode: string;
  ServiceDescription: string;
  Carrier: string;
  ShippingPrice: number;
  DeliveryTime: number;
  OriginalDeliveryTime: number;
  Error?: string;
}

interface FrenetQuoteResponse {
  ShippingSevicesArray: FrenetShippingService[];
}

export interface FrenetCalculationSuccess {
  success: true;
  services: Array<{
    carrier: string;
    service: string;
    price: number;
    deliveryTime: number;
    serviceCode: string;
  }>;
  cheapest: {
    carrier: string;
    service: string;
    price: number;
    deliveryTime: number;
  };
}

export interface FrenetCalculationError {
  success: false;
  error: string;
}

export type FrenetCalculationResponse = FrenetCalculationSuccess | FrenetCalculationError;

// ============================================
// CALL ENTREGAS API - CÓDIGO ANTIGO (COMENTADO)
// ============================================

interface FreightCalculationPoint {
  cep: string;
  rua?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
  la?: string;
  lo?: string;
}

interface FreightCalculationRequest {
  token: string;
  codCliente: string;
  pontos: FreightCalculationPoint[];
  tipoCalculo?: string;
  retorno?: string;
  DataRetirada?: string;
  buscaEndFull?: string;
}

interface FreightCalculationSuccess {
  Sucesso: {
    valor: string;
    distancia: string;
    tempo: string;
    obs?: string;
  };
}

interface FreightCalculationError {
  Erro: string;
}

export type FreightCalculationResponse =
  | FreightCalculationSuccess
  | FreightCalculationError;

// ============================================
// FRENET API - IMPLEMENTAÇÃO
// ============================================

// Cache para Frenet
const frenetCache = new Map<string, { data: FrenetCalculationSuccess; timestamp: number }>();
const FRENET_CACHE_TIMEOUT = 1000 * 60 * 30; // 30 minutos

const FRENET_API_URL = "https://api.frenet.com.br/shipping/quote";
const FRENET_TOKEN = process.env.FRENET_API_TOKEN || "";
const SELLER_CEP = "69082-230"; // CEP de origem (Manaus)

export async function calculateFreightFrenet(
  cepDestino: string,
  items: Array<{
    quantity: number;
    peso_gramas?: number;
    altura?: number;
    largura?: number;
    comprimento?: number;
    bling_number?: number;
    preco: number;
  }>
): Promise<FrenetCalculationResponse> {
  // Validar CEP
  const cleanCep = cepDestino.replace(/\D/g, "");
  if (cleanCep.length !== 8) {
    return { success: false, error: "CEP inválido. Deve conter 8 dígitos." };
  }

  // Validar se há itens
  if (!items || items.length === 0) {
    return { success: false, error: "Nenhum item para calcular frete." };
  }

  // Criar chave de cache baseada no CEP e itens
  const cacheKey = `${cleanCep}-${JSON.stringify(items.map(i => ({ q: i.quantity, p: i.preco })))}`;

  // Verificar cache
  const cached = frenetCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < FRENET_CACHE_TIMEOUT) {
    return cached.data;
  }

  try {
    // Calcular valor total da nota
    const invoiceValue = items.reduce((sum, item) => sum + (item.preco * item.quantity), 0);

    // Montar array de itens para Frenet
    const shippingItems: FrenetShippingItem[] = items.map((item, index) => ({
      Weight: (item.peso_gramas || 200) / 1000, // converter gramas para kg (padrão 200g)
      Length: item.comprimento || 10, // padrão 10cm
      Height: item.altura || 10, // padrão 10cm
      Width: item.largura || 10, // padrão 10cm
      Quantity: item.quantity,
      SKUCode: item.bling_number ? String(item.bling_number) : `ITEM-${index + 1}`
    }));

    const requestData: FrenetQuoteRequest = {
      SellerCEP: SELLER_CEP.replace(/\D/g, ""),
      RecipientCEP: cleanCep,
      ShipmentInvoiceValue: invoiceValue,
      ShippingItemArray: shippingItems,
      RecipientCountry: "BR"
    };

    const response = await fetch(FRENET_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "token": FRENET_TOKEN
      },
      body: JSON.stringify(requestData)
    });

    if (!response.ok) {
      throw new Error(`Frenet API error! status: ${response.status}`);
    }

    const result: FrenetQuoteResponse = await response.json();

    // Verificar se há serviços disponíveis
    if (!result.ShippingSevicesArray || result.ShippingSevicesArray.length === 0) {
      return { success: false, error: "Nenhum serviço de entrega disponível para este CEP." };
    }

    // Filtrar serviços com erro
    const validServices = result.ShippingSevicesArray.filter(service => !service.Error);

    if (validServices.length === 0) {
      const firstError = result.ShippingSevicesArray[0]?.Error || "Erro desconhecido";
      return { success: false, error: firstError };
    }

    // Mapear serviços
    const services = validServices.map(service => ({
      carrier: service.Carrier,
      service: service.ServiceDescription,
      price: typeof service.ShippingPrice === 'string'
        ? parseFloat(service.ShippingPrice)
        : service.ShippingPrice,
      deliveryTime: service.DeliveryTime,
      serviceCode: service.ServiceCode
    }));

    // Encontrar o mais barato
    const cheapest = services.reduce((min, service) =>
      service.price < min.price ? service : min
    );

    const successResult: FrenetCalculationSuccess = {
      success: true,
      services,
      cheapest
    };

    // Adicionar ao cache
    frenetCache.set(cacheKey, { data: successResult, timestamp: Date.now() });

    return successResult;
  } catch (error) {
    console.error("Erro ao calcular frete com Frenet:", error);
    return {
      success: false,
      error: "Erro ao calcular frete. Por favor, tente novamente."
    };
  }
}

// ============================================
// CALL ENTREGAS API - CÓDIGO ANTIGO (COMENTADO)
// ============================================

/*
// Cache para evitar chamadas desnecessárias
const cache = new Map<
  string,
  { data: FreightCalculationSuccess; timestamp: number }
>();
const cacheTimeout = 1000 * 60 * 30; // 30 minutos

const apiUrl =
  process.env.NEXT_PUBLIC_CALL_ENTREGAS_API_URL ||
  "https://callentregas.com.br/integracao";
const token = process.env.NEXT_PUBLIC_CALL_ENTREGAS_TOKEN_CALCULAR || "";
const codCliente = process.env.NEXT_PUBLIC_CALL_ENTREGAS_COD_CLIENTE || "";

// Ponto inicial para cálculo de frete
const INITIAL_CEP = "69082-230";

export async function calculateFreight(
  cepDestino: string,
): Promise<FreightCalculationResponse> {
  // Limpar CEP (remover caracteres não numéricos)
  const cleanCep = cepDestino.replace(/\D/g, "");

  // Validar CEP
  if (cleanCep.length !== 8) {
    return { Erro: "CEP inválido. Deve conter 8 dígitos." };
  }

  // Verificar cache
  const cached = cache.get(cleanCep);
  if (cached && Date.now() - cached.timestamp < cacheTimeout) {
    return cached.data;
  }

  try {
    const requestData: FreightCalculationRequest = {
      token,
      codCliente,
      tipoCalculo: "",
      pontos: [
        {
          rua: "-",
          cep: INITIAL_CEP,
        },
        {
          rua: "-",
          cep: `${cleanCep.slice(0, 5)}-${cleanCep.slice(5)}`, // Formato: 00000-000
        },
      ],
    };

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: FreightCalculationResponse = await response.json();

    // Se sucesso, adicionar ao cache
    if ("Sucesso" in result) {
      cache.set(cleanCep, { data: result, timestamp: Date.now() });
    }

    return result;
  } catch (error) {
    console.error("Erro ao calcular frete:", error);
    return {
      Erro: "Erro ao calcular frete. Por favor, tente novamente.",
    };
  }
}

export async function clearFreightCache() {
  cache.clear();
}
*/

// Manter função de limpeza de cache
export async function clearFreightCache() {
  frenetCache.clear();
}
