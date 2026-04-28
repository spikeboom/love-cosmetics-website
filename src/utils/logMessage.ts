import crypto from "crypto";

export function createLogger() {
  const logHash = crypto.randomBytes(4).toString("hex");
  // @ts-expect-error
  return (message, data) => {
    if (process.env.STAGE === "LOCAL") {
      console.dir({ logHash, message, data }, { depth: null, colors: true });
    } else {
      console.log(
        JSON.stringify({ logHash, message, data }, null, 0), // Gera uma única linha de log
      );
    }
  };
}

// ── Loggers nomeados, single-line garantido. ────────────────────────────────
// console.warn(label, obj) usa util.inspect e quebra em \n quando o objeto
// tem mais de ~80 chars — cada linha vira uma entrada separada no Loki, e
// o filtro por label perde o resto do payload. Estas funções serializam o
// objeto em JSON antes de chamar console.*, garantindo 1 linha por log.
//
// Uso típico em route handlers / lib server-only:
//   logWarn("checkout_issue", { step, kind, severity, message })
//   logError("freight_quote_exception", { error: String(error) })

type LogData = Record<string, unknown> | undefined;

function emit(level: "info" | "warn" | "error", label: string, data?: unknown) {
  // Error não serializa via JSON.stringify por padrão (props não-enumeráveis).
  // Extrair o útil antes.
  const safeData =
    data instanceof Error
      ? { name: data.name, message: data.message, stack: data.stack }
      : data;
  const line = JSON.stringify({ label, level, data: safeData });
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

export function logInfo(label: string, data?: LogData) {
  emit("info", label, data);
}

export function logWarn(label: string, data?: LogData | unknown) {
  emit("warn", label, data);
}

export function logError(label: string, data?: LogData | unknown) {
  emit("error", label, data);
}
