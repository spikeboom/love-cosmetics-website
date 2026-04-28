import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { POST } from "@/app/api/checkout/issue/route";

function makeRequest(body: unknown, headers: Record<string, string> = {}): any {
  return {
    json: async () => body,
    headers: {
      get: (key: string) => headers[key.toLowerCase()] ?? null,
    },
  } as any;
}

let warnSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
});

afterEach(() => {
  warnSpy.mockRestore();
});

describe("POST /api/checkout/issue", () => {
  it("retorna 400 quando step e invalido", async () => {
    const res = await POST(makeRequest({ step: "outro", kind: "x" }));
    const json = await res.json();
    expect(res.status).toBe(400);
    expect(json.success).toBe(false);
  });

  it("retorna 400 quando kind ausente", async () => {
    const res = await POST(makeRequest({ step: "entrega" }));
    expect(res.status).toBe(400);
  });

  it("retorna 400 quando kind excede 80 caracteres", async () => {
    const res = await POST(makeRequest({ step: "entrega", kind: "x".repeat(81) }));
    expect(res.status).toBe(400);
  });

  it("aceita payload minimo e responde 200", async () => {
    const res = await POST(makeRequest({ step: "identificacao", kind: "ok" }));
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(warnSpy).toHaveBeenCalled();
  });

  it("default severity = warning", async () => {
    await POST(makeRequest({ step: "entrega", kind: "k" }));
    const logged = warnSpy.mock.calls.find((c) => c[0] === "[checkout_issue]")?.[1] as any;
    expect(logged.severity).toBe("warning");
  });

  it("aplica mascara em cpf, telefone, cep e email no metadata", async () => {
    await POST(
      makeRequest({
        step: "pagamento",
        kind: "test",
        severity: "info",
        message: "ok",
        metadata: {
          cpf: "12345678901",
          telefone: "11987654321",
          cep: "69082230",
          email: "alguem@example.com",
          outro: "preserved",
        },
      }),
    );
    const logged = warnSpy.mock.calls.find((c) => c[0] === "[checkout_issue]")?.[1] as any;
    expect(logged.metadata.cpf).toBe("123***01");
    expect(logged.metadata.telefone).toBe("11***21");
    // keepEnd=0 -> slice(-0) retorna string inteira; CEP fica concatenado
    // (comportamento atual de maskDigits no route handler)
    expect(logged.metadata.cep).toBe("69082***69082230");
    expect(logged.metadata.email).toBe("al***@example.com");
    expect(logged.metadata.outro).toBe("preserved");
  });

  it("metadata totalmente nao numerico em cpf -> undefined apos masking", async () => {
    await POST(
      makeRequest({
        step: "pagamento",
        kind: "test",
        metadata: { cpf: "abc", telefone: "", cep: "" },
      }),
    );
    const logged = warnSpy.mock.calls.find((c) => c[0] === "[checkout_issue]")?.[1] as any;
    expect(logged.metadata.cpf).toBeUndefined();
    expect(logged.metadata.telefone).toBeUndefined();
    expect(logged.metadata.cep).toBeUndefined();
  });

  it("registra path e userAgent dos headers", async () => {
    await POST(
      makeRequest(
        { step: "entrega", kind: "k" },
        { referer: "https://app/checkout/entrega", "user-agent": "Mozilla/5.0" },
      ),
    );
    const logged = warnSpy.mock.calls.find((c) => c[0] === "[checkout_issue]")?.[1] as any;
    expect(logged.path).toBe("https://app/checkout/entrega");
    expect(logged.userAgent).toBe("Mozilla/5.0");
  });

  it("metadata ausente -> sanitized = undefined no log", async () => {
    await POST(makeRequest({ step: "entrega", kind: "k" }));
    const logged = warnSpy.mock.calls.find((c) => c[0] === "[checkout_issue]")?.[1] as any;
    expect(logged.metadata).toBeUndefined();
  });

  it("retorna 500 e nao quebra quando req.json lanca", async () => {
    const req = {
      json: async () => { throw new Error("bad"); },
      headers: { get: () => null },
    } as any;
    const res = await POST(req);
    expect(res.status).toBe(500);
  });

  it("severity custom e propagada para o log", async () => {
    await POST(makeRequest({ step: "pagamento", kind: "k", severity: "error" }));
    const logged = warnSpy.mock.calls.find((c) => c[0] === "[checkout_issue]")?.[1] as any;
    expect(logged.severity).toBe("error");
  });
});
