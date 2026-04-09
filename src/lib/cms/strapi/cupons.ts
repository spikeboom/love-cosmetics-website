/**
 * Implementação Strapi dos fetches de cupons
 */

import { getStrapiConfig } from "../client";
import type { CupomCms, CupomValidationResult } from "../types";

export async function fetchAndValidateCupom(codigo: string): Promise<CupomValidationResult> {
  const { baseUrl, getHeaders } = getStrapiConfig();

  const endpoint = `${baseUrl}/api/cupoms?filters[codigo][$eq]=${codigo}&populate=*`;

  const response = await fetch(endpoint, {
    method: "GET",
    headers: getHeaders(),
    cache: "no-store",
  });

  if (!response.ok) return { valido: false, cupom: null, erro: "Erro ao buscar cupom" };

  const result = await response.json();
  const cupom = result.data?.[0];

  if (!cupom) return { valido: false, cupom: null, erro: "Cupom não encontrado" };
  if (cupom.ativo === false) return { valido: false, cupom: null, erro: "Cupom inativo" };

  if (cupom.data_expiracao) {
    const expiracao = new Date(cupom.data_expiracao);
    if (expiracao < new Date()) return { valido: false, cupom: null, erro: "Cupom expirado" };
  }

  if (cupom.usos_restantes !== undefined && cupom.usos_restantes <= 0) {
    return { valido: false, cupom: null, erro: "Cupom esgotado" };
  }

  return {
    valido: true,
    cupom: {
      codigo: cupom.codigo,
      multiplacar: cupom.multiplacar ?? 1,
      diminuir: cupom.diminuir ?? 0,
      ativo: cupom.ativo,
      data_expiracao: cupom.data_expiracao,
      usos_restantes: cupom.usos_restantes,
    },
  };
}
