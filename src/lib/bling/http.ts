import { createLogger } from "@/utils/logMessage";
import { makeAuthenticatedRequest } from "./simple-auth";

const logMessage = createLogger();

export const BLING_API_BASE_URL = "https://api.bling.com.br/Api/v3";
export const BLING_RATE_LIMIT_DELAY_MS = 350;
export const BLING_MAX_RETRIES = 3;

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Executa uma função com retry exponencial para 429 (rate limit).
 */
export async function withRetry<T>(fn: () => Promise<T>, label: string): Promise<T> {
  for (let attempt = 0; attempt < BLING_MAX_RETRIES; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      const is429 = error?.message?.includes("429") || error?.status === 429;
      if (is429 && attempt < BLING_MAX_RETRIES - 1) {
        const delayMs = 1000 * Math.pow(2, attempt);
        logMessage(`Rate limit 429, retry ${attempt + 1}/${BLING_MAX_RETRIES} em ${delayMs}ms`, { label });
        await sleep(delayMs);
        continue;
      }
      throw error;
    }
  }
  throw new Error(`Falha após ${BLING_MAX_RETRIES} tentativas: ${label}`);
}

/**
 * GET em endpoint do Bling com query string. Retorna body parseado.
 * Lida com 429 via withRetry e espera BLING_RATE_LIMIT_DELAY_MS entre chamadas consecutivas do caller.
 */
export async function blingGet<T = any>(pathWithQuery: string, label: string): Promise<T> {
  return withRetry(async () => {
    const res = await makeAuthenticatedRequest(`${BLING_API_BASE_URL}${pathWithQuery}`);
    if (res.status === 429) {
      throw Object.assign(new Error("429"), { status: 429 });
    }
    const text = await res.text();
    let body: any;
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
    if (!res.ok) {
      const err: any = new Error(`Bling ${label} falhou: HTTP ${res.status}`);
      err.status = res.status;
      err.body = body;
      throw err;
    }
    return body as T;
  }, label);
}
