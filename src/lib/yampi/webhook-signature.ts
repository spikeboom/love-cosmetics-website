import { createHmac, timingSafeEqual } from "node:crypto";

export function calculateYampiWebhookSignature(rawBody: string, secret: string): string {
  return createHmac("sha256", secret).update(rawBody).digest("base64");
}

export function validateYampiWebhookSignature({
  rawBody,
  signature,
  secret,
}: {
  rawBody: string;
  signature: string | null;
  secret: string;
}): boolean {
  if (!signature || !secret) return false;

  const expected = calculateYampiWebhookSignature(rawBody, secret);
  const expectedBuffer = Buffer.from(expected);
  const receivedBuffer = Buffer.from(signature);

  if (expectedBuffer.length !== receivedBuffer.length) return false;
  return timingSafeEqual(expectedBuffer, receivedBuffer);
}
