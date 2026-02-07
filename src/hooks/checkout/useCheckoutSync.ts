import { useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface CheckoutSyncData {
  identificacao?: {
    nome: string;
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
}

export function useCheckoutSync() {
  const { isAuthenticated } = useAuth();

  const syncToServer = useCallback(
    (data: CheckoutSyncData) => {
      if (!isAuthenticated) return;

      fetch("/api/cliente/checkout-sync", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      }).catch(() => {
        // Fire-and-forget: falha silenciosa
      });
    },
    [isAuthenticated]
  );

  return { syncToServer };
}
