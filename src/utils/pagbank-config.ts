/**
 * PagBank configuration helpers.
 * Keep all env access in one place to avoid accidental sandbox fallbacks in production.
 */

function isProductionEnv() {
  return process.env.NODE_ENV === "production" || process.env.STAGE === "PRODUCTION";
}

export function getPagBankPublicKey(): string {
  // Preferred (no sandbox suffix)
  const publicKey =
    process.env.NEXT_PUBLIC_PAGBANK_PUBLIC_KEY ||
    (typeof window !== "undefined" && (window as any).ENV?.NEXT_PUBLIC_PAGBANK_PUBLIC_KEY) ||
    // Backwards compatibility (legacy name)
    process.env.NEXT_PUBLIC_PAGBANK_PUBLIC_KEY_SANDBOX ||
    (typeof window !== "undefined" &&
      (window as any).ENV?.NEXT_PUBLIC_PAGBANK_PUBLIC_KEY_SANDBOX) ||
    "";

  if (!publicKey) {
    console.error("[PagBank] Public key not configured (NEXT_PUBLIC_PAGBANK_PUBLIC_KEY)");
  }

  return publicKey;
}

export function getPagBankApiUrl(): string {
  const url = process.env.PAGBANK_API_URL;
  if (url) return url;

  // Avoid silently falling back to sandbox in production.
  if (isProductionEnv()) {
    throw new Error("PAGBANK_API_URL is required in production");
  }

  return "https://sandbox.api.pagseguro.com";
}

export function getPagBankToken(): string {
  // Preferred (no sandbox suffix)
  return process.env.PAGBANK_TOKEN || process.env.PAGBANK_TOKEN_SANDBOX || "";
}

