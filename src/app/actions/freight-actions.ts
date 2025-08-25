"use server";

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

// Cache para evitar chamadas desnecessárias
const cache = new Map<
  string,
  { data: FreightCalculationSuccess; timestamp: number }
>();
const cacheTimeout = 0; // 1000 * 60 * 30; // 30 minutos

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

    console.log({ result });

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
