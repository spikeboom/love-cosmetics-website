import { getDirectusConfig } from "../client";

const COLLECTION = "app_config";

export async function getConfigValue(key: string): Promise<string | null> {
  const cfg = getDirectusConfig();
  const res = await fetch(
    `${cfg.baseUrl}/items/${COLLECTION}?filter[key][_eq]=${encodeURIComponent(key)}&fields=value&limit=1`,
    { headers: cfg.getHeaders(), cache: "no-store" }
  );
  if (!res.ok) throw new Error(`Directus ${COLLECTION} get falhou: ${res.status}`);
  const json = await res.json();
  const row = Array.isArray(json?.data) ? json.data[0] : null;
  return row?.value ?? null;
}

export async function getConfigValues(keys: string[]): Promise<Record<string, string | null>> {
  if (keys.length === 0) return {};
  const cfg = getDirectusConfig();
  const filter = encodeURIComponent(JSON.stringify({ key: { _in: keys } }));
  const res = await fetch(
    `${cfg.baseUrl}/items/${COLLECTION}?filter=${filter}&fields=key,value&limit=${keys.length}`,
    { headers: cfg.getHeaders(), cache: "no-store" }
  );
  if (!res.ok) throw new Error(`Directus ${COLLECTION} getMany falhou: ${res.status}`);
  const json = await res.json();
  const rows: Array<{ key: string; value: string | null }> = Array.isArray(json?.data) ? json.data : [];
  const out: Record<string, string | null> = {};
  for (const k of keys) out[k] = null;
  for (const r of rows) out[r.key] = r.value;
  return out;
}

export async function setConfigValue(key: string, value: string, note?: string): Promise<void> {
  const cfg = getDirectusConfig();
  const existing = await fetch(
    `${cfg.baseUrl}/items/${COLLECTION}?filter[key][_eq]=${encodeURIComponent(key)}&fields=id&limit=1`,
    { headers: cfg.getHeaders(), cache: "no-store" }
  );
  if (!existing.ok) throw new Error(`Directus ${COLLECTION} lookup falhou: ${existing.status}`);
  const existingJson = await existing.json();
  const row = Array.isArray(existingJson?.data) ? existingJson.data[0] : null;

  const body: Record<string, unknown> = { value };
  if (note !== undefined) body.note = note;

  if (row?.id) {
    const res = await fetch(`${cfg.baseUrl}/items/${COLLECTION}/${row.id}`, {
      method: "PATCH",
      headers: cfg.getHeaders(),
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`Directus ${COLLECTION} update falhou: ${res.status} ${await res.text()}`);
  } else {
    const res = await fetch(`${cfg.baseUrl}/items/${COLLECTION}`, {
      method: "POST",
      headers: cfg.getHeaders(),
      body: JSON.stringify({ key, ...body }),
    });
    if (!res.ok) throw new Error(`Directus ${COLLECTION} create falhou: ${res.status} ${await res.text()}`);
  }
}
