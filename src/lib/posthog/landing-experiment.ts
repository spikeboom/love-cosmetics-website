export type LandingExperimentVariantId = "lp1" | "lp2" | "lp3";

export const LANDING_EXPERIMENT_FLAG_KEY = "landing-proposta-meta";
export const LANDING_EXPERIMENT_COOKIE_NAME = "nl_variant_user_id";
export const LANDING_EXPERIMENT_ROUTE = "/landing-pages/nova-love";
export const LANDING_FORM_ROUTE = "/landing-pages/formulario";

export const landingExperimentVariants = ["lp1", "lp2", "lp3"] as const;

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
