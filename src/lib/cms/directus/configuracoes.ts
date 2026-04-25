import { getDirectusConfig } from "../client";
import { FREE_SHIPPING_THRESHOLD } from "@/core/pricing/shipping-constants";

export interface ConfiguracoesLoja {
  freteGratisValor: number;
}

const REVALIDATE_SECONDS = 3600; // 1 hora

export async function fetchConfiguracoesLoja(): Promise<ConfiguracoesLoja> {
  try {
    const cfg = getDirectusConfig();
    const res = await fetch(
      `${cfg.baseUrl}/items/configuracoes_loja?fields=frete_gratis_valor`,
      {
        headers: cfg.getHeaders(),
        next: { revalidate: REVALIDATE_SECONDS, tags: ["configuracoes_loja"] },
      }
    );
    if (!res.ok) throw new Error(`Directus retornou ${res.status}`);
    const json = await res.json();
    const valor = Number(json?.data?.frete_gratis_valor);
    if (!Number.isFinite(valor) || valor <= 0) throw new Error("Valor inválido");
    return { freteGratisValor: valor };
  } catch (e) {
    console.warn("[configuracoes_loja] Directus indisponível, usando fallback hardcoded:", e);
    return { freteGratisValor: FREE_SHIPPING_THRESHOLD };
  }
}
