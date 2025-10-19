/**
 * Configuração do PagBank
 * Centraliza acesso às variáveis de ambiente
 */

export function getPagBankPublicKey(): string {
  // Tentar diferentes formas de acessar a variável
  const publicKey =
    process.env.NEXT_PUBLIC_PAGBANK_PUBLIC_KEY_SANDBOX ||
    (typeof window !== "undefined" &&
      (window as any).ENV?.NEXT_PUBLIC_PAGBANK_PUBLIC_KEY_SANDBOX) ||
    "";

  if (!publicKey) {
    console.error("❌ Chave pública do PagBank não encontrada!");
    console.error("Variáveis disponíveis:", {
      hasWindow: typeof window !== "undefined",
      processEnv: Object.keys(process.env).filter((k) =>
        k.includes("PAGBANK")
      ),
    });
  } else {
    console.log("✅ Chave pública do PagBank carregada:", publicKey.substring(0, 15) + "...");
  }

  return publicKey;
}

export function getPagBankApiUrl(): string {
  return (
    process.env.PAGBANK_API_URL || "https://sandbox.api.pagseguro.com"
  );
}

export function getPagBankToken(): string {
  return process.env.PAGBANK_TOKEN_SANDBOX || "";
}
