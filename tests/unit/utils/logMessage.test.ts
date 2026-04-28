/**
 * Garante que logInfo/Warn/Error emitem 1 linha por chamada e que essa
 * linha é JSON válido.
 *
 * Origem: bug observado no Loki (2026-04-28) — `console.warn(label, obj)`
 * com objeto cru disparava util.inspect e quebrava em \n; cada linha
 * virava entrada separada no Loki, perdendo o label e a estrutura. Esses
 * testes protegem o contrato da camada nova.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { logInfo, logWarn, logError } from "@/utils/logMessage";

let warnSpy: ReturnType<typeof vi.spyOn>;
let errorSpy: ReturnType<typeof vi.spyOn>;
let logSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
  errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
});

afterEach(() => {
  warnSpy.mockRestore();
  errorSpy.mockRestore();
  logSpy.mockRestore();
});

describe("logMessage — single-line guarantee", () => {
  it("logWarn emite 1 chamada de console.warn com 1 string sem quebra de linha", () => {
    logWarn("checkout_issue", {
      step: "entrega",
      kind: "freight_quote_failed",
      nested: { a: 1, b: { c: [1, 2, 3] } },
      array: ["x", "y", "z"],
    });

    expect(warnSpy).toHaveBeenCalledTimes(1);
    const arg = warnSpy.mock.calls[0][0];
    expect(typeof arg).toBe("string");
    expect(arg).not.toContain("\n");
    const parsed = JSON.parse(arg as string);
    expect(parsed.label).toBe("checkout_issue");
    expect(parsed.level).toBe("warn");
    expect(parsed.data.kind).toBe("freight_quote_failed");
    expect(parsed.data.nested.b.c).toEqual([1, 2, 3]);
  });

  it("logError de Error: extrai name/message/stack (sem perder em JSON.stringify)", () => {
    // Errors têm propriedades não-enumeráveis — JSON.stringify normalmente
    // devolve "{}". O wrapper precisa extrair manualmente.
    const err = new Error("boom");
    logError("freight_quote_exception", err);

    expect(errorSpy).toHaveBeenCalledTimes(1);
    const arg = errorSpy.mock.calls[0][0] as string;
    expect(arg).not.toContain("\n");
    const parsed = JSON.parse(arg);
    expect(parsed.level).toBe("error");
    expect(parsed.data.name).toBe("Error");
    expect(parsed.data.message).toBe("boom");
    expect(parsed.data.stack).toBeTruthy();
  });

  it("logInfo: usa console.log e zero quebras de linha", () => {
    logInfo("startup", { ready: true });

    expect(logSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy).not.toHaveBeenCalled();
    expect(errorSpy).not.toHaveBeenCalled();
    expect(logSpy.mock.calls[0][0]).not.toContain("\n");
  });

  it("payload grande: continua 1 linha (sem util.inspect quebrando)", () => {
    // Reproduz o cenário do bug: objeto >80 chars que disparava o quebra-
    // -linha do util.inspect quando passado direto pra console.warn.
    const big = {
      step: "entrega",
      kind: "freight_quote_invalid_payload",
      issues: Array.from({ length: 20 }, (_, i) => ({
        code: "invalid_type",
        path: ["items", i, "peso_gramas"],
        message: `Required at index ${i}`,
      })),
    };
    logWarn("checkout_issue", big);

    const arg = warnSpy.mock.calls[0][0] as string;
    expect(arg).not.toContain("\n");
    const parsed = JSON.parse(arg);
    expect(parsed.data.issues).toHaveLength(20);
  });
});
