/**
 * Mapeamento dos grupos DRE nativos do Bling (campo `idGrupoDre` em
 * `/categorias/receitas-despesas`) para os grupos que aparecem no nosso DRE.
 *
 * Fonte: exploração API em 2026-04-18 (ver docs/2026-04-18-dre-admin-pedidos/ACHADOS-API.md).
 */

export type GrupoDRELocal =
  | "despesa_operacional" // aparece como despesa no DRE
  | "ignorar"; // impostos, transferências, financeiras — fora do DRE da doc

export const BLING_IDGRUPODRE_PARA_LOCAL: Record<number, GrupoDRELocal> = {
  1: "ignorar", // Compras (CPV vem de custo interno, não daqui)
  2: "ignorar", // Vendas de produtos (receita vem de NFe)
  3: "ignorar", // Deduções (doc não pediu)
  5: "ignorar", // CPV Bling (usamos interno)
  7: "despesa_operacional", // ← Despesas operacionais (30 categorias)
  8: "ignorar", // Receitas financeiras
  9: "ignorar", // Despesas financeiras (doc: não considerar juros)
  10: "ignorar", // Outras receitas
  11: "ignorar", // Outras despesas
  13: "ignorar", // Impostos (doc: não considerar)
};

/**
 * Sub-classificação dentro de `idGrupoDre=7` — usando os 3 pais naturais do Bling:
 *   14693216860 = Despesas comerciais   → Marketing
 *   14693216868 = Despesas administrativas → Administrativo
 *   14693216882 = Despesas com pessoal  → Operacional
 *
 * Categorias pai não mapeadas aqui → "outros".
 */
export type SubgrupoOperacional = "marketing" | "administrativo" | "operacional" | "outros";

export const CATEGORIA_PAI_PARA_SUBGRUPO: Record<number, SubgrupoOperacional> = {
  14693216860: "marketing",
  14693216868: "administrativo",
  14693216882: "operacional",
};

export const SUBGRUPO_LABEL: Record<SubgrupoOperacional, string> = {
  marketing: "Marketing",
  operacional: "Operacional",
  administrativo: "Administrativo",
  outros: "Outros",
};
