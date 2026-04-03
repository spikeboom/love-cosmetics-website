/**
 * Produtos atualmente fora de estoque.
 * Para esgotar ou repor um produto, editar este array.
 */
export const PRODUTOS_ESGOTADOS_SLUGS: string[] = [
  "mascara-de-argila",
  "kit-completo",
];

export function isEsgotado(slug: string | undefined | null): boolean {
  if (!slug) return false;
  return PRODUTOS_ESGOTADOS_SLUGS.includes(slug);
}
