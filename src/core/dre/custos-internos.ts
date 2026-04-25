/**
 * Custo interno (CPV) por SKU. Fonte: base interna da Lovè (não usar CMV do Bling).
 *
 * Indexado por `codigo` do produto no Bling (campo que vem em `nfe/{id}.itens[].codigo`).
 * Fallback por descrição para itens cujo código ainda não está mapeado aqui.
 *
 * Para atualizar: edite este arquivo. Quando a tabela crescer, migrar para tabela
 * Prisma editável via UI admin.
 */

export const CUSTO_INTERNO_POR_CODIGO: Record<string, number> = {
  "8": 44.9,   // Espuma Facial
  "4": 58.54,  // Hidratante Facial
  "10": 45.7,  // Sérum Facial
  "107": 44.17, // Máscara de Argila
  // "?": 56.45, // Manteiga — código a descobrir quando aparecer em NF
};

export const CUSTO_INTERNO_POR_DESCRICAO: Record<string, number> = {
  "Espuma Facial": 44.9,
  "Hidratante Facial": 58.54,
  "Sérum Facial": 45.7,
  "Máscara de Argila": 44.17,
  "Manteiga": 56.45,
  "Manteiga Corporal": 56.45,
};

export interface ItemNf {
  codigo: string;
  descricao: string;
  quantidade: number;
}

export interface CustoLookup {
  custoUnitario: number | null;
  fonte: "codigo" | "descricao" | "nao_encontrado";
}

export function lookupCustoInterno(item: ItemNf): CustoLookup {
  const porCodigo = CUSTO_INTERNO_POR_CODIGO[item.codigo];
  if (porCodigo != null) return { custoUnitario: porCodigo, fonte: "codigo" };

  const porDescricao = CUSTO_INTERNO_POR_DESCRICAO[item.descricao];
  if (porDescricao != null) return { custoUnitario: porDescricao, fonte: "descricao" };

  return { custoUnitario: null, fonte: "nao_encontrado" };
}
