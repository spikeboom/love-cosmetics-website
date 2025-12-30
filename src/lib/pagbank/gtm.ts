import type { PagBankWebhookNotification } from "@/types/pagbank";
import { sha256Hex } from "@/lib/pagbank/signature";

type LogMessage = (message: string, data?: unknown) => void;

export async function buildGtmPurchasePayload({
  body,
  charge,
  pedido,
}: {
  body: PagBankWebhookNotification;
  charge: any;
  pedido: { ga_session_id: string | null; ga_session_number: number | null };
}): Promise<Record<string, unknown>> {
  const emailRaw = body.customer?.email ?? "";
  const phoneRaw = [
    body.customer?.phones?.[0]?.country ?? "",
    body.customer?.phones?.[0]?.area ?? "",
    body.customer?.phones?.[0]?.number ?? "",
  ].join("");

  return {
    event_name: "Purchase",
    event_id: `purchase_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    transaction_id: body.id ?? "unknown",
    value: Number(charge.amount?.value ?? 0) / 100,
    currency: charge.amount?.currency ?? "BRL",
    items:
      body.items?.map((item: any) => ({
        item_id: item.reference_id ?? "unknown",
        item_name: item.name ?? "Produto",
        price: Number(item.unit_amount ?? 0) / 100,
        quantity: item.quantity ?? 1,
      })) ?? [],
    user_data: {
      em: emailRaw ? await sha256Hex(emailRaw) : undefined,
      ph: phoneRaw ? await sha256Hex(phoneRaw) : undefined,
    },
    user_email: emailRaw ? await sha256Hex(emailRaw) : undefined,
    user_phone: phoneRaw ? await sha256Hex(phoneRaw) : undefined,
    ga_session_id: pedido.ga_session_id,
    ga_session_number: pedido.ga_session_number,
  };
}

export async function sendGtmPurchaseEvent(
  payload: Record<string, unknown>,
  logMessage: LogMessage
): Promise<void> {
  logMessage("Enviando evento Purchase para GTM", {
    transaction_id: payload.transaction_id,
    value: payload.value,
  });

  await fetch("https://gtm.lovecosmetics.com.br/data?v=2", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}
