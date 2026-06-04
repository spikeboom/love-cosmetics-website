import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createLogger } from "@/utils/logMessage";
import { validateYampiWebhookSignature } from "@/lib/yampi/webhook-signature";

const logMessage = createLogger();

function getYampiWebhookSecrets() {
  return [process.env.YAMPI_WEBHOOK_SECRET, process.env.YAMPI_WEBHOOK_SECRETS]
    .filter(Boolean)
    .flatMap((value) => value!.split(","))
    .map((value) => value.trim())
    .filter(Boolean);
}

function getWebhookEvent(body: unknown) {
  if (!body || typeof body !== "object" || !("event" in body)) return null;
  const event = body.event;
  return typeof event === "string" ? event : null;
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-yampi-hmac-sha256");
  const secrets = getYampiWebhookSecrets();

  if (!secrets.length) {
    logMessage("Webhook Yampi rejeitado - segredo nao configurado", {
      hasSignature: Boolean(signature),
    });
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  const valid = secrets.some((secret) =>
    validateYampiWebhookSignature({ rawBody, signature, secret })
  );
  if (!valid) {
    logMessage("Webhook Yampi rejeitado - assinatura invalida", {
      hasSignature: Boolean(signature),
      ip: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip"),
    });
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = JSON.parse(rawBody);
  } catch {
    logMessage("Webhook Yampi recebido com body nao-JSON", {
      bodyPreview: rawBody.slice(0, 200),
    });
    return NextResponse.json({ success: true, message: "Acknowledged" });
  }

  try {
    const event = getWebhookEvent(body);

    await prisma.statusCheckout.create({
      data: {
        info: {
          provider: "yampi",
          event,
          signature_validated: true,
          payload: body,
        },
      },
    });

    logMessage("Webhook Yampi recebido", {
      event,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logMessage("Erro ao processar webhook Yampi", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : String(error) },
      { status: 200 }
    );
  }
}
