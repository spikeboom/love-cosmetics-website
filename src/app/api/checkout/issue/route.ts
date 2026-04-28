import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { logWarn } from "@/utils/logMessage";

export const runtime = "nodejs";

const issueSchema = z.object({
  step: z.enum(["identificacao", "entrega", "pagamento", "confirmacao", "unknown"]),
  kind: z.string().min(1).max(80),
  severity: z.enum(["info", "warning", "error"]).default("warning"),
  message: z.string().max(240).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

function maskDigits(value: unknown, keepStart = 2, keepEnd = 2) {
  const digits = String(value || "").replace(/\D/g, "");
  if (!digits) return undefined;
  if (digits.length <= keepStart + keepEnd) return "*".repeat(digits.length);
  return `${digits.slice(0, keepStart)}***${digits.slice(-keepEnd)}`;
}

function sanitizeMetadata(metadata: Record<string, unknown> | undefined) {
  if (!metadata) return undefined;

  return {
    ...metadata,
    cpf: maskDigits(metadata.cpf, 3, 2),
    telefone: maskDigits(metadata.telefone, 2, 2),
    cep: maskDigits(metadata.cep, 5, 0),
    email: typeof metadata.email === "string"
      ? metadata.email.replace(/^(.{2}).*(@.*)$/, "$1***$2")
      : undefined,
  };
}

export async function POST(req: NextRequest) {
  try {
    const parsed = issueSchema.safeParse(await req.json());
    if (!parsed.success) {
      logWarn("checkout_issue_invalid_payload", { issues: parsed.error.issues });
      return NextResponse.json({ success: false }, { status: 400 });
    }

    const data = parsed.data;
    logWarn("checkout_issue", {
      step: data.step,
      kind: data.kind,
      severity: data.severity,
      message: data.message,
      metadata: sanitizeMetadata(data.metadata),
      path: req.headers.get("referer"),
      userAgent: req.headers.get("user-agent"),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logWarn("checkout_issue_failed_to_log", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
