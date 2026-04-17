import { getDirectusConfig } from "../client";

export interface Depoimento {
  id: string | number;
  nome: string;
  texto: string;
  data: string;
  estrelas: number;
  avatarUrl: string | null;
}

const REVALIDATE_SECONDS = 3600;

const MESES_PT = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez",
];

function formatarDataPt(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!m) return iso;
  const [, ano, mes, dia] = m;
  const mesIdx = parseInt(mes, 10) - 1;
  return `${parseInt(dia, 10)} de ${MESES_PT[mesIdx] ?? mes}, ${ano}`;
}

function assetUrl(
  fileId: string | null | undefined,
  publicUrl: string,
  opts?: { width?: number; quality?: number; format?: "webp" | "jpg" | "auto" }
): string | null {
  if (!fileId) return null;
  const token = process.env.DIRECTUS_API_TOKEN;
  const params = new URLSearchParams();
  if (opts?.width) params.set("width", String(opts.width));
  if (opts?.quality) params.set("quality", String(opts.quality));
  if (opts?.format && opts.format !== "auto") params.set("format", opts.format);
  if (token) params.set("access_token", token);
  const qs = params.toString();
  return `${publicUrl}/assets/${fileId}${qs ? `?${qs}` : ""}`;
}

export async function fetchDepoimentos(): Promise<Depoimento[]> {
  try {
    const cfg = getDirectusConfig();
    const publicUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL || cfg.baseUrl;
    const qs =
      "filter[status][_eq]=published" +
      "&sort[]=sort&sort[]=date_created" +
      "&fields[]=id&fields[]=nome&fields[]=texto&fields[]=data&fields[]=estrelas&fields[]=avatar" +
      "&limit=100";
    const res = await fetch(`${cfg.baseUrl}/items/depoimentos?${qs}`, {
      headers: cfg.getHeaders(),
      next: { revalidate: REVALIDATE_SECONDS, tags: ["depoimentos"] },
    });
    if (!res.ok) throw new Error(`Directus retornou ${res.status}`);
    const json = await res.json();
    const rows = Array.isArray(json?.data) ? json.data : [];

    return rows.map((r: any): Depoimento => ({
      id: r.id,
      nome: r.nome ?? "",
      texto: r.texto ?? "",
      data: formatarDataPt(r.data ?? ""),
      estrelas: typeof r.estrelas === "number" ? r.estrelas : 5,
      avatarUrl: assetUrl(r.avatar, publicUrl, { width: 96, quality: 82, format: "webp" }),
    }));
  } catch (e) {
    console.warn("[depoimentos] Directus indisponível:", e);
    return [];
  }
}
