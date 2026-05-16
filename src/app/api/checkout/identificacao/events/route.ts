import { createHash } from "crypto";
import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { logWarn } from "@/utils/logMessage";

export const runtime = "nodejs";

const eventNames = [
  "identificacao_page_viewed",
  "identificacao_cart_loaded",
  "identificacao_empty_cart_redirect",
  "identificacao_form_prefilled",
  "identificacao_first_interaction",
  "identificacao_cep_completed",
  "identificacao_cep_lookup_started",
  "identificacao_cep_lookup_success",
  "identificacao_cep_lookup_failed",
  "identificacao_continue_clicked",
  "identificacao_validation_failed",
  "identificacao_validation_passed",
  "identificacao_storage_save_started",
  "identificacao_storage_save_success",
  "identificacao_storage_save_failed",
  "identificacao_sync_started",
  "identificacao_sync_success",
  "identificacao_sync_failed",
  "identificacao_navigate_entrega_attempted",
  "identificacao_navigate_entrega_called",
  "identificacao_entrega_arrived",
  "identificacao_runtime_error",
  "identificacao_unhandled_rejection",
  "identificacao_page_hidden",
] as const;

const eventSchema = z.object({
  event_id: z.string().min(8).max(120),
  checkout_session_id: z.string().max(160).optional(),
  page_instance_id: z.string().min(8).max(120),
  sequence_number: z.number().int().positive().max(10000).optional(),
  event_name: z.enum(eventNames),
  severity: z.enum(["info", "warning", "error"]).default("info"),
  is_test_user: z.boolean().optional(),
  path: z.string().max(2048).optional(),
  referrer: z.string().max(2048).optional(),
  elapsed_ms: z.number().int().min(0).max(24 * 60 * 60 * 1000).optional(),
  client_created_at: z.string().datetime().optional(),
  payload: z.record(z.string(), z.unknown()).default({}),
});

const sensitiveKeys = new Set([
  "cpf",
  "document",
  "documento",
  "email",
  "mail",
  "telefone",
  "phone",
  "phone_number",
  "celular",
  "cep",
  "postal_code",
  "nome",
  "name",
  "first_name",
  "last_name",
  "endereco",
  "address",
  "rua",
  "street",
]);

function hashIp(ip: string | null) {
  if (!ip) return undefined;
  const salt = process.env.CHECKOUT_EVENT_IP_SALT || process.env.NEXTAUTH_SECRET || "checkout-events";
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex").slice(0, 32);
}

function getIp(req: NextRequest) {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || null;
  return req.headers.get("x-real-ip");
}

function isTestEvent(req: NextRequest, data: z.infer<typeof eventSchema>) {
  return (
    data.is_test_user === true ||
    req.cookies.get("is_test_user")?.value === "1" ||
    data.checkout_session_id?.startsWith("t_") === true
  );
}

function sanitizeValue(key: string, value: unknown, depth = 0): unknown {
  if (depth > 4) return undefined;

  const normalizedKey = key.toLowerCase();
  if (sensitiveKeys.has(normalizedKey)) {
    const text = typeof value === "string" ? value : "";
    const digits = text.replace(/\D/g, "");
    if (normalizedKey === "email" || normalizedKey === "mail") {
      return {
        present: text.length > 0,
        length: text.length,
        has_at: text.includes("@"),
        has_dot: text.includes("."),
      };
    }
    return {
      present: text.length > 0,
      length: text.length,
      digits: digits.length,
    };
  }

  if (Array.isArray(value)) {
    return value.slice(0, 50).map((item) => sanitizeValue(key, item, depth + 1));
  }

  if (value && typeof value === "object") {
    const result: Record<string, unknown> = {};
    for (const [childKey, childValue] of Object.entries(value as Record<string, unknown>).slice(0, 80)) {
      result[childKey] = sanitizeValue(childKey, childValue, depth + 1);
    }
    return result;
  }

  if (typeof value === "string") return value.slice(0, 500);
  if (typeof value === "number" || typeof value === "boolean" || value === null) return value;
  return undefined;
}

function sanitizePayload(payload: Record<string, unknown>) {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(payload).slice(0, 80)) {
    result[key] = sanitizeValue(key, value);
  }
  return result as Prisma.InputJsonObject;
}

export async function POST(req: NextRequest) {
  try {
    const parsed = eventSchema.safeParse(await req.json());
    if (!parsed.success) {
      logWarn("checkout_identificacao_event_invalid_payload", { issues: parsed.error.issues });
      return NextResponse.json({ success: false }, { status: 400 });
    }

    const data = parsed.data;
    await prisma.checkoutIdentificacaoEvent.create({
      data: {
        eventId: data.event_id,
        checkoutSessionId: data.checkout_session_id,
        pageInstanceId: data.page_instance_id,
        sequenceNumber: data.sequence_number,
        eventName: data.event_name,
        severity: data.severity,
        path: data.path || req.headers.get("referer"),
        referrer: data.referrer,
        buildId: process.env.NEXT_PUBLIC_BUILD_ID || process.env.VERCEL_GIT_COMMIT_SHA,
        userAgent: req.headers.get("user-agent"),
        ipHash: hashIp(getIp(req)),
        isTest: isTestEvent(req, data),
        elapsedMs: data.elapsed_ms,
        payload: sanitizePayload(data.payload),
        clientCreatedAt: data.client_created_at ? new Date(data.client_created_at) : undefined,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error?.code === "P2002") {
      return NextResponse.json({ success: true, duplicate: true });
    }

    logWarn("checkout_identificacao_event_failed_to_save", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
