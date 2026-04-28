import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { reportCheckoutIssue } from "@/lib/checkout/report-checkout-issue";

const sendBeacon = vi.fn();
const fetchMock = vi.fn();

beforeEach(() => {
  sendBeacon.mockReset();
  fetchMock.mockReset();
  fetchMock.mockResolvedValue({ ok: true });
  vi.stubGlobal("fetch", fetchMock);
  Object.defineProperty(window.navigator, "sendBeacon", {
    configurable: true,
    value: sendBeacon,
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
  // limpa property
  // @ts-expect-error reset
  delete window.navigator.sendBeacon;
});

const payload = {
  step: "identificacao" as const,
  kind: "viacep_lookup_failed",
  severity: "warning" as const,
  message: "fail",
  metadata: { cep: "69082230" },
};

describe("reportCheckoutIssue", () => {
  it("usa sendBeacon quando disponivel", () => {
    sendBeacon.mockReturnValue(true);
    reportCheckoutIssue(payload);
    expect(sendBeacon).toHaveBeenCalledTimes(1);
    expect(sendBeacon.mock.calls[0][0]).toBe("/api/checkout/issue");
    const blob = sendBeacon.mock.calls[0][1] as Blob;
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe("application/json");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("envia o payload exato como body do beacon", async () => {
    sendBeacon.mockReturnValue(true);
    reportCheckoutIssue(payload);
    const blob = sendBeacon.mock.calls[0][1] as Blob;
    const text = await blob.text();
    expect(JSON.parse(text)).toEqual(payload);
  });

  it("faz fallback para fetch quando sendBeacon nao existe", () => {
    // @ts-expect-error simular ambiente sem beacon
    delete window.navigator.sendBeacon;
    reportCheckoutIssue(payload);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/checkout/issue");
    expect(init.method).toBe("POST");
    expect(init.headers["Content-Type"]).toBe("application/json");
    expect(init.keepalive).toBe(true);
    expect(JSON.parse(init.body)).toEqual(payload);
  });

  it("nao propaga erros do fetch", async () => {
    // @ts-expect-error simular ambiente sem beacon
    delete window.navigator.sendBeacon;
    fetchMock.mockRejectedValue(new Error("network"));
    expect(() => reportCheckoutIssue(payload)).not.toThrow();
    // permite microtasks rodarem para garantir que rejeicao foi engolida
    await new Promise((r) => setTimeout(r, 0));
  });

  it("nao propaga erros se sendBeacon lancar", () => {
    sendBeacon.mockImplementation(() => { throw new Error("beacon down"); });
    expect(() => reportCheckoutIssue(payload)).not.toThrow();
  });

  it("nao faz nada em ambiente sem window (SSR)", () => {
    const originalWindow = globalThis.window;
    // @ts-expect-error simular SSR
    delete globalThis.window;
    expect(() => reportCheckoutIssue(payload)).not.toThrow();
    globalThis.window = originalWindow;
    expect(sendBeacon).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
