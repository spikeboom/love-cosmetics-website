interface FrenetShippingItem {
  Weight: number;
  Length: number;
  Height: number;
  Width: number;
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
  ShippingPrice: number | string;
  DeliveryTime: number | string;
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

const FRENET_API_URL = "https://api.frenet.com.br/shipping/quote";
const FRENET_TOKEN = process.env.FRENET_API_TOKEN || "";
const SELLER_CEP = "69082-230";

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
  }>,
): Promise<FrenetCalculationResponse> {
  const cleanCep = cepDestino.replace(/\D/g, "");
  if (cleanCep.length !== 8) {
    return { success: false, error: "CEP invalido. Deve conter 8 digitos." };
  }

  if (!items || items.length === 0) {
    return { success: false, error: "Nenhum item para calcular frete." };
  }

  try {
    const invoiceValue = items.reduce((sum, item) => sum + item.preco * item.quantity, 0);
    const shippingItems: FrenetShippingItem[] = items.map((item, index) => ({
      Weight: (item.peso_gramas || 200) / 1000,
      Length: item.comprimento || 10,
      Height: item.altura || 10,
      Width: item.largura || 10,
      Quantity: item.quantity,
      SKUCode: item.bling_number ? String(item.bling_number) : `ITEM-${index + 1}`,
    }));

    const requestData: FrenetQuoteRequest = {
      SellerCEP: SELLER_CEP.replace(/\D/g, ""),
      RecipientCEP: cleanCep,
      ShipmentInvoiceValue: invoiceValue,
      ShippingItemArray: shippingItems,
      RecipientCountry: "BR",
    };

    const response = await fetch(FRENET_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        token: FRENET_TOKEN,
      },
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
      throw new Error(`Frenet API error! status: ${response.status}`);
    }

    const result: FrenetQuoteResponse = await response.json();
    if (!result.ShippingSevicesArray || result.ShippingSevicesArray.length === 0) {
      return { success: false, error: "Nenhum servico de entrega disponivel para este CEP." };
    }

    const validServices = result.ShippingSevicesArray.filter((service) => !service.Error);
    if (validServices.length === 0) {
      const firstError = result.ShippingSevicesArray[0]?.Error || "Erro desconhecido";
      return { success: false, error: firstError };
    }

    const services = validServices.map((service) => ({
      carrier: service.Carrier,
      service: service.ServiceDescription,
      price:
        typeof service.ShippingPrice === "string"
          ? parseFloat(service.ShippingPrice)
          : service.ShippingPrice,
      deliveryTime:
        typeof service.DeliveryTime === "string"
          ? parseInt(service.DeliveryTime, 10)
          : service.DeliveryTime,
      serviceCode: service.ServiceCode,
    }));

    if (process.env.NEXT_PUBLIC_DEV_TOOLS === "true") {
      services.unshift({
        carrier: "[DEV]",
        service: "Frete Teste",
        price: 0.1,
        deliveryTime: 1,
        serviceCode: "DEV_TEST",
      });
    }

    const cheapest = services.reduce((min, service) => (service.price < min.price ? service : min));
    return { success: true, services, cheapest };
  } catch (error) {
    console.error("Erro ao calcular frete com Frenet:", error);
    return {
      success: false,
      error: "Erro ao calcular frete. Por favor, tente novamente.",
    };
  }
}
