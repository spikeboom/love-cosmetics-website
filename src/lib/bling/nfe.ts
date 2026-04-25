import { blingGet, sleep, BLING_RATE_LIMIT_DELAY_MS } from "./http";

export interface BlingNfeListItem {
  id: number;
  tipo: number;
  situacao: number;
  numero: string;
  dataEmissao: string;
  dataOperacao?: string;
  chaveAcesso?: string;
  contato?: { id: number; nome?: string };
}

export interface BlingNfeItem {
  codigo: string;
  descricao: string;
  unidade?: string;
  quantidade: number;
  valor: number;
  valorTotal: number;
  gtin?: string;
}

export interface BlingNfeDetalhe extends BlingNfeListItem {
  valorNota: number;
  valorFrete: number;
  itens: BlingNfeItem[];
}

/**
 * Lista NFes emitidas no período (tipo=1 saída, situacao=5 autorizada por padrão).
 * Percorre páginas até esgotar.
 */
export async function listNfes(params: {
  dataEmissaoInicial: string;
  dataEmissaoFinal: string;
  tipo?: number;
  situacao?: number;
  limite?: number;
}): Promise<BlingNfeListItem[]> {
  const { dataEmissaoInicial, dataEmissaoFinal, tipo = 1, situacao = 5, limite = 100 } = params;
  const results: BlingNfeListItem[] = [];
  let pagina = 1;

  while (true) {
    const qs = new URLSearchParams({
      tipo: String(tipo),
      situacao: String(situacao),
      dataEmissaoInicial,
      dataEmissaoFinal,
      limite: String(limite),
      pagina: String(pagina),
    }).toString();

    const body = await blingGet<{ data?: BlingNfeListItem[] }>(
      `/nfe?${qs}`,
      `listNfes p=${pagina}`
    );
    const data = body.data || [];
    results.push(...data);
    if (data.length < limite) break;
    pagina++;
    if (pagina > 100) break; // safety
    await sleep(BLING_RATE_LIMIT_DELAY_MS);
  }

  return results;
}

/**
 * Busca o detalhe de uma NFe (com itens, valorNota, valorFrete).
 */
export async function getNfeDetalhe(id: number): Promise<BlingNfeDetalhe | null> {
  const body = await blingGet<{ data?: BlingNfeDetalhe }>(
    `/nfe/${id}`,
    `getNfeDetalhe ${id}`
  );
  return body.data || null;
}

/**
 * Busca detalhe de múltiplas NFes respeitando o rate limit (3 req/s).
 */
export async function getNfeDetalhes(ids: number[]): Promise<BlingNfeDetalhe[]> {
  const out: BlingNfeDetalhe[] = [];
  for (const id of ids) {
    const det = await getNfeDetalhe(id);
    if (det) out.push(det);
    await sleep(BLING_RATE_LIMIT_DELAY_MS);
  }
  return out;
}
