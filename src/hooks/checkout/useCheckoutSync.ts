import { useCallback, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCart, useCoupon, useCartTotals } from "@/contexts";

interface CheckoutSyncData {
  identificacao?: {
    nome: string;
    email?: string;
    cpf?: string;
    telefone: string;
    dataNascimento: string;
  };
  entrega?: {
    cep: string;
    rua: string;
    numero: string;
    complemento: string;
    bairro: string;
    cidade: string;
    estado: string;
  };
  step: "identificacao" | "entrega" | "pagamento";
  convertido?: boolean;
}

function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return "";
  try {
    const existing = sessionStorage.getItem("checkout_session_id");
    if (existing) return existing;

    const uuid = (window as any)?.crypto?.randomUUID?.();
    const sid = uuid ?? `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    sessionStorage.setItem("checkout_session_id", sid);
    return sid;
  } catch {
    return "";
  }
}

function getDevice(): string {
  if (typeof window === "undefined") return "desktop";
  const w = window.innerWidth;
  if (w < 768) return "mobile";
  if (w < 1024) return "tablet";
  return "desktop";
}

export function useCheckoutSync() {
  const { isAuthenticated } = useAuth();
  const { cart } = useCart();
  const { cupons } = useCoupon();
  const { total } = useCartTotals();
  const inFlightRef = useRef<Set<string>>(new Set());

  const syncToServer = useCallback(
    (data: CheckoutSyncData) => {
      // Sync para o perfil do cliente logado (comportamento original)
      if (isAuthenticated && (data.identificacao || data.entrega)) {
        fetch("/api/cliente/checkout-sync", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(data),
        }).catch(() => {});
      }

      // Tracking de abandono para TODOS (logados e não-logados)
      const requestKey = `${data.step}:${data.convertido ? "1" : "0"}`;
      if (inFlightRef.current.has(requestKey)) return;
      inFlightRef.current.add(requestKey);

      const sessionId = getOrCreateSessionId();
      if (!sessionId) {
        inFlightRef.current.delete(requestKey);
        return;
      }

      // Montar items do carrinho
      const items = Object.values(cart || {}).map((raw: unknown) => {
        const p = raw as { id?: unknown; nome?: unknown; preco?: unknown; quantity?: unknown };
        return {
          item_id: String(p.id ?? ""),
          item_name: String(p.nome ?? ""),
          price: Number(p.preco ?? 0),
          quantity: Number(p.quantity ?? 1),
        };
      });

      const trackPayload: Record<string, unknown> = {
        sessionId,
        step: data.step,
        items,
        valor: total ?? null,
        cupons: cupons?.map((c: any) => c.codigo).filter(Boolean) || [],
        device: getDevice(),
      };

      if (data.convertido) {
        trackPayload.convertido = true;
      }

      // Dados de identificação
      if (data.identificacao) {
        trackPayload.email = data.identificacao.email;
        trackPayload.telefone = data.identificacao.telefone;
        trackPayload.nome = data.identificacao.nome;
        trackPayload.cpf = data.identificacao.cpf;
      }

      // Dados de entrega
      if (data.entrega) {
        trackPayload.cep = data.entrega.cep;
        trackPayload.cidade = data.entrega.cidade;
        trackPayload.estado = data.entrega.estado;
      }

      // Recuperar dados de identificação do localStorage se estamos no step de entrega/pagamento
      if (!data.identificacao && (data.step === "entrega" || data.step === "pagamento")) {
        try {
          const saved = localStorage.getItem("checkoutIdentificacao");
          if (saved) {
            const id = JSON.parse(saved);
            trackPayload.email = trackPayload.email || id.email;
            trackPayload.telefone = trackPayload.telefone || id.telefone;
            trackPayload.nome = trackPayload.nome || id.nome;
            trackPayload.cpf = trackPayload.cpf || id.cpf;
          }
        } catch {}
      }

      fetch("/api/checkout/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        keepalive: true,
        body: JSON.stringify(trackPayload),
      })
        .catch(() => {})
        .finally(() => {
          inFlightRef.current.delete(requestKey);
        });
    },
    [isAuthenticated, cart, cupons, total]
  );

  return { syncToServer };
}
