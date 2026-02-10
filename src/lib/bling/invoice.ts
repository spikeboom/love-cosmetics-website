import { createLogger } from "@/utils/logMessage";
import { makeAuthenticatedRequest } from "./simple-auth";
import { getKitComponentSlugs } from "@/core/pricing/kits";
import { fetchProdutosBySlugs } from "@/lib/strapi/produtos";

const logMessage = createLogger();

const BLING_API_BASE_URL = "https://api.bling.com.br/Api/v3";

// Interface para dados de tributação do produto
interface TributacaoProduto {
  origem?: number;
  ncm?: string;
  cest?: string;
}

// Interface para resposta do produto do Bling
interface BlingProdutoResponse {
  data?: {
    tributacao?: TributacaoProduto;
  };
}

// Interface para item do pedido
interface OrderItem {
  id: number | string;
  name: string;
  quantity: number;
  value: number;
  discount?: number;
  reference_id?: string | number;
  unit_amount?: number;
  preco?: number;
  bling_number?: number;
  /** Nome do kit de origem (preenchido quando o item veio de um kit explodido) */
  fromKit?: string;
}

// Interface para dados do pedido
interface OrderData {
  id: string;
  items: OrderItem[];
  additionalInfo?: string;
  // Dados do cliente do formulário
  nome: string;
  sobrenome: string;
  email: string;
  telefone: string;
  cpf: string;
  endereco: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cep: string;
  cidade: string;
  estado: string;
  // Dados de frete
  frete_calculado?: number;
  transportadora_nome?: string;
  transportadora_servico?: string;
  transportadora_prazo?: number;
  // Desconto do pedido (nível do documento, apenas pedidos admin)
  desconto_total?: number;
}

// Interface para resposta da API do Bling
interface BlingNFResponse {
  data?: {
    id: number;
    numero: number;
    serie: number;
  };
  errors?: Array<{
    message: string;
    code: string;
  }>;
}

// Busca dados fiscais do produto no Bling
async function getProdutoTributacao(produtoId: number): Promise<TributacaoProduto> {
  try {
    const response = await makeAuthenticatedRequest(
      `${BLING_API_BASE_URL}/produtos/${produtoId}`
    );

    if (!response.ok) {
      logMessage("Erro ao buscar dados do produto", {
        produtoId,
        status: response.status
      });
      return {};
    }

    const data: BlingProdutoResponse = await response.json();
    return data.data?.tributacao || {};
  } catch (error) {
    logMessage("Erro ao buscar tributação do produto", {
      produtoId,
      error
    });
    return {};
  }
}

// Monta os dados de transporte para a NF
function buildTransporteData(orderData: OrderData) {
  const transporte: any = {
    // 0 = CIF (frete por conta do remetente)
    // 1 = FOB (frete por conta do destinatário)
    fretePorConta: 0, // CIF - vendedor paga o frete
  };

  // Adiciona valor do frete se disponível
  // Campo "frete" conforme schema oficial da API v3 do Bling
  // Arredondar para 2 casas decimais para evitar problemas de floating point
  if (orderData.frete_calculado && orderData.frete_calculado > 0) {
    transporte.frete = Math.round(orderData.frete_calculado * 100) / 100;
  }

  // Adiciona volume básico (quantidade)
  transporte.volume = {
    quantidade: 1
  };

  // Adiciona dados da transportadora se disponíveis
  // Campo "transportador" (não "transportadora") conforme schema oficial
  if (orderData.transportadora_nome) {
    transporte.transportador = {
      nome: orderData.transportadora_nome
    };
  }

  // Adiciona volumes com serviço de rastreamento se disponível
  if (orderData.transportadora_servico) {
    transporte.volumes = [
      {
        servico: orderData.transportadora_servico
      }
    ];
  }

  logMessage("Dados de transporte montados", {
    orderId: orderData.id,
    fretePorConta: transporte.fretePorConta,
    frete: transporte.frete,
    transportador: orderData.transportadora_nome,
    servico: orderData.transportadora_servico
  });

  return transporte;
}

/**
 * Explode itens de kits em seus componentes individuais,
 * buscando dados atualizados do Strapi e rateando o valor proporcionalmente.
 */
async function explodeKitItems(items: OrderItem[]): Promise<OrderItem[]> {
  const result: OrderItem[] = [];

  // Coleta todos os slugs necessários de uma vez
  const allSlugs = new Set<string>();
  const kitInfos: Array<{ index: number; slugs: string[] }> = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const componentSlugs = getKitComponentSlugs({ nome: item.name });
    if (componentSlugs) {
      kitInfos.push({ index: i, slugs: componentSlugs });
      for (const slug of componentSlugs) {
        allSlugs.add(slug);
      }
    }
  }

  // Se não há kits, retorna os itens originais
  if (kitInfos.length === 0) return items;

  // Busca todos os componentes de uma só vez no Strapi
  const produtosMap = await fetchProdutosBySlugs(Array.from(allSlugs));

  const kitIndices = new Set(kitInfos.map((k) => k.index));

  for (let i = 0; i < items.length; i++) {
    if (!kitIndices.has(i)) {
      // Item normal, mantém como está
      result.push(items[i]);
      continue;
    }

    const item = items[i];
    const kitInfo = kitInfos.find((k) => k.index === i)!;

    // Valida que todos os componentes foram encontrados
    const componentes = kitInfo.slugs.map((slug) => {
      const produto = produtosMap.get(slug);
      if (!produto) {
        throw new Error(
          `Componente "${slug}" do kit "${item.name}" não encontrado no Strapi`
        );
      }
      if (!produto.bling_number) {
        throw new Error(
          `Componente "${slug}" do kit "${item.name}" não possui bling_number no Strapi`
        );
      }
      return produto;
    });

    // Preço unitário do kit (valor de 1 unidade)
    const kitUnitPrice = item.preco || item.unit_amount || item.value;

    // Soma dos preços de tabela dos componentes (para calcular peso proporcional)
    const somaPrecos = componentes.reduce((sum, c) => sum + c.preco, 0);

    if (somaPrecos === 0) {
      throw new Error(
        `Soma dos preços dos componentes do kit "${item.name}" é zero`
      );
    }

    // Rateio proporcional do preço UNITÁRIO do kit entre componentes
    // Cada componente herda a quantity do kit
    let acumulado = 0;
    const explodedItems: OrderItem[] = [];

    for (let j = 0; j < componentes.length; j++) {
      const comp = componentes[j];
      let valorRateado: number;

      if (j < componentes.length - 1) {
        const peso = comp.preco / somaPrecos;
        valorRateado = Math.round(peso * kitUnitPrice * 100) / 100;
        acumulado += valorRateado;
      } else {
        // Último componente: ajusta para a soma bater exatamente com o preço unitário do kit
        valorRateado = Math.round((kitUnitPrice - acumulado) * 100) / 100;
      }

      explodedItems.push({
        id: comp.id,
        name: comp.nome,
        quantity: item.quantity, // herda a quantidade do kit
        value: valorRateado,
        preco: valorRateado,
        bling_number: comp.bling_number,
        fromKit: item.name,
      });
    }

    logMessage("Kit explodido em componentes", {
      kitName: item.name,
      kitQuantity: item.quantity,
      kitUnitPrice,
      valorTotalKit: kitUnitPrice * item.quantity,
      componentes: explodedItems.map((e) => ({
        name: e.name,
        quantity: e.quantity,
        valorUnitario: e.preco,
        bling_number: e.bling_number,
      })),
      somaComponentesUnitario: explodedItems.reduce((s, e) => s + (e.preco || 0), 0),
    });

    result.push(...explodedItems);
  }

  return result;
}

// Cria uma nota fiscal no Bling
export async function createInvoice(
  accessToken: string,
  orderData: OrderData
): Promise<BlingNFResponse> {
  try {
    // Explode kits em itens individuais (busca dados do Strapi)
    const expandedItems = await explodeKitItems(orderData.items);

    // Busca dados fiscais de todos os produtos em paralelo
    const produtosComTributacao = await Promise.all(
      expandedItems.map(async (item) => {
        if (!item.bling_number) {
          throw new Error(`Produto ${item.name} não possui bling_number`);
        }
        const tributacao = await getProdutoTributacao(Number(item.bling_number));
        return { item, tributacao };
      })
    );

    // Monta os itens da nota fiscal
    const items = produtosComTributacao.map(({ item, tributacao }) => {
      // IMPORTANTE: Os valores do banco estão em REAIS (não em centavos)
      // Usar preco ou unit_amount diretamente, sem divisão por 100
      // Arredondar para 2 casas decimais para evitar problemas de floating point
      const rawValue = item.preco || item.unit_amount || item.value;
      const unitValue = Math.round(rawValue * 100) / 100;

      const itemNF: any = {
        codigo: String(item.bling_number),
        descricao: item.name,
        unidade: "UN",
        quantidade: item.quantity,
        valor: unitValue,
        tipo: "P", // P = Produto
      };

      // Adiciona informação de que o item veio de um kit desmembrado
      if (item.fromKit) {
        itemNF.informacoesAdicionais = `Componente do ${item.fromKit}`;
      }

      // Adiciona dados fiscais se disponíveis
      if (tributacao.origem !== undefined) {
        itemNF.origem = tributacao.origem;
      }
      if (tributacao.ncm) {
        itemNF.classificacaoFiscal = tributacao.ncm;
      }
      if (tributacao.cest) {
        itemNF.cest = tributacao.cest;
      }

      // Adiciona desconto se houver (arredondado para 2 casas decimais)
      if (item.discount && item.discount > 0) {
        itemNF.desconto = Math.round(item.discount * 100) / 100;
      }

      return itemNF;
    });

    // Monta informações complementares com detalhes de kits desmembrados
    const kitsExplodidos = [...new Set(
      expandedItems.filter(i => i.fromKit).map(i => i.fromKit!)
    )];
    let infoComplementar = orderData.additionalInfo || `Venda pela Internet. Pedido LV-${orderData.id}`;
    if (kitsExplodidos.length > 0) {
      const kitInfo = kitsExplodidos
        .map(kit => `${kit} desmembrado em itens individuais para fins fiscais`)
        .join("; ");
      infoComplementar += `. ${kitInfo}.`;
    }

    // Monta o corpo da requisição
    const invoiceData = {
      tipo: 1, // Nota fiscal de saída
      // numero é gerado automaticamente pelo Bling de forma sequencial
      dataOperacao: new Date().toISOString().split('T')[0] + " " + new Date().toTimeString().split(' ')[0], // Data e hora atual
      numeroPedidoLoja: `LV-${orderData.id}`,
      contato: {
        nome: `${orderData.nome} ${orderData.sobrenome}`,
        tipoPessoa: "F", // Pessoa Física
        numeroDocumento: orderData.cpf.replace(/\D/g, ""), // CPF sem pontuação
        email: orderData.email,
        telefone: orderData.telefone,
        contribuinte: 9, // Não contribuinte
        endereco: {
          endereco: orderData.endereco,
          numero: orderData.numero,
          ...(orderData.complemento ? { complemento: orderData.complemento } : {}),
          bairro: orderData.bairro,
          cep: orderData.cep.replace(/\D/g, ""), // CEP sem pontuação
          municipio: orderData.cidade,
          uf: orderData.estado
        }
      },
      naturezaOperacao: { id: 15106222870 }, // ID fornecido no exemplo
      loja: { id: 205192622 }, // Matriz
      presenca: 2, // Venda pela internet
      consumidorFinal: true,
      informacoesComplementares: infoComplementar,
      ...(orderData.desconto_total && orderData.desconto_total > 0
        ? { desconto: Math.round(orderData.desconto_total * 100) / 100 }
        : {}),
      itens: items,
      transporte: buildTransporteData(orderData)
    };

    logMessage("Dados da NF para envio ao Bling", {
      orderId: orderData.id,
      itemsCount: items.length,
      invoiceData
    });

    // Faz a requisição para criar a nota fiscal
    const response = await makeAuthenticatedRequest(`${BLING_API_BASE_URL}/nfe`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(invoiceData),
    });

    const responseData = await response.json();

    if (!response.ok) {
      logMessage("Erro ao criar nota fiscal no Bling", {
        status: response.status,
        response: responseData,
        orderId: orderData.id
      });
      throw new Error(`Erro ao criar nota fiscal: ${response.status}`);
    }

    logMessage("Nota fiscal criada com sucesso", {
      orderId: orderData.id,
      nfId: responseData.data?.id,
      nfNumero: responseData.data?.numero
    });

    return responseData;
  } catch (error) {
    logMessage("Erro na criação da nota fiscal", {
      orderId: orderData.id,
      error
    });
    throw error;
  }
}

// Consulta uma nota fiscal no Bling
export async function getInvoice(
  accessToken: string,
  invoiceId: number
): Promise<BlingNFResponse> {
  try {
    const response = await makeAuthenticatedRequest(`${BLING_API_BASE_URL}/nfe/${invoiceId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.text();
      logMessage("Erro ao consultar nota fiscal", {
        invoiceId,
        status: response.status,
        error: errorData
      });
      throw new Error(`Erro ao consultar nota fiscal: ${response.status}`);
    }

    const invoiceData = await response.json();
    logMessage("Nota fiscal consultada com sucesso", {
      invoiceId,
      numero: invoiceData.data?.numero
    });

    return invoiceData;
  } catch (error) {
    logMessage("Erro na consulta da nota fiscal", {
      invoiceId,
      error
    });
    throw error;
  }
}