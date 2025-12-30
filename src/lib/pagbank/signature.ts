type LogMessage = (message: string, data?: unknown) => void;

export async function sha256Hex(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text.trim().toLowerCase());
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function sha256Raw(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function validateWebhookSignature({
  rawBody,
  signatureHeader,
  logMessage,
}: {
  rawBody: string;
  signatureHeader: string | null;
  logMessage: LogMessage;
}): Promise<{ valid: boolean; reason?: string }> {
  const token = process.env.PAGBANK_WEBHOOK_TOKEN;
  const isSandbox = process.env.PAGBANK_API_URL?.includes("sandbox") ?? true;

  if (!signatureHeader) {
    if (isSandbox) {
      logMessage("Webhook sem assinatura aceito (ambiente sandbox)", {
        warning: "Em producao, webhooks sem assinatura serao rejeitados",
      });
      return { valid: true };
    }
    return { valid: false, reason: "Header x-authenticity-token ausente" };
  }

  if (!token) {
    if (isSandbox) {
      logMessage("AVISO: PAGBANK_WEBHOOK_TOKEN nao configurado, aceitando webhook em sandbox", {});
      return { valid: true };
    }
    logMessage("ERRO: PAGBANK_WEBHOOK_TOKEN nao configurado", {});
    return { valid: false, reason: "Token de webhook nao configurado no servidor" };
  }

  const expectedSignature = await sha256Raw(`${token}-${rawBody}`);
  const isValid = expectedSignature === signatureHeader.toLowerCase();

  if (!isValid) {
    logMessage("Assinatura do webhook invalida", {
      received: signatureHeader.substring(0, 16) + "...",
      expected: expectedSignature.substring(0, 16) + "...",
    });
  }

  return {
    valid: isValid,
    reason: isValid ? undefined : "Assinatura invalida",
  };
}
