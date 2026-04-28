"use client";

type CheckoutIssueStep = "identificacao" | "entrega" | "pagamento" | "confirmacao" | "unknown";
type CheckoutIssueSeverity = "info" | "warning" | "error";

interface CheckoutIssuePayload {
  step: CheckoutIssueStep;
  kind: string;
  severity?: CheckoutIssueSeverity;
  message?: string;
  metadata?: Record<string, unknown>;
}

export function reportCheckoutIssue(payload: CheckoutIssuePayload) {
  if (typeof window === "undefined") return;

  try {
    const body = JSON.stringify(payload);
    if (navigator.sendBeacon) {
      const blob = new Blob([body], { type: "application/json" });
      navigator.sendBeacon("/api/checkout/issue", blob);
      return;
    }

    fetch("/api/checkout/issue", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      keepalive: true,
      body,
    }).catch(() => undefined);
  } catch {
    // Logging must never block the checkout.
  }
}
