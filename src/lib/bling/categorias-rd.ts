import { blingGet, sleep, BLING_RATE_LIMIT_DELAY_MS } from "./http";

export interface BlingCategoriaRD {
  id: number;
  idCategoriaPai: number;
  descricao: string;
  tipo: number;
  idGrupoDre: number | null;
  situacao?: number;
}

/**
 * Lista todas as categorias de receitas e despesas (paginado).
 * Raramente muda — cachear no caller se necessário.
 */
export async function listCategoriasReceitasDespesas(): Promise<BlingCategoriaRD[]> {
  const results: BlingCategoriaRD[] = [];
  const limite = 100;
  let pagina = 1;

  while (true) {
    const qs = new URLSearchParams({ limite: String(limite), pagina: String(pagina) });
    const body = await blingGet<{ data?: BlingCategoriaRD[] }>(
      `/categorias/receitas-despesas?${qs}`,
      `listCategoriasRD p=${pagina}`
    );
    const data = body.data || [];
    results.push(...data);
    if (data.length < limite) break;
    pagina++;
    if (pagina > 50) break;
    await sleep(BLING_RATE_LIMIT_DELAY_MS);
  }

  return results;
}
