"use client";

import React, { useCallback, useEffect, useState } from "react";
import { RefreshIcon, SpinnerIcon, TrashIcon } from "./Icons";

interface InstagramPost {
  id: number;
  status: string;
  sort: number | null;
  tipo: "post" | "reel";
  instagramUrl: string;
  descricao: string | null;
  dateCreated: string;
  thumbnailUrl: string | null;
  videoUrl: string | null;
}

interface ImportRow {
  url: string;
  status: "pending" | "running" | "done" | "error" | "dup";
  message?: string;
  itemId?: number;
}

interface TokenInfo {
  issuedAt: string | null;
  expiresAt: string | null;
}

function daysUntil(iso: string | null): number | null {
  if (!iso) return null;
  const ms = new Date(iso).getTime() - Date.now();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

export function InstagramPanel() {
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [importQueue, setImportQueue] = useState<ImportRow[]>([]);
  const [importing, setImporting] = useState(false);
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);
  const [refreshingToken, setRefreshingToken] = useState(false);
  const [revalidating, setRevalidating] = useState(false);

  const loadPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/instagram/list", { cache: "no-store" });
      if (!res.ok) throw new Error(`Falhou ${res.status}`);
      const json = await res.json();
      setPosts(json.posts || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  const loadToken = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/instagram/token", { cache: "no-store" });
      if (res.ok) setTokenInfo(await res.json());
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    loadPosts();
    loadToken();
  }, [loadPosts, loadToken]);

  const refreshToken = async () => {
    if (refreshingToken) return;
    setRefreshingToken(true);
    try {
      const res = await fetch("/api/admin/instagram/token", { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Falhou");
      setTokenInfo({ issuedAt: json.issuedAt, expiresAt: json.expiresAt });
      alert(`Token renovado! Expira em ${new Date(json.expiresAt).toLocaleDateString("pt-BR")}`);
    } catch (e) {
      alert("Erro ao renovar token: " + (e instanceof Error ? e.message : String(e)));
    } finally {
      setRefreshingToken(false);
    }
  };

  const startImport = async () => {
    const urls = input
      .split(/\n+/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (urls.length === 0) return;

    const queue: ImportRow[] = urls.map((url) => ({ url, status: "pending" }));
    setImportQueue(queue);
    setImporting(true);

    for (let i = 0; i < queue.length; i++) {
      setImportQueue((prev) => {
        const next = [...prev];
        next[i] = { ...next[i], status: "running" };
        return next;
      });

      try {
        const res = await fetch("/api/admin/instagram/import", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ instagramUrl: queue[i].url }),
        });
        const json = await res.json();
        if (res.status === 409) {
          setImportQueue((prev) => {
            const next = [...prev];
            next[i] = { ...next[i], status: "dup", message: "já importado", itemId: json.itemId };
            return next;
          });
        } else if (!res.ok) {
          setImportQueue((prev) => {
            const next = [...prev];
            next[i] = { ...next[i], status: "error", message: json.error || `HTTP ${res.status}` };
            return next;
          });
        } else {
          setImportQueue((prev) => {
            const next = [...prev];
            next[i] = {
              ...next[i],
              status: "done",
              itemId: json.itemId,
              message: `${json.tipo} → item #${json.itemId}`,
            };
            return next;
          });
        }
      } catch (e) {
        setImportQueue((prev) => {
          const next = [...prev];
          next[i] = { ...next[i], status: "error", message: e instanceof Error ? e.message : String(e) };
          return next;
        });
      }
    }

    setImporting(false);
    setInput("");
    loadPosts();
  };

  const deletePost = async (id: number) => {
    if (!confirm("Remover este post? Os arquivos no Directus também serão deletados.")) return;
    try {
      const res = await fetch(`/api/admin/instagram/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || `HTTP ${res.status}`);
      }
      setPosts((prev) => prev.filter((p) => p.id !== id));
    } catch (e) {
      alert("Erro ao remover: " + (e instanceof Error ? e.message : String(e)));
    }
  };

  const revalidate = async () => {
    if (revalidating) return;
    setRevalidating(true);
    try {
      const res = await fetch("/api/admin/instagram/revalidate", { method: "POST" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      alert("Cache da home/PDP limpo. A próxima visita vai buscar a ordem atualizada do Directus.");
    } catch (e) {
      alert("Erro ao revalidar: " + (e instanceof Error ? e.message : String(e)));
    } finally {
      setRevalidating(false);
    }
  };

  const togglePublished = async (post: InstagramPost) => {
    const next = post.status === "published" ? "draft" : "published";
    try {
      const res = await fetch(`/api/admin/instagram/${post.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setPosts((prev) => prev.map((p) => (p.id === post.id ? { ...p, status: next } : p)));
    } catch (e) {
      alert("Erro: " + (e instanceof Error ? e.message : String(e)));
    }
  };

  const daysLeft = daysUntil(tokenInfo?.expiresAt ?? null);
  const tokenWarning = daysLeft !== null && daysLeft < 14;

  return (
    <div className="space-y-6">
      {/* Token status */}
      <div
        className={`rounded-lg border p-4 flex items-center justify-between ${
          tokenWarning ? "bg-red-50 border-red-200" : "bg-white border-gray-200"
        }`}
      >
        <div>
          <div className="text-[13px] font-cera-pro text-[#254333]">
            Token Instagram Graph API
          </div>
          <div className="text-[12px] text-gray-600 mt-1">
            {tokenInfo?.expiresAt
              ? `Expira em ${new Date(tokenInfo.expiresAt).toLocaleDateString("pt-BR")}${
                  daysLeft !== null ? ` (${daysLeft} dias)` : ""
                }`
              : "Carregando..."}
            {tokenInfo?.issuedAt && (
              <span className="ml-2 text-gray-400">
                · renovado em {new Date(tokenInfo.issuedAt).toLocaleDateString("pt-BR")}
              </span>
            )}
          </div>
        </div>
        <button
          onClick={refreshToken}
          disabled={refreshingToken}
          className="flex items-center gap-2 px-3 py-1.5 text-[13px] font-cera-pro bg-[#254333] text-white rounded hover:bg-[#1a3326] disabled:opacity-50"
        >
          {refreshingToken ? <SpinnerIcon /> : <RefreshIcon />}
          Renovar agora
        </button>
      </div>

      {/* Import form */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="text-[14px] font-cera-pro font-medium text-[#254333] mb-2">
          Importar posts/reels
        </div>
        <p className="text-[12px] text-gray-600 mb-3">
          Cole URLs do Instagram (uma por linha). Ex: <code className="bg-gray-100 px-1">https://www.instagram.com/p/ABC123/</code> ou <code className="bg-gray-100 px-1">/reel/XYZ789/</code>
        </p>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={4}
          placeholder="https://www.instagram.com/p/..."
          className="w-full border border-gray-300 rounded p-2 text-[13px] font-mono"
          disabled={importing}
        />
        <div className="flex items-center justify-between mt-2">
          <div className="text-[12px] text-gray-500">
            {input.split(/\n+/).filter((s) => s.trim()).length} URL(s)
          </div>
          <button
            onClick={startImport}
            disabled={importing || !input.trim()}
            className="flex items-center gap-2 px-4 py-2 text-[13px] font-cera-pro bg-[#254333] text-white rounded hover:bg-[#1a3326] disabled:opacity-50"
          >
            {importing ? <SpinnerIcon /> : null}
            {importing ? "Importando..." : "Importar"}
          </button>
        </div>

        {importQueue.length > 0 && (
          <div className="mt-4 space-y-1">
            {importQueue.map((row, i) => (
              <div
                key={i}
                className="flex items-center justify-between text-[12px] font-mono py-1 border-b border-gray-100"
              >
                <div className="truncate max-w-[60%]" title={row.url}>
                  {row.url}
                </div>
                <div
                  className={`flex items-center gap-1 text-[11px] ${
                    row.status === "done"
                      ? "text-green-700"
                      : row.status === "error"
                        ? "text-red-700"
                        : row.status === "dup"
                          ? "text-yellow-700"
                          : row.status === "running"
                            ? "text-blue-700"
                            : "text-gray-500"
                  }`}
                >
                  {row.status === "running" && <SpinnerIcon />}
                  {row.status === "pending" && "aguardando"}
                  {row.status === "running" && "importando..."}
                  {row.status === "done" && `✓ ${row.message}`}
                  {row.status === "dup" && `⊘ ${row.message}`}
                  {row.status === "error" && `✗ ${row.message}`}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lista de posts */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-[14px] font-cera-pro font-medium text-[#254333]">
            Posts no Directus ({posts.length})
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={revalidate}
              disabled={revalidating}
              className="flex items-center gap-1 px-3 py-1.5 text-[12px] font-cera-pro bg-[#254333] text-white rounded hover:bg-[#1a3326] disabled:opacity-50"
              title="Limpa o cache da home/PDP para refletir alterações feitas direto no Directus (ex: reordenação via sort)"
            >
              {revalidating ? <SpinnerIcon /> : <RefreshIcon />}
              Revalidar site
            </button>
            <button
              onClick={loadPosts}
              disabled={loading}
              className="flex items-center gap-1 px-3 py-1.5 text-[12px] text-[#254333] hover:bg-gray-50 rounded"
            >
              {loading ? <SpinnerIcon /> : <RefreshIcon />}
              Atualizar
            </button>
          </div>
        </div>

        {error && <div className="text-red-600 text-[13px] mb-2">{error}</div>}

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {posts.map((p) => (
            <div
              key={p.id}
              className={`relative rounded overflow-hidden border ${
                p.status === "published" ? "border-gray-200" : "border-yellow-300 bg-yellow-50"
              }`}
            >
              {p.thumbnailUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={p.thumbnailUrl}
                  alt=""
                  className="w-full aspect-square object-cover bg-gray-100"
                />
              ) : (
                <div className="w-full aspect-square bg-gray-200 flex items-center justify-center text-[11px] text-gray-500">
                  sem thumb
                </div>
              )}
              <div className="absolute top-1 left-1 px-1.5 py-0.5 bg-black/70 text-white text-[10px] rounded font-cera-pro uppercase">
                {p.tipo}
              </div>
              <div className="p-2 text-[11px]">
                <div className="flex items-center justify-between gap-1">
                  <a
                    href={p.instagramUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:underline truncate"
                    title={p.instagramUrl}
                  >
                    #{p.id} · sort {p.sort ?? "-"}
                  </a>
                  <button
                    onClick={() => deletePost(p.id)}
                    className="text-red-600 hover:bg-red-50 p-1 rounded"
                    title="Remover"
                  >
                    <TrashIcon />
                  </button>
                </div>
                <button
                  onClick={() => togglePublished(p)}
                  className={`mt-1 w-full text-[10px] py-1 rounded ${
                    p.status === "published"
                      ? "bg-green-100 text-green-800 hover:bg-green-200"
                      : "bg-yellow-200 text-yellow-900 hover:bg-yellow-300"
                  }`}
                >
                  {p.status}
                </button>
              </div>
            </div>
          ))}
        </div>
        {posts.length === 0 && !loading && (
          <div className="text-center text-gray-500 text-[13px] py-8">
            Nenhum post importado ainda.
          </div>
        )}
      </div>
    </div>
  );
}
