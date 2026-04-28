import { describe, it, expect, beforeEach, afterEach } from "vitest";

import { GET } from "@/app/api/version/route";

const ORIGINAL_ENV = { ...process.env };

beforeEach(() => {
  delete process.env.BUILD_ID;
  delete process.env.NEXT_PUBLIC_BUILD_ID;
});

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

describe("GET /api/version", () => {
  it("retorna BUILD_ID quando definido", async () => {
    process.env.BUILD_ID = "build-2026-04-28-abc123";

    const res = await GET();
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json).toEqual({ buildId: "build-2026-04-28-abc123" });
  });

  it("usa NEXT_PUBLIC_BUILD_ID como fallback quando BUILD_ID não está setado", async () => {
    process.env.NEXT_PUBLIC_BUILD_ID = "next-public-xyz";

    const res = await GET();
    const json = await res.json();

    expect(json.buildId).toBe("next-public-xyz");
  });

  it('retorna "unknown" quando nenhum env de build id está setado', async () => {
    const res = await GET();
    const json = await res.json();

    // Importante: o BuildVersionGuard só recarrega quando local !== remote E
    // remote !== "unknown". Se a API algum dia parar de devolver "unknown"
    // e devolver "" ou null, vai disparar reload-loop em ambientes sem build.
    expect(json.buildId).toBe("unknown");
  });

  it("manda Cache-Control no-store — protege contra cache de CDN/proxy", async () => {
    // Esse header é o que faz a feature funcionar: se for cacheado, todo
    // cliente recebe a mesma versão velha e o guard nunca detecta deploy novo.
    process.env.BUILD_ID = "x";

    const res = await GET();
    const cacheControl = res.headers.get("cache-control") ?? "";

    expect(cacheControl).toContain("no-store");
    expect(res.headers.get("pragma")).toBe("no-cache");
  });
});
