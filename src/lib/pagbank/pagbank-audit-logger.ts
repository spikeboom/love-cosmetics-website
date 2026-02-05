/**
 * [PAGBANK-AUDIT-LOG] Logger de auditoria para validação da integração PagBank
 *
 * Este arquivo gera logs no formato exigido pelo time de integração do PagBank.
 * Os logs são salvos em: docs/2026-01-31-pagbank/audit-log.txt
 *
 * Para encontrar este arquivo depois, busque por: PAGBANK-AUDIT-LOG
 *
 * IMPORTANTE: Após a validação do PagBank, este logger pode ser desativado
 * setando PAGBANK_AUDIT_LOG_ENABLED=false no .env
 */

import fs from "fs";
import path from "path";

const AUDIT_LOG_PATH = path.join(
  process.cwd(),
  "docs",
  "2026-01-31-pagbank",
  "audit-log.txt"
);

function ensureDirectoryExists() {
  const dir = path.dirname(AUDIT_LOG_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function formatTimestamp(): string {
  return new Date().toISOString();
}

function appendToLog(content: string) {
  if (process.env.PAGBANK_AUDIT_LOG_ENABLED === "false") {
    return;
  }

  try {
    ensureDirectoryExists();
    fs.appendFileSync(AUDIT_LOG_PATH, content + "\n\n", "utf-8");
  } catch (error) {
    console.error("[PAGBANK-AUDIT-LOG] Erro ao salvar log:", error);
  }
}

export function logPagBankRequest({
  tipo,
  url,
  method,
  body,
}: {
  tipo: "PIX" | "CARTAO";
  url: string;
  method: string;
  body: any;
}) {
  const content = `=== ${tipo} - REQUEST ===
Timestamp: ${formatTimestamp()}
${method} ${url}

${JSON.stringify(body, null, 2)}`;

  appendToLog(content);

  // Também loga no console para debug
  console.log(`[PAGBANK-AUDIT-LOG] ${tipo} Request logged`);
}

export function logPagBankResponse({
  tipo,
  status,
  body,
}: {
  tipo: "PIX" | "CARTAO";
  status: number;
  body: any;
}) {
  const content = `=== ${tipo} - RESPONSE ===
Timestamp: ${formatTimestamp()}
Status: ${status}

${JSON.stringify(body, null, 2)}`;

  appendToLog(content);

  console.log(`[PAGBANK-AUDIT-LOG] ${tipo} Response logged (status: ${status})`);
}

export function logWebhookReceived(body: any) {
  const content = `=== WEBHOOK NOTIFICATION - RECEIVED ===
Timestamp: ${formatTimestamp()}

${JSON.stringify(body, null, 2)}`;

  appendToLog(content);

  console.log("[PAGBANK-AUDIT-LOG] Webhook logged");
}

export function clearAuditLog() {
  try {
    ensureDirectoryExists();
    const header = `# Log de Auditoria PagBank - Love Cosmetics
# Gerado em: ${formatTimestamp()}
# Este arquivo contém os requests e responses reais da integração
# [PAGBANK-AUDIT-LOG]

`;
    fs.writeFileSync(AUDIT_LOG_PATH, header, "utf-8");
    console.log("[PAGBANK-AUDIT-LOG] Log limpo e reiniciado");
  } catch (error) {
    console.error("[PAGBANK-AUDIT-LOG] Erro ao limpar log:", error);
  }
}
