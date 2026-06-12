import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { captureLandingEvent } from "@/lib/posthog/server";
import { sendMetaCompleteRegistration } from "@/lib/meta/conversions-api";
import { prisma } from "@/lib/prisma";
import {
  buildLandingSiteProperties,
  buildLandingSitePropertiesFromUrl,
  isLandingExperimentVariant,
  landingExperimentProposalByVariant,
  type LandingExperimentVariantId,
} from "@/lib/posthog/landing-experiment";

export const runtime = "nodejs";

const MAX_BODY_BYTES = 50_000;

const bodySchema = z.object({
  secret: z.string().optional(),
  form_id: z.string().trim().max(160).optional(),
  form_title: z.string().trim().max(300).optional(),
  response_id: z.string().trim().max(300).optional(),
  submitted_at: z.string().trim().max(80).optional(),
  respondent_email: z.string().trim().email().max(254).optional(),
  answers: z.record(z.string(), z.unknown()).default({}),
});

const answerAliases = {
  trackingContext: ["tracking_context", "tracking context"],
  visitorId: [
    "visitor_id",
    "visitor id",
    "tracking_id",
    "tracking id",
    "nl_variant_user_id",
  ],
  variant: ["variant", "variante", "landing_variant", "landing variant"],
  utmSource: ["utm_source", "utm source"],
  utmMedium: ["utm_medium", "utm medium"],
  utmCampaign: ["utm_campaign", "utm campaign"],
  utmContent: ["utm_content", "utm content"],
  utmTerm: ["utm_term", "utm term"],
  utmId: ["utm_id", "utm id"],
  metaAdId: ["meta_ad_id", "meta ad id"],
  metaAdsetId: ["meta_adset_id", "meta adset id"],
  proposalSelected: [
    "proposal_selected",
    "proposal selected",
    "proposta selecionada",
    "qual dessas propostas mais te faria comprar um produto de skincare?",
  ],
};

const trackingContextSchema = z
  .object({
    visitor_id: z.string().trim().optional(),
    variant: z.string().trim().optional(),
    utm_source: z.string().trim().optional(),
    utm_medium: z.string().trim().optional(),
    utm_campaign: z.string().trim().optional(),
    utm_content: z.string().trim().optional(),
    utm_term: z.string().trim().optional(),
    utm_id: z.string().trim().optional(),
    meta_ad_id: z.string().trim().optional(),
    meta_adset_id: z.string().trim().optional(),
    return_url: z.string().trim().optional(),
    site_environment: z.enum(["local", "dev", "production", "unknown"]).optional(),
    site_host: z.string().trim().optional(),
    site_origin: z.string().trim().optional(),
  })
  .passthrough();

function normalizeKey(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");
}

function stringifyAnswer(value: unknown): string | undefined {
  if (Array.isArray(value)) {
    const text = value.map((item) => String(item)).join(", ").trim();
    return text || undefined;
  }

  if (value === null || value === undefined) return undefined;

  const text = String(value).trim();
  return text || undefined;
}

function findAnswer(
  answers: Record<string, unknown>,
  aliases: string[],
): string | undefined {
  const normalizedAliases = aliases.map(normalizeKey);

  for (const [key, value] of Object.entries(answers)) {
    const normalizedKey = normalizeKey(key);
    if (
      normalizedAliases.some(
        (alias) => normalizedKey === alias || normalizedKey.includes(alias),
      )
    ) {
      return stringifyAnswer(value);
    }
  }

  return undefined;
}

function parseTrackingContext(answers: Record<string, unknown>) {
  const rawTrackingContext = findAnswer(
    answers,
    answerAliases.trackingContext,
  );
  if (!rawTrackingContext) return {};

  try {
    const parsed = trackingContextSchema.safeParse(
      JSON.parse(rawTrackingContext),
    );
    return parsed.success ? parsed.data : {};
  } catch {
    return {};
  }
}

type LandingPageVisitAttribution = {
  landingUrl: string | null;
  fbc: string | null;
  fbclid: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmContent: string | null;
  utmTerm: string | null;
  utmId: string | null;
  metaAdId: string | null;
  metaAdsetId: string | null;
};

function pickUrlSearchParam(url: string | null | undefined, key: string) {
  if (!url) return undefined;

  try {
    return new URL(url).searchParams.get(key) || undefined;
  } catch {
    return undefined;
  }
}

async function findLandingPageVisitAttribution(visitorId: string | undefined) {
  if (!visitorId) return null;

  const rows = await prisma.$queryRaw<LandingPageVisitAttribution[]>`
    SELECT
      "landingUrl",
      "fbc",
      "fbclid",
      "utmSource",
      "utmMedium",
      "utmCampaign",
      "utmContent",
      "utmTerm",
      "utmId",
      "metaAdId",
      "metaAdsetId"
    FROM "landing_page_visits"
    WHERE "visitorId" = ${visitorId}
    LIMIT 1
  `;

  return rows[0] || null;
}

function inferVariantFromProposal(
  proposal: string | undefined,
): LandingExperimentVariantId | undefined {
  if (!proposal) return undefined;

  const normalized = normalizeKey(proposal);
  if (normalized.includes("biotecnologia")) return "lp1";
  if (normalized.includes("poder da amazonia")) return "lp2";
  if (normalized.includes("ciencia da amazonia")) return "lp3";

  return undefined;
}

function pickDistinctId({
  visitorId,
  respondentEmail,
  answers,
  responseId,
}: {
  visitorId?: string;
  respondentEmail?: string;
  answers: Record<string, unknown>;
  responseId?: string;
}) {
  const email = respondentEmail || findAnswer(answers, ["e-mail", "email"]);
  const whatsapp = findAnswer(answers, ["whatsapp", "telefone", "phone"]);

  return (
    visitorId ||
    email ||
    whatsapp ||
    (responseId ? `google_form_${responseId}` : undefined)
  );
}

function pickKnownSiteEnvironment(
  ...values: Array<"local" | "dev" | "production" | "unknown" | undefined>
) {
  return values.find((value) => value && value !== "unknown") || "unknown";
}

export async function POST(request: NextRequest) {
  const contentLengthHeader = request.headers.get("content-length");
  if (contentLengthHeader) {
    const contentLength = Number(contentLengthHeader);
    if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
      return NextResponse.json({ error: "Payload too large" }, { status: 413 });
    }
  }

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const expectedSecret = process.env.GOOGLE_FORMS_WEBHOOK_SECRET?.trim();
  const headerSecret = request.headers
    .get("x-google-forms-webhook-secret")
    ?.trim();
  const bodySecret =
    typeof rawBody === "object" && rawBody !== null && "secret" in rawBody
      ? String((rawBody as { secret?: unknown }).secret || "").trim()
      : undefined;

  if (
    !expectedSecret ||
    (headerSecret !== expectedSecret && bodySecret !== expectedSecret)
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const body = parsed.data;
  const answers = body.answers;
  const trackingContext = parseTrackingContext(answers);
  const visitorId =
    trackingContext.visitor_id || findAnswer(answers, answerAliases.visitorId);
  const rawVariant =
    trackingContext.variant || findAnswer(answers, answerAliases.variant);
  const proposalSelected = findAnswer(answers, answerAliases.proposalSelected);
  const variant = isLandingExperimentVariant(rawVariant)
    ? rawVariant
    : inferVariantFromProposal(proposalSelected);
  const returnUrlSiteProperties = buildLandingSitePropertiesFromUrl(
    trackingContext.return_url,
  );
  const requestSiteProperties = buildLandingSiteProperties({
    host: request.headers.get("x-forwarded-host") || request.headers.get("host"),
    protocol: request.headers.get("x-forwarded-proto"),
    origin: request.headers.get("origin"),
  });
  const siteProperties = {
    site_environment: pickKnownSiteEnvironment(
      trackingContext.site_environment ||
      requestSiteProperties.site_environment,
      returnUrlSiteProperties.site_environment,
      requestSiteProperties.site_environment,
    ),
    site_host:
      trackingContext.site_host ||
      returnUrlSiteProperties.site_host ||
      requestSiteProperties.site_host,
    site_origin:
      trackingContext.site_origin ||
      returnUrlSiteProperties.site_origin ||
      requestSiteProperties.site_origin,
  };
  const distinctId = pickDistinctId({
    visitorId,
    respondentEmail: body.respondent_email,
    answers,
    responseId: body.response_id,
  });
  const respondentEmail =
    body.respondent_email || findAnswer(answers, ["e-mail", "email"]);
  const respondentWhatsapp = findAnswer(answers, [
    "whatsapp",
    "telefone",
    "phone",
  ]);
  const visitAttribution = await findLandingPageVisitAttribution(visitorId);
  const utmSource =
    visitAttribution?.utmSource ||
    trackingContext.utm_source ||
    findAnswer(answers, answerAliases.utmSource);
  const utmMedium =
    visitAttribution?.utmMedium ||
    trackingContext.utm_medium ||
    findAnswer(answers, answerAliases.utmMedium);
  const utmCampaign =
    visitAttribution?.utmCampaign ||
    trackingContext.utm_campaign ||
    findAnswer(answers, answerAliases.utmCampaign);
  const utmContent =
    visitAttribution?.utmContent ||
    trackingContext.utm_content ||
    findAnswer(answers, answerAliases.utmContent);
  const utmTerm =
    visitAttribution?.utmTerm ||
    trackingContext.utm_term ||
    findAnswer(answers, answerAliases.utmTerm);
  const utmId =
    visitAttribution?.utmId ||
    pickUrlSearchParam(visitAttribution?.landingUrl, "utm_id") ||
    trackingContext.utm_id ||
    findAnswer(answers, answerAliases.utmId);
  const metaAdId =
    visitAttribution?.metaAdId ||
    pickUrlSearchParam(visitAttribution?.landingUrl, "meta_ad_id") ||
    trackingContext.meta_ad_id ||
    findAnswer(answers, answerAliases.metaAdId);
  const metaAdsetId =
    visitAttribution?.metaAdsetId ||
    pickUrlSearchParam(visitAttribution?.landingUrl, "meta_adset_id") ||
    trackingContext.meta_adset_id ||
    findAnswer(answers, answerAliases.metaAdsetId);
  const fbclid =
    visitAttribution?.fbclid ||
    pickUrlSearchParam(visitAttribution?.landingUrl, "fbclid");

  if (!variant || !distinctId) {
    return NextResponse.json(
      { error: "Missing variant or distinct id" },
      { status: 400 },
    );
  }

  await captureLandingEvent({
    distinctId,
    event: "form_submitted",
    properties: {
      variant,
      proposal: landingExperimentProposalByVariant[variant],
      proposal_selected: proposalSelected,
      form_id: body.form_id,
      form_title: body.form_title,
      response_id: body.response_id,
      respondent_email: body.respondent_email,
      submitted_at: body.submitted_at,
      visitor_id: visitorId,
      pathname: "/landing-pages/formulario",
      return_url: trackingContext.return_url,
      ...siteProperties,
      landing_url: visitAttribution?.landingUrl,
      fbc: visitAttribution?.fbc,
      fbclid,
      utm_source: utmSource,
      utm_medium: utmMedium,
      utm_campaign: utmCampaign,
      utm_content: utmContent,
      utm_term: utmTerm,
      utm_id: utmId,
      meta_ad_id: metaAdId,
      meta_adset_id: metaAdsetId,
    },
  });

  try {
    await sendMetaCompleteRegistration({
      visitorId,
      variant,
      proposal: landingExperimentProposalByVariant[variant],
      email: respondentEmail,
      phone: respondentWhatsapp,
      responseId: body.response_id,
      submittedAt: body.submitted_at,
      proposalSelected,
      fallback: {
        returnUrl: trackingContext.return_url,
        siteOrigin: siteProperties.site_origin,
        utmSource,
        utmMedium,
        utmCampaign,
        utmContent,
        utmTerm,
        utmId,
        metaAdId,
        metaAdsetId,
      },
    });
  } catch (error) {
    console.error("Erro ao enviar CompleteRegistration para Meta CAPI:", error);
  }

  return NextResponse.json({ ok: true });
}
