/**
 * Re-exporta de lib/cms/cupons para compatibilidade com imports legados.
 * Para novo código, importe de @/lib/cms/cupons diretamente.
 */
export type { CupomCms as CupomStrapi, CupomValidationResult } from "@/lib/cms/types";
export { fetchAndValidateCupom } from "@/lib/cms/cupons";
