"use server";

import { prisma } from "@/lib/prisma";

export const fetchCupom = async ({ code }: { code: string }): Promise<any> => {
  const baseURL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";
  const codigo = String(code || "").trim().toUpperCase();

  if (!codigo) {
    return { data: [] };
  }

  const endpoint = `${baseURL}/api/cupoms?filters[codigo][$eq]=${encodeURIComponent(
    codigo,
  )}&populate=*`;

  const response = await fetch(endpoint, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}`,
    },
    cache: "no-store", // Ajuste conforme necessário: "no-store" para evitar cache em SSR
  });

  if (!response.ok) {
    throw new Error("Failed to fetch cupom by code");
  }

  const result = await response.json();
  const cupom = result?.data?.[0];

  if (!cupom) return result;

  // Keep the response shape (data array) but filter invalid coupons for UX.
  const empty = { ...(result || {}), data: [] };

  if (cupom.ativo === false) return empty;

  if (cupom.data_expiracao) {
    const expiracao = new Date(cupom.data_expiracao);
    if (Number.isFinite(expiracao.getTime()) && expiracao < new Date()) {
      return empty;
    }
  }

  if (typeof cupom.usos_restantes === "number") {
    if (cupom.usos_restantes <= 0) return empty;

    // Enforce global max uses using our DB reservation table.
    const now = new Date();
    const activeCount = await (prisma as any).cupomReserva.count({
      where: {
        codigo: String(cupom.codigo || "").trim().toUpperCase(),
        OR: [
          { status: "CONSUMED" },
          { status: "RESERVED", expiresAt: { gt: now } },
        ],
      },
    });

    if (activeCount >= cupom.usos_restantes) return empty;
  }

  return result;
};
