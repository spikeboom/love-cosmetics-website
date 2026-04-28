"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

const POLL_INTERVAL_MS = 5 * 60 * 1000;

declare global {
  interface Window {
    __BUILD_ID__?: string;
    __BUILD_RELOAD_PENDING__?: boolean;
  }
}

async function fetchServerBuildId(): Promise<string | null> {
  try {
    const res = await fetch("/api/version", { cache: "no-store" });
    if (!res.ok) return null;
    const data = (await res.json()) as { buildId?: string };
    return data.buildId ?? null;
  } catch {
    return null;
  }
}

function reload() {
  if (typeof window === "undefined") return;
  window.__BUILD_RELOAD_PENDING__ = true;
  // location.reload() pode usar cache; assign força fetch novo do HTML.
  window.location.assign(window.location.href);
}

export function BuildVersionGuard() {
  const pathname = usePathname();
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const localId = process.env.NEXT_PUBLIC_BUILD_ID || "unknown";
    window.__BUILD_ID__ = localId;

    const check = async () => {
      if (window.__BUILD_RELOAD_PENDING__) return;
      const remote = await fetchServerBuildId();
      if (!remote || remote === "unknown") return;
      if (remote !== localId) {
        console.warn("[build-guard] versão nova detectada", { local: localId, remote });
        reload();
      }
    };

    const onVisibility = () => {
      if (document.visibilityState === "visible") void check();
    };

    document.addEventListener("visibilitychange", onVisibility);
    const interval = window.setInterval(check, POLL_INTERVAL_MS);

    void check();

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.clearInterval(interval);
    };
  }, []);

  // Re-checa em mudança de rota (App Router) — barata, e cobre o caso
  // "usuário ficou parado, JS ainda antigo, agora está navegando".
  useEffect(() => {
    if (!initializedRef.current) return;
    if (window.__BUILD_RELOAD_PENDING__) return;
    void (async () => {
      const localId = window.__BUILD_ID__;
      const remote = await fetchServerBuildId();
      if (!remote || remote === "unknown" || !localId) return;
      if (remote !== localId) {
        console.warn("[build-guard] versão nova em route change", { local: localId, remote });
        reload();
      }
    })();
  }, [pathname]);

  return null;
}
