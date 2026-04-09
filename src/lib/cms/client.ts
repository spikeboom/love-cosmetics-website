/**
 * CMS Client - switch entre Strapi e Directus via env var CMS_PROVIDER
 */

export type CmsProvider = "strapi" | "directus";

export function getCmsProvider(): CmsProvider {
  const provider = process.env.CMS_PROVIDER as CmsProvider;
  if (provider === "directus") return "directus";
  return "strapi"; // default
}

export function getStrapiConfig() {
  return {
    baseUrl: process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337",
    token: process.env.STRAPI_API_TOKEN,
    getHeaders() {
      return {
        "Content-Type": "application/json",
        ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
      };
    },
    getImageUrl(path: string) {
      if (!path) return "";
      if (path.startsWith("http")) return path;
      return `${this.baseUrl}${path}`;
    },
  };
}

export function getDirectusConfig() {
  // Em SSR usamos URL interna (sem sair pela internet); no browser, URL pública
  const isServer = typeof window === "undefined";
  const baseUrl = isServer
    ? (process.env.DIRECTUS_INTERNAL_URL || process.env.NEXT_PUBLIC_DIRECTUS_URL || "http://localhost:8055")
    : (process.env.NEXT_PUBLIC_DIRECTUS_URL || "http://localhost:8055");
  // URL pública sempre usada para assets (renderizados no browser)
  const publicUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL || baseUrl;

  return {
    baseUrl,
    publicUrl,
    token: process.env.DIRECTUS_API_TOKEN,
    getHeaders() {
      return {
        "Content-Type": "application/json",
        ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
      };
    },
    getImageUrl(fileId: string) {
      if (!fileId) return "";
      const token = process.env.DIRECTUS_API_TOKEN;
      if (token) return `${publicUrl}/assets/${fileId}?access_token=${token}`;
      return `${publicUrl}/assets/${fileId}`;
    },
  };
}
