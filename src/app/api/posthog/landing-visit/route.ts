import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const MAX_BODY_BYTES = 15_000;

const landingVisitSchema = z.object({
  visitorId: z.string().trim().min(3).max(160),
  variant: z.enum(["lp1", "lp2", "lp3"]).optional(),
  proposal: z.string().trim().max(80).optional(),
  assignmentSource: z.string().trim().max(40).optional(),
  landingPath: z.string().trim().max(300).optional(),
  landingUrl: z.string().trim().max(2_000).optional(),
  referrer: z.string().trim().max(2_000).optional(),
  userAgent: z.string().trim().max(1_000).optional(),
  fbp: z.string().trim().max(200).optional(),
  fbc: z.string().trim().max(400).optional(),
  fbclid: z.string().trim().max(1_000).optional(),
  utmSource: z.string().trim().max(120).optional(),
  utmMedium: z.string().trim().max(120).optional(),
  utmCampaign: z.string().trim().max(160).optional(),
  utmContent: z.string().trim().max(160).optional(),
  utmTerm: z.string().trim().max(160).optional(),
  utmId: z.string().trim().max(180).optional(),
  metaAdId: z.string().trim().max(180).optional(),
  metaAdsetId: z.string().trim().max(180).optional(),
  siteEnvironment: z.enum(["local", "dev", "production", "unknown"]).optional(),
  siteHost: z.string().trim().max(180).optional(),
  siteOrigin: z.string().trim().max(300).optional(),
});

function emptyToUndefined<T extends Record<string, unknown>>(value: T) {
  return Object.fromEntries(
    Object.entries(value).map(([key, item]) => [
      key,
      typeof item === "string" && item.trim() === "" ? undefined : item,
    ]),
  ) as T;
}

function nullable(value: string | undefined) {
  return value || null;
}

function getClientIpAddress(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0]?.trim() || undefined;

  return (
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-real-ip") ||
    undefined
  );
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

  const parsed = landingVisitSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const body = emptyToUndefined(parsed.data);
  const id = globalThis.crypto?.randomUUID?.() || `lpv_${Date.now()}`;
  const clientIpAddress = getClientIpAddress(request);

  try {
    await prisma.$executeRaw`
      INSERT INTO "landing_page_visits" (
        "id",
        "visitorId",
        "variant",
        "proposal",
        "assignmentSource",
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
        "utmId",
        "metaAdId",
        "metaAdsetId",
        "siteEnvironment",
        "siteHost",
        "siteOrigin",
        "updatedAt"
      )
      VALUES (
        ${id},
        ${body.visitorId},
        ${nullable(body.variant)},
        ${nullable(body.proposal)},
        ${nullable(body.assignmentSource)},
        ${nullable(body.landingPath)},
        ${nullable(body.landingUrl)},
        ${nullable(body.referrer)},
        ${nullable(body.userAgent)},
        ${nullable(clientIpAddress)},
        ${nullable(body.fbp)},
        ${nullable(body.fbc)},
        ${nullable(body.fbclid)},
        ${nullable(body.utmSource)},
        ${nullable(body.utmMedium)},
        ${nullable(body.utmCampaign)},
        ${nullable(body.utmContent)},
        ${nullable(body.utmTerm)},
        ${nullable(body.utmId)},
        ${nullable(body.metaAdId)},
        ${nullable(body.metaAdsetId)},
        ${nullable(body.siteEnvironment)},
        ${nullable(body.siteHost)},
        ${nullable(body.siteOrigin)},
        CURRENT_TIMESTAMP
      )
      ON CONFLICT ("visitorId") DO UPDATE SET
        "variant" = COALESCE(EXCLUDED."variant", "landing_page_visits"."variant"),
        "proposal" = COALESCE(EXCLUDED."proposal", "landing_page_visits"."proposal"),
        "assignmentSource" = COALESCE(EXCLUDED."assignmentSource", "landing_page_visits"."assignmentSource"),
        "landingPath" = COALESCE(EXCLUDED."landingPath", "landing_page_visits"."landingPath"),
        "landingUrl" = COALESCE(EXCLUDED."landingUrl", "landing_page_visits"."landingUrl"),
        "referrer" = COALESCE(EXCLUDED."referrer", "landing_page_visits"."referrer"),
        "userAgent" = COALESCE(EXCLUDED."userAgent", "landing_page_visits"."userAgent"),
        "clientIpAddress" = COALESCE(EXCLUDED."clientIpAddress", "landing_page_visits"."clientIpAddress"),
        "fbp" = COALESCE(EXCLUDED."fbp", "landing_page_visits"."fbp"),
        "fbc" = COALESCE(EXCLUDED."fbc", "landing_page_visits"."fbc"),
        "fbclid" = COALESCE(EXCLUDED."fbclid", "landing_page_visits"."fbclid"),
        "utmSource" = COALESCE(EXCLUDED."utmSource", "landing_page_visits"."utmSource"),
        "utmMedium" = COALESCE(EXCLUDED."utmMedium", "landing_page_visits"."utmMedium"),
        "utmCampaign" = COALESCE(EXCLUDED."utmCampaign", "landing_page_visits"."utmCampaign"),
        "utmContent" = COALESCE(EXCLUDED."utmContent", "landing_page_visits"."utmContent"),
        "utmTerm" = COALESCE(EXCLUDED."utmTerm", "landing_page_visits"."utmTerm"),
        "utmId" = COALESCE(EXCLUDED."utmId", "landing_page_visits"."utmId"),
        "metaAdId" = COALESCE(EXCLUDED."metaAdId", "landing_page_visits"."metaAdId"),
        "metaAdsetId" = COALESCE(EXCLUDED."metaAdsetId", "landing_page_visits"."metaAdsetId"),
        "siteEnvironment" = COALESCE(EXCLUDED."siteEnvironment", "landing_page_visits"."siteEnvironment"),
        "siteHost" = COALESCE(EXCLUDED."siteHost", "landing_page_visits"."siteHost"),
        "siteOrigin" = COALESCE(EXCLUDED."siteOrigin", "landing_page_visits"."siteOrigin"),
        "updatedAt" = CURRENT_TIMESTAMP
    `;
  } catch (error) {
    console.error("Erro ao salvar visita da landing:", error);
    return NextResponse.json({ error: "Failed to save visit" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
