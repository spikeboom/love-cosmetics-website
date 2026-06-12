"use client";

import posthog from "posthog-js";
import {
  isLandingExperimentVariant,
  landingExperimentProposalByVariant,
  type LandingSiteEnvironment,
  type LandingExperimentVariantId,
} from "./landing-experiment";

type LandingClientEventName = "landing_cta_clicked" | "form_started";

type LandingClientEventProperties = {
  variant?: string | null;
  assignment_source?: string;
  pathname?: string;
  destination?: string;
  site_environment?: LandingSiteEnvironment;
  site_host?: string;
  site_origin?: string;
};

let postHogInitialized = false;
let identifiedDistinctId: string | undefined;

export function initLandingPostHog(distinctId?: string) {
  if (typeof window === "undefined") return;

  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key) return;

  if (!postHogInitialized) {
    posthog.init(key, {
      api_host:
        process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
      capture_pageview: false,
      autocapture: false,
    });
    postHogInitialized = true;
  }

  if (distinctId && identifiedDistinctId !== distinctId) {
    posthog.identify(distinctId);
    identifiedDistinctId = distinctId;
  }
}

function getUtmProperties() {
  const params = new URLSearchParams(window.location.search);

  return {
    utm_source: params.get("utm_source") || undefined,
    utm_medium: params.get("utm_medium") || undefined,
    utm_campaign: params.get("utm_campaign") || undefined,
    utm_content: params.get("utm_content") || undefined,
    utm_term: params.get("utm_term") || undefined,
  };
}

function getDevice() {
  const width = window.innerWidth;
  if (width < 768) return "mobile";
  if (width < 1024) return "tablet";
  return "desktop";
}

export function trackLandingClientEvent(
  eventName: LandingClientEventName,
  properties: LandingClientEventProperties = {},
) {
  if (typeof window === "undefined") return;

  const variant = isLandingExperimentVariant(properties.variant)
    ? properties.variant
    : undefined;

  const body = JSON.stringify({
    eventName,
    variant,
    proposal: variant
      ? landingExperimentProposalByVariant[variant as LandingExperimentVariantId]
      : undefined,
    pathname: properties.pathname || window.location.pathname,
    destination: properties.destination,
    site_environment: properties.site_environment,
    site_host: properties.site_host,
    site_origin: properties.site_origin,
    referrer: document.referrer || undefined,
    device: getDevice(),
    ...getUtmProperties(),
  });

  try {
    if (navigator.sendBeacon) {
      const blob = new Blob([body], { type: "application/json" });
      navigator.sendBeacon("/api/posthog/landing-event", blob);
      return;
    }

    fetch("/api/posthog/landing-event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      keepalive: true,
      body,
    }).catch(() => undefined);
  } catch {
    // Tracking should never block navigation or form loading.
  }
}
