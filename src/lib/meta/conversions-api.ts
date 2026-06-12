import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { sha256Hex } from "@/lib/pagbank/signature";

type LandingPageVisitRecord = {
  visitorId: string;
  variant: string | null;
  proposal: string | null;
  landingPath: string | null;
  landingUrl: string | null;
  referrer: string | null;
  userAgent: string | null;
  clientIpAddress: string | null;
  fbp: string | null;
  fbc: string | null;
  fbclid: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmContent: string | null;
  utmTerm: string | null;
  siteOrigin: string | null;
};

type MetaCompleteRegistrationArgs = {
  visitorId?: string;
  variant?: string;
  proposal?: string;
  email?: string;
  phone?: string;
  responseId?: string;
  submittedAt?: string;
  proposalSelected?: string;
  fallback: {
    returnUrl?: string;
    siteOrigin?: string;
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
    utmContent?: string;
    utmTerm?: string;
  };
};

function stripUndefined(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(stripUndefined).filter((item) => item !== undefined);
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .map(([key, item]) => [key, stripUndefined(item)])
        .filter(([, item]) => item !== undefined),
    );
  }

  return value === undefined || value === null || value === "" ? undefined : value;
}

function normalizePhoneForMeta(phone: string | undefined) {
  const digits = phone?.replace(/\D/g, "");
  if (!digits) return undefined;

  if ((digits.length === 10 || digits.length === 11) && !digits.startsWith("55")) {
    return `55${digits}`;
  }

  return digits;
}

function pickEventSourceUrl(visit: LandingPageVisitRecord | null, args: MetaCompleteRegistrationArgs) {
  if (visit?.landingUrl) return visit.landingUrl;
  if (args.fallback.returnUrl) return args.fallback.returnUrl;
  if (args.fallback.siteOrigin) return `${args.fallback.siteOrigin}/landing-pages/formulario`;
  return undefined;
}

async function findLandingPageVisit(visitorId: string | undefined) {
  if (!visitorId) return null;

  const rows = await prisma.$queryRaw<LandingPageVisitRecord[]>`
    SELECT
      "visitorId",
      "variant",
      "proposal",
      "landingPath",
      "landingUrl",
      "referrer",
      "userAgent",
      "clientIpAddress",
      "fbp",
      "fbc",
      "fbclid",
      "utmSource",
      "utmMedium",
      "utmCampaign",
      "utmContent",
      "utmTerm",
      "siteOrigin"
    FROM "landing_page_visits"
    WHERE "visitorId" = ${visitorId}
    LIMIT 1
  `;

  return rows[0] || null;
}

async function markLandingVisitMetaResult({
  visitorId,
  eventId,
  response,
}: {
  visitorId?: string;
  eventId: string;
  response: unknown;
}) {
  if (!visitorId) return;

  await prisma.$executeRaw`
    UPDATE "landing_page_visits"
    SET
      "metaEventId" = ${eventId},
      "metaSentAt" = CURRENT_TIMESTAMP,
      "metaResponse" = ${JSON.stringify(response)}::jsonb,
      "updatedAt" = CURRENT_TIMESTAMP
    WHERE "visitorId" = ${visitorId}
  `;
}

export async function sendMetaCompleteRegistration(
  args: MetaCompleteRegistrationArgs,
) {
  const accessToken = process.env.META_CAPI_ACCESS_TOKEN?.trim();
  const pixelId = process.env.META_PIXEL_ID?.trim() || "1332951988577735";

  if (!accessToken || !pixelId) {
    return { skipped: true, reason: "missing_meta_capi_config" };
  }

  const visit = await findLandingPageVisit(args.visitorId);
  const normalizedPhone = normalizePhoneForMeta(args.phone);
  const eventId = `complete_registration_${args.responseId || args.visitorId || Date.now()}`;
  const eventTime = args.submittedAt
    ? Math.floor(new Date(args.submittedAt).getTime() / 1000)
    : Math.floor(Date.now() / 1000);
  const eventSourceUrl = pickEventSourceUrl(visit, args);

  const userData = stripUndefined({
    em: args.email ? [await sha256Hex(args.email)] : undefined,
    ph: normalizedPhone ? [await sha256Hex(normalizedPhone)] : undefined,
    fbp: visit?.fbp,
    fbc: visit?.fbc,
    client_user_agent: visit?.userAgent,
    client_ip_address: visit?.clientIpAddress,
  });

  const event = stripUndefined({
    event_name: "CompleteRegistration",
    event_time: Number.isFinite(eventTime)
      ? eventTime
      : Math.floor(Date.now() / 1000),
    event_id: eventId,
    action_source: "website",
    event_source_url: eventSourceUrl,
    user_data: userData,
    custom_data: {
      content_name: "Nova Love Pesquisa ABC",
      variant: visit?.variant || args.variant,
      proposal: visit?.proposal || args.proposal,
      proposal_selected: args.proposalSelected,
      landing_path: visit?.landingPath,
      referrer: visit?.referrer,
      fbclid: visit?.fbclid,
      utm_source: visit?.utmSource || args.fallback.utmSource,
      utm_medium: visit?.utmMedium || args.fallback.utmMedium,
      utm_campaign: visit?.utmCampaign || args.fallback.utmCampaign,
      utm_content: visit?.utmContent || args.fallback.utmContent,
      utm_term: visit?.utmTerm || args.fallback.utmTerm,
    },
  });

  if (!eventSourceUrl) {
    return { skipped: true, reason: "missing_event_source_url" };
  }

  const payload: Record<string, unknown> = { data: [event] };
  const testEventCode = process.env.META_CAPI_TEST_EVENT_CODE?.trim();
  if (testEventCode) payload.test_event_code = testEventCode;

  const url = new URL(`https://graph.facebook.com/v25.0/${pixelId}/events`);
  url.searchParams.set("access_token", accessToken);

  const response = await fetch(url.toString(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const responseBody = await response.json().catch(() => ({}));

  await markLandingVisitMetaResult({
    visitorId: args.visitorId,
    eventId,
    response: {
      ok: response.ok,
      status: response.status,
      body: responseBody,
      test_event_code: testEventCode ? true : undefined,
    },
  });

  if (!response.ok) {
    throw new Error(
      `Meta CAPI CompleteRegistration failed: ${response.status} ${JSON.stringify(responseBody)}`,
    );
  }

  return {
    skipped: false,
    eventId,
    response: responseBody as Prisma.JsonValue,
  };
}
