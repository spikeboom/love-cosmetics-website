"use client";

import { useEffect, useState } from "react";
import { toggleTestMode } from "./actions";

const IS_DEV = process.env.NEXT_PUBLIC_DEV_TOOLS === "true";

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]+)`));
  return m ? m[1] : null;
}

export default function TestModePage() {
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [secret, setSecret] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setEnabled(IS_DEV || getCookie("is_test_user") === "1");
  }, []);

  async function toggle() {
    if (IS_DEV) return;
    if (!secret) return;
    setLoading(true);
    setError("");
    try {
      const next = !enabled;
      const result = await toggleTestMode(secret, next);
      if (!result.ok) {
        setError(result.error || "Erro desconhecido.");
        return;
      }
      setEnabled(next);
    } finally {
      setLoading(false);
    }
  }

  if (enabled === null) return null;

  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4">
      <div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-8 shadow-lg text-center space-y-6">
        {/* Status icon */}
        <div className="flex justify-center">
          <span
            className={`inline-flex items-center justify-center w-16 h-16 rounded-full text-3xl transition-all duration-300 ${
              enabled
                ? "bg-amber-100 shadow-[0_0_20px_rgba(251,191,36,0.5)]"
                : "bg-gray-100"
            }`}
          >
            {enabled ? "🧪" : "👤"}
          </span>
        </div>

        {/* Title */}
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Modo de Teste</h1>
          <p className="mt-1 text-sm text-gray-500">
            {IS_DEV
              ? "Sempre ativo em dev — seus eventos nunca serão contabilizados."
              : enabled
                ? "Ativo — seus eventos não serão contabilizados no GA4 nem Meta."
                : "Desativado — você está navegando como um usuário real."}
          </p>
        </div>

        {IS_DEV ? (
          <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
            Ambiente de desenvolvimento detectado. O modo de teste é ativado automaticamente.
          </div>
        ) : (
          <>
            {/* Secret input */}
            <input
              type="password"
              placeholder="Secret"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && toggle()}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200"
            />

            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}

            {/* Toggle */}
            <button
              onClick={toggle}
              disabled={loading || !secret}
              className="relative inline-flex h-8 w-14 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-amber-300 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: enabled ? "#f59e0b" : "#d1d5db" }}
            >
              <span
                className={`inline-block h-6 w-6 rounded-full bg-white shadow-md transition-transform duration-300 ${
                  enabled ? "translate-x-7" : "translate-x-1"
                }`}
              />
            </button>

            <p className="text-xs text-gray-400">
              {enabled ? "Clique para desativar" : "Clique para ativar"}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
