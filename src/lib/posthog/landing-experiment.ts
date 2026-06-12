export type LandingExperimentVariantId = "lp1" | "lp2" | "lp3";

export const LANDING_EXPERIMENT_FLAG_KEY = "landing-proposta-meta";
export const LANDING_EXPERIMENT_COOKIE_NAME = "nl_variant_user_id";
export const LANDING_EXPERIMENT_ROUTE = "/landing-pages/nova-love";
export const LANDING_FORM_ROUTE = "/landing-pages/formulario";

export const landingExperimentVariants = ["lp1", "lp2", "lp3"] as const;
export type LandingSiteEnvironment = "local" | "dev" | "production" | "unknown";

export type LandingSiteProperties = {
  site_environment: LandingSiteEnvironment;
  site_host?: string;
  site_origin?: string;
};

export const landingExperimentProposalByVariant: Record<
  LandingExperimentVariantId,
  string
> = {
  lp1: "biotecnologia",
  lp2: "amazonia",
  lp3: "ciencia",
};

export function isLandingExperimentVariant(
  value: unknown,
): value is LandingExperimentVariantId {
  return (
    typeof value === "string" &&
    landingExperimentVariants.includes(value as LandingExperimentVariantId)
  );
}

export function getFallbackLandingVariant(
  distinctId: string,
): LandingExperimentVariantId {
  let hash = 5381;

  for (let i = 0; i < distinctId.length; i += 1) {
    hash = (hash * 33) ^ distinctId.charCodeAt(i);
  }

  const index = Math.abs(hash) % landingExperimentVariants.length;
  return landingExperimentVariants[index];
}

export function createLandingVisitorId() {
  const uuid = globalThis.crypto?.randomUUID?.();
  return `nl_${uuid ?? `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`}`;
}

export function pickFirstSearchParam(
  value: string | string[] | undefined,
): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export function buildLandingUtmProperties(
  params: Record<string, string | string[] | undefined>,
) {
  return {
    utm_source: pickFirstSearchParam(params.utm_source),
    utm_medium: pickFirstSearchParam(params.utm_medium),
    utm_campaign: pickFirstSearchParam(params.utm_campaign),
    utm_content: pickFirstSearchParam(params.utm_content),
    utm_term: pickFirstSearchParam(params.utm_term),
    utm_id: pickFirstSearchParam(params.utm_id),
    meta_ad_id: pickFirstSearchParam(params.meta_ad_id),
    meta_adset_id: pickFirstSearchParam(params.meta_adset_id),
    fbclid: pickFirstSearchParam(params.fbclid),
  };
}

export function inferLandingSiteEnvironment(
  hostOrUrl: string | null | undefined,
): LandingSiteEnvironment {
  const host = normalizeLandingSiteHost(hostOrUrl);

  if (!host) return "unknown";
  if (
    host === "localhost" ||
    host.startsWith("localhost:") ||
    host === "127.0.0.1" ||
    host.startsWith("127.0.0.1:") ||
    host.endsWith(".ngrok-free.dev")
  ) {
    return "local";
  }
  if (host === "dev.lovecosmetics.com.br") return "dev";
  if (
    host === "www.lovecosmetics.com.br" ||
    host === "lovecosmetics.com.br"
  ) {
    return "production";
  }

  return "unknown";
}

export function normalizeLandingSiteHost(
  hostOrUrl: string | null | undefined,
) {
  const value = hostOrUrl?.trim().toLowerCase();
  if (!value) return undefined;

  try {
    const url = new URL(value.includes("://") ? value : `https://${value}`);
    return url.host;
  } catch {
    return value.split("/")[0];
  }
}

export function buildLandingSiteProperties({
  host,
  protocol,
  origin,
}: {
  host?: string | null;
  protocol?: string | null;
  origin?: string | null;
}): LandingSiteProperties {
  const normalizedHost =
    normalizeLandingSiteHost(origin) || normalizeLandingSiteHost(host);
  const siteProtocol =
    protocol?.split(",")[0]?.trim() ||
    (normalizedHost?.startsWith("localhost") ||
    normalizedHost?.startsWith("127.0.0.1")
      ? "http"
      : "https");

  return {
    site_environment: inferLandingSiteEnvironment(normalizedHost || origin),
    site_host: normalizedHost,
    site_origin: normalizedHost ? `${siteProtocol}://${normalizedHost}` : origin || undefined,
  };
}

export function buildLandingSitePropertiesFromUrl(
  url: string | null | undefined,
): LandingSiteProperties {
  const normalizedHost = normalizeLandingSiteHost(url);
  let origin: string | undefined;

  if (url) {
    try {
      origin = new URL(url).origin;
    } catch {
      origin = undefined;
    }
  }

  return {
    site_environment: inferLandingSiteEnvironment(normalizedHost),
    site_host: normalizedHost,
    site_origin: origin,
  };
}

export function buildFormQueryString(
  params: Record<string, string | string[] | undefined>,
  variant: LandingExperimentVariantId,
  visitorId?: string,
) {
  const query = new URLSearchParams();
  query.set("variant", variant);
  if (visitorId) query.set("visitor_id", visitorId);

  for (const key of [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_content",
    "utm_term",
  ]) {
    const value = pickFirstSearchParam(params[key]);
    if (value) query.set(key, value);
  }

  return query.toString();
}
