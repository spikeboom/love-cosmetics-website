import { getConfigValue, setConfigValue } from "@/lib/cms/directus/app-config";

const BASE = "https://graph.instagram.com";
const TOKEN_KEY = "instagram_access_token";
const ISSUED_AT_KEY = "instagram_token_issued_at";
const EXPIRES_AT_KEY = "instagram_token_expires_at";

export interface InstagramMediaItem {
  id: string;
  media_type: "VIDEO" | "IMAGE" | "CAROUSEL_ALBUM";
  media_url: string;
  permalink: string;
  thumbnail_url?: string;
  caption?: string;
  timestamp?: string;
}

let cachedToken: { value: string; fetchedAt: number } | null = null;
const TOKEN_CACHE_MS = 10 * 60 * 1000;

export async function getInstagramToken(): Promise<string> {
  if (cachedToken && Date.now() - cachedToken.fetchedAt < TOKEN_CACHE_MS) {
    return cachedToken.value;
  }
  const token = await getConfigValue(TOKEN_KEY);
  if (!token) throw new Error("Instagram token não encontrado em app_config");
  cachedToken = { value: token, fetchedAt: Date.now() };
  return token;
}

export function invalidateTokenCache(): void {
  cachedToken = null;
}

export function extractShortcode(url: string): string | null {
  const m = url.match(/\/(p|reel|tv)\/([A-Za-z0-9_-]+)/);
  return m ? m[2] : null;
}

async function graphGet<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  const token = await getInstagramToken();
  const qs = new URLSearchParams({ ...params, access_token: token });
  const url = `${BASE}${path}?${qs}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Graph API ${path} falhou: ${res.status} ${text.slice(0, 200)}`);
  }
  return res.json();
}

export async function listMyMedia(limit = 25, after?: string): Promise<{
  items: InstagramMediaItem[];
  next?: string;
}> {
  const params: Record<string, string> = {
    fields: "id,media_type,media_url,permalink,thumbnail_url,caption,timestamp",
    limit: String(limit),
  };
  if (after) params.after = after;
  const json = await graphGet<{
    data: InstagramMediaItem[];
    paging?: { cursors?: { after?: string }; next?: string };
  }>("/me/media", params);
  return {
    items: json.data || [],
    next: json.paging?.next ? json.paging.cursors?.after : undefined,
  };
}

export async function findMediaByUrl(instagramUrl: string): Promise<InstagramMediaItem | null> {
  const shortcode = extractShortcode(instagramUrl);
  if (!shortcode) throw new Error(`URL inválida — shortcode não encontrado: ${instagramUrl}`);

  let after: string | undefined;
  for (let page = 0; page < 10; page++) {
    const { items, next } = await listMyMedia(50, after);
    const match = items.find((it) => (it.permalink || "").includes(`/${shortcode}`));
    if (match) return match;
    if (!next) break;
    after = next;
  }
  return null;
}

export async function refreshInstagramToken(): Promise<{
  token: string;
  expiresIn: number;
  issuedAt: string;
  expiresAt: string;
}> {
  const current = await getInstagramToken();
  const res = await fetch(
    `${BASE}/refresh_access_token?grant_type=ig_refresh_token&access_token=${current}`,
    { cache: "no-store" }
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Refresh token falhou: ${res.status} ${text.slice(0, 200)}`);
  }
  const json = (await res.json()) as { access_token: string; expires_in: number };
  const issuedAt = new Date();
  const expiresAt = new Date(issuedAt.getTime() + json.expires_in * 1000);

  await setConfigValue(TOKEN_KEY, json.access_token);
  await setConfigValue(ISSUED_AT_KEY, issuedAt.toISOString());
  await setConfigValue(EXPIRES_AT_KEY, expiresAt.toISOString());
  invalidateTokenCache();

  return {
    token: json.access_token,
    expiresIn: json.expires_in,
    issuedAt: issuedAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
  };
}
