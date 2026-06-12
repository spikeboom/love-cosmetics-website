import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { captureLandingEvent } from "@/lib/posthog/server";
import {
  LANDING_EXPERIMENT_COOKIE_NAME,
  landingExperimentProposalByVariant,
} from "@/lib/posthog/landing-experiment";

export const runtime = "nodejs";

const MAX_BODY_BYTES = 10_000;

const landingEventSchema = z.object({
  eventName: z.enum(["landing_cta_clicked", "form_started"]),
  variant: z.enum(["lp1", "lp2", "lp3"]).optional(),
  proposal: z.string().trim().max(80).optional(),
  pathname: z.string().trim().max(300).optional(),
  destination: z.string().trim().max(300).optional(),
  referrer: z.string().trim().max(500).optional(),
  device: z.enum(["mobile", "tablet", "desktop"]).optional(),
  utm_source: z.string().trim().max(120).optional(),
  utm_medium: z.string().trim().max(120).optional(),
  utm_campaign: z.string().trim().max(160).optional(),
  utm_content: z.string().trim().max(160).optional(),
  utm_term: z.string().trim().max(160).optional(),
});

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

  const parsed = landingEventSchema.safeParse(rawBody);
  if (!parsed.success || !parsed.data.variant) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const body = parsed.data;
  const variant = body.variant;
  if (!variant) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const distinctId = request.cookies.get(LANDING_EXPERIMENT_COOKIE_NAME)?.value;

  if (!distinctId) {
    return NextResponse.json({ error: "Missing visitor id" }, { status: 400 });
  }

  await captureLandingEvent({
    distinctId,
    event: body.eventName,
    properties: {
      variant,
      proposal: body.proposal || landingExperimentProposalByVariant[variant],
      pathname: body.pathname,
      destination: body.destination,
      referrer: body.referrer,
      device: body.device,
      utm_source: body.utm_source,
      utm_medium: body.utm_medium,
      utm_campaign: body.utm_campaign,
      utm_content: body.utm_content,
      utm_term: body.utm_term,
    },
  });

  return NextResponse.json({ ok: true });
}
