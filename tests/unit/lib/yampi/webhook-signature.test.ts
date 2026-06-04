import { describe, expect, it } from "vitest";
import {
  calculateYampiWebhookSignature,
  validateYampiWebhookSignature,
} from "@/lib/yampi/webhook-signature";

describe("Yampi webhook signature", () => {
  it("validates a base64 HMAC-SHA256 signature over the raw body", () => {
    const rawBody = JSON.stringify({
      event: "order.created",
      time: "2026-06-03 18:30:00",
      resource: { id: 123 },
    });
    const secret = "wh_test_secret";
    const signature = calculateYampiWebhookSignature(rawBody, secret);

    expect(validateYampiWebhookSignature({ rawBody, signature, secret })).toBe(true);
  });

  it("rejects a mismatched signature", () => {
    expect(
      validateYampiWebhookSignature({
        rawBody: "{\"event\":\"order.created\"}",
        signature: "invalid",
        secret: "wh_test_secret",
      })
    ).toBe(false);
  });
});
