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

type LandingVisitProperties = LandingClientEventProperties & {
  visitorId?: string;
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
    utm_id: params.get("utm_id") || undefined,
    meta_ad_id: params.get("meta_ad_id") || undefined,
    meta_adset_id: params.get("meta_adset_id") || undefined,
    fbclid: params.get("fbclid") || undefined,
  };
}

function getDevice() {
  const width = window.innerWidth;
  if (width < 768) return "mobile";
  if (width < 1024) return "tablet";
  return "desktop";
}

function readCookie(name: string) {
  const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = document.cookie.match(new RegExp(`(?:^|; )${escapedName}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : undefined;
}

function buildFbcFromFbclid(fbclid: string | null) {
  if (!fbclid) return undefined;
  return `fb.1.${Date.now()}.${fbclid}`;
}

function getLandingVisitPayload(properties: LandingVisitProperties) {
  const params = new URLSearchParams(window.location.search);
  const fbclid = params.get("fbclid") || undefined;
  const variant = isLandingExperimentVariant(properties.variant)
    ? properties.variant
    : undefined;

  return {
    visitorId: properties.visitorId,
    variant,
    proposal: variant
      ? landingExperimentProposalByVariant[variant as LandingExperimentVariantId]
      : undefined,
    assignmentSource: properties.assignment_source,
    landingPath: properties.pathname || window.location.pathname,
    landingUrl: window.location.href,
    referrer: document.referrer || undefined,
    userAgent: navigator.userAgent || undefined,
    fbp: readCookie("_fbp"),
    fbc: readCookie("_fbc") || buildFbcFromFbclid(fbclid || null),
    fbclid,
    utmSource: params.get("utm_source") || undefined,
    utmMedium: params.get("utm_medium") || undefined,
    utmCampaign: params.get("utm_campaign") || undefined,
    utmContent: params.get("utm_content") || undefined,
    utmTerm: params.get("utm_term") || undefined,
    utmId: params.get("utm_id") || undefined,
    metaAdId: params.get("meta_ad_id") || undefined,
    metaAdsetId: params.get("meta_adset_id") || undefined,
    siteEnvironment: properties.site_environment,
    siteHost: properties.site_host,
    siteOrigin: properties.site_origin,
  };
}

export function trackLandingVisit(properties: LandingVisitProperties = {}) {
  if (typeof window === "undefined" || !properties.visitorId) return;

  const send = () => {
    const body = JSON.stringify(getLandingVisitPayload(properties));

    fetch("/api/posthog/landing-visit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      keepalive: true,
      body,
    }).catch(() => undefined);
  };

  send();
  window.setTimeout(send, 700);
  window.setTimeout(send, 1800);
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
