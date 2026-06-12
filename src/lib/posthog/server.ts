import { PostHog, type FeatureFlagEvaluations } from "posthog-node";
import {
  getFallbackLandingVariant,
  isLandingExperimentVariant,
  LANDING_EXPERIMENT_FLAG_KEY,
  landingExperimentProposalByVariant,
  type LandingExperimentVariantId,
} from "./landing-experiment";

type LandingAssignment = {
  variant: LandingExperimentVariantId;
  source: "posthog" | "fallback";
  flags?: FeatureFlagEvaluations;
};

type LandingEventProperties = Record<string, unknown> & {
  variant: LandingExperimentVariantId;
};

const POSTHOG_HOST =
  process.env.POSTHOG_HOST ||
  process.env.NEXT_PUBLIC_POSTHOG_HOST ||
  "https://us.i.posthog.com";

let posthogClient: PostHog | null | undefined;

export function getPostHogServerClient() {
  if (posthogClient !== undefined) return posthogClient;

  const key = process.env.POSTHOG_KEY || process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key) {
    posthogClient = null;
    return posthogClient;
  }

  posthogClient = new PostHog(key, {
    host: POSTHOG_HOST,
    flushAt: 1,
    flushInterval: 0,
  });

  return posthogClient;
}

async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
): Promise<T | undefined> {
  let timeout: ReturnType<typeof setTimeout> | undefined;

  try {
    return await Promise.race([
      promise,
      new Promise<undefined>((resolve) => {
        timeout = setTimeout(() => resolve(undefined), timeoutMs);
      }),
    ]);
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}

export async function getLandingExperimentAssignment(
  distinctId: string,
  personProperties: Record<string, string | undefined>,
): Promise<LandingAssignment> {
  const fallbackVariant = getFallbackLandingVariant(distinctId);
  const posthog = getPostHogServerClient();

  if (!posthog) {
    return { variant: fallbackVariant, source: "fallback" };
  }

  try {
    const filteredPersonProperties: Record<string, string> = {};
    for (const [key, value] of Object.entries(personProperties)) {
      if (value) filteredPersonProperties[key] = value;
    }

    const flags = await withTimeout(
      posthog.evaluateFlags(distinctId, {
        flagKeys: [LANDING_EXPERIMENT_FLAG_KEY],
        personProperties: filteredPersonProperties,
      }),
      900,
    );

    const flagValue = flags?.getFlag(LANDING_EXPERIMENT_FLAG_KEY);
    if (isLandingExperimentVariant(flagValue)) {
      return { variant: flagValue, source: "posthog", flags };
    }
  } catch (error) {
    console.error("Erro ao avaliar feature flag PostHog:", error);
  }

  return { variant: fallbackVariant, source: "fallback" };
}

export async function captureLandingEvent({
  distinctId,
  event,
  properties,
  flags,
}: {
  distinctId: string;
  event: string;
  properties: LandingEventProperties;
  flags?: FeatureFlagEvaluations;
}) {
  const posthog = getPostHogServerClient();
  if (!posthog) return;

  const featureProperties = {
    [`$feature/${LANDING_EXPERIMENT_FLAG_KEY}`]: properties.variant,
    $active_feature_flags: [LANDING_EXPERIMENT_FLAG_KEY],
  };

  posthog.capture({
    distinctId,
    event,
    properties: {
      ...featureProperties,
      proposal: landingExperimentProposalByVariant[properties.variant],
      ...properties,
    },
    flags,
  });

  await posthog.flush();
}
