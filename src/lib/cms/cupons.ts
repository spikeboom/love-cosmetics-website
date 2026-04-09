/**
 * Fachada de cupons - delega para Strapi ou Directus conforme CMS_PROVIDER
 */

import { getCmsProvider } from "./client";
import type { CupomValidationResult } from "./types";

async function getImpl() {
  if (getCmsProvider() === "directus") {
    return import("./directus/cupons");
  }
  return import("./strapi/cupons");
}

export async function fetchAndValidateCupom(codigo: string): Promise<CupomValidationResult> {
  const impl = await getImpl();
  return impl.fetchAndValidateCupom(codigo);
}
