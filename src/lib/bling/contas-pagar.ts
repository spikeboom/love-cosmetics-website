import { blingGet, sleep, BLING_RATE_LIMIT_DELAY_MS } from "./http";

export interface BlingContaPagarListItem {
  id: number;
  situacao: number;
  vencimento: string;
  valor: number;
  contato?: { id: number };
  formaPagamento?: { id: number };
}

export interface BlingContaPagarDetalhe extends BlingContaPagarListItem {
  saldo?: number;
  dataEmissao?: string;
  vencimentoOriginal?: string;
  competencia?: string;
  historico?: string;
  categoria?: { id: number };
  numeroDocumento?: string;
}

export type ContasPagarDateFilter =
  | { dataEmissaoInicial: string; dataEmissaoFinal: string }
  | { dataVencimentoInicial: string; dataVencimentoFinal: string }
  | { dataPagamentoInicial: string; dataPagamentoFinal: string };

/**
 * Lista contas a pagar no período com filtro de data flexível.
 * Percorre todas as páginas.
 */
export async function listContasPagar(
  filter: ContasPagarDateFilter & { limite?: number; situacao?: number }
): Promise<BlingContaPagarListItem[]> {
  const { limite = 100, situacao, ...dateFilter } = filter;
  const results: BlingContaPagarListItem[] = [];
  let pagina = 1;

  while (true) {
    const params = new URLSearchParams({ limite: String(limite), pagina: String(pagina) });
    if (situacao != null) params.set("situacao", String(situacao));
    for (const [k, v] of Object.entries(dateFilter)) {
      if (v) params.set(k, String(v));
    }

    const body = await blingGet<{ data?: BlingContaPagarListItem[] }>(
      `/contas/pagar?${params}`,
      `listContasPagar p=${pagina}`
    );
    const data = body.data || [];
    results.push(...data);
    if (data.length < limite) break;
    pagina++;
    if (pagina > 100) break;
    await sleep(BLING_RATE_LIMIT_DELAY_MS);
  }

  return results;
}

export async function getContaPagarDetalhe(id: number): Promise<BlingContaPagarDetalhe | null> {
  const body = await blingGet<{ data?: BlingContaPagarDetalhe }>(
    `/contas/pagar/${id}`,
    `getContaPagarDetalhe ${id}`
  );
  return body.data || null;
}

/**
 * Detalhe de várias contas respeitando rate limit.
 */
export async function getContasPagarDetalhes(ids: number[]): Promise<BlingContaPagarDetalhe[]> {
  const out: BlingContaPagarDetalhe[] = [];
  for (const id of ids) {
    const det = await getContaPagarDetalhe(id);
    if (det) out.push(det);
    await sleep(BLING_RATE_LIMIT_DELAY_MS);
  }
  return out;
}
