/**
 * Testes do BuildVersionGuard.
 *
 * O guard compara `process.env.NEXT_PUBLIC_BUILD_ID` (embutido no client em
 * tempo de build) com o `buildId` retornado por GET /api/version. Se forem
 * diferentes, força hard refresh via `window.location.assign`.
 *
 * Cenários cobertos:
 *  - mesmo build id → não recarrega
 *  - build id diferente → recarrega via location.assign(URL atual)
 *  - remote === "unknown" → não recarrega (evita reload-loop em ambiente
 *    sem build id setado)
 *  - mudança de pathname dispara nova checagem
 *  - reload pendente (__BUILD_RELOAD_PENDING__=true) → não tenta de novo
 */
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, waitFor, act } from "@testing-library/react";

// Pathname mockado por ref pra controlar entre re-renders
const pathnameRef = { current: "/cart" };
vi.mock("next/navigation", () => ({
  usePathname: () => pathnameRef.current,
}));

import { BuildVersionGuard } from "@/components/common/BuildVersionGuard";

const ORIGINAL_LOCATION = window.location;

function mockFetchVersion(buildId: string | null, ok = true) {
  const fetchMock = vi.fn(async (url: any) => {
    if (String(url).includes("/api/version")) {
      return {
        ok,
        json: async () => (buildId === null ? {} : { buildId }),
      } as any;
    }
    throw new Error(`fetch não mockado: ${url}`);
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

function mockLocationAssign() {
  // Em jsdom, window.location não é simplesmente reatribuível.
  // Define uma versão custom com `assign` espionável que não navega de fato.
  const assignSpy = vi.fn();
  Object.defineProperty(window, "location", {
    configurable: true,
    value: {
      ...ORIGINAL_LOCATION,
      href: "http://localhost/cart",
      assign: assignSpy,
    },
  });
  return assignSpy;
}

beforeEach(() => {
  pathnameRef.current = "/cart";
  delete (window as any).__BUILD_ID__;
  delete (window as any).__BUILD_RELOAD_PENDING__;
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  Object.defineProperty(window, "location", {
    configurable: true,
    value: ORIGINAL_LOCATION,
  });
});

describe("BuildVersionGuard", () => {
  it("build id local === remoto: NÃO recarrega", async () => {
    vi.stubEnv("NEXT_PUBLIC_BUILD_ID", "abc123");
    const fetchMock = mockFetchVersion("abc123");
    const assignSpy = mockLocationAssign();

    await act(async () => {
      render(<BuildVersionGuard />);
    });

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    expect(assignSpy).not.toHaveBeenCalled();
    expect((window as any).__BUILD_RELOAD_PENDING__).toBeUndefined();
  });

  it("build id diferente: chama location.assign com a URL atual", async () => {
    vi.stubEnv("NEXT_PUBLIC_BUILD_ID", "old-build");
    mockFetchVersion("new-build");
    const assignSpy = mockLocationAssign();

    await act(async () => {
      render(<BuildVersionGuard />);
    });

    // Nota: no primeiro mount o componente tem dois useEffects que rodam em
    // paralelo (mount inicial + effect de pathname). Ambos detectam diff e
    // chamam reload() — em produção isso resulta em 2 location.assign na
    // mesma URL, que o navegador deduplica naturalmente. O importante é que
    // recarregue, e que `__BUILD_RELOAD_PENDING__` fique true.
    await waitFor(() => expect(assignSpy).toHaveBeenCalled());
    expect(assignSpy).toHaveBeenCalledWith("http://localhost/cart");
    expect((window as any).__BUILD_RELOAD_PENDING__).toBe(true);
  });

  it('remote === "unknown": NÃO recarrega (evita loop em ambiente sem build id)', async () => {
    vi.stubEnv("NEXT_PUBLIC_BUILD_ID", "abc123");
    mockFetchVersion("unknown");
    const assignSpy = mockLocationAssign();

    await act(async () => {
      render(<BuildVersionGuard />);
    });

    // Espera microtasks do fetch resolverem.
    await act(async () => { await Promise.resolve(); await Promise.resolve(); });
    expect(assignSpy).not.toHaveBeenCalled();
  });

  it("mudança de pathname dispara nova checagem", async () => {
    vi.stubEnv("NEXT_PUBLIC_BUILD_ID", "abc123");
    const fetchMock = mockFetchVersion("abc123");
    mockLocationAssign();

    const { rerender } = render(<BuildVersionGuard />);
    // No mount, ambos useEffects rodam — 2 fetches. Espera ambos resolverem.
    await waitFor(() => expect(fetchMock.mock.calls.length).toBeGreaterThanOrEqual(1));
    const beforePathChange = fetchMock.mock.calls.length;

    pathnameRef.current = "/checkout";
    await act(async () => {
      rerender(<BuildVersionGuard />);
    });

    // Depois da mudança de pathname, o effect dependente de pathname dispara.
    await waitFor(() => expect(fetchMock.mock.calls.length).toBeGreaterThan(beforePathChange));
  });

  it("reload pendente: checagem subsequente em route change é no-op", async () => {
    // Cenário: o reload já foi disparado e está em voo. Mudança de pathname
    // depois disso NÃO pode tentar recarregar de novo (proteção contra
    // reload-loop entre o assign() e o navegador realmente desligar a página).
    vi.stubEnv("NEXT_PUBLIC_BUILD_ID", "old-build");
    const fetchMock = mockFetchVersion("new-build");
    const assignSpy = mockLocationAssign();

    const { rerender } = render(<BuildVersionGuard />);
    await waitFor(() => expect(assignSpy).toHaveBeenCalled());
    expect((window as any).__BUILD_RELOAD_PENDING__).toBe(true);

    const callsAposMount = assignSpy.mock.calls.length;
    fetchMock.mockClear();

    pathnameRef.current = "/checkout";
    await act(async () => {
      rerender(<BuildVersionGuard />);
    });
    await act(async () => { await Promise.resolve(); await Promise.resolve(); });

    // Pode ter feito o fetch antes de checar pending (a checagem de pending
    // está depois do fetch no useEffect de pathname), mas NÃO pode ter
    // chamado assign de novo.
    expect(assignSpy.mock.calls.length).toBe(callsAposMount);
  });
});
