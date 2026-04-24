"use client";

import { useEffect } from "react";

export function DeployCheck() {
  useEffect(() => {
    console.log(
      "%c[Lové] Deploy via GitHub Actions OK — 2026-04-24",
      "background:#254333;color:#f8f3ed;padding:4px 8px;border-radius:4px;font-weight:bold;"
    );
  }, []);

  return (
    <div
      style={{
        background: "#254333",
        color: "#f8f3ed",
        padding: "12px 16px",
        textAlign: "center",
        fontSize: "14px",
        fontWeight: 600,
      }}
    >
      Deploy via GitHub Actions — rodando
    </div>
  );
}
