"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { getPagBankPublicKey } from "@/utils/pagbank-config";

interface CardData {
  holder: string;
  number: string;
  expMonth: string;
  expYear: string;
  securityCode: string;
}

interface QrCodeData {
  text: string;
  imageUrl: string;
  expirationDate: string;
}

interface PaymentResult {
  success: boolean;
  orderId?: string;
  chargeId?: string;
  status?: string;
  message?: string;
  qrCode?: QrCodeData;
}

interface UsePagBankPaymentReturn {
  // Estado
  loading: boolean;
  checkingPayment: boolean;
  error: string | null;
  publicKey: string;
  qrCodeData: QrCodeData | null;

  // Acoes
  encryptCard: (cardData: CardData) => Promise<string | null>;
  createCardPayment: (
    pedidoId: string,
    encryptedCard: string,
    installments: number
  ) => Promise<PaymentResult>;
  createPixPayment: (pedidoId: string) => Promise<PaymentResult>;
  startPaymentPolling: (
    orderId: string,
    onSuccess: (result: PaymentResult) => void,
    onError: (error: string) => void,
    intervalMs?: number,
    timeoutMs?: number
  ) => void;
  stopPolling: () => void;
  checkOrderStatus: (pedidoId: string) => Promise<{ isPaid: boolean; status: string }>;
  clearError: () => void;
}

// Tipo declarado em @/types/pagbank.ts

export function usePagBankPayment(): UsePagBankPaymentReturn {
  const [loading, setLoading] = useState(false);
  const [checkingPayment, setCheckingPayment] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [publicKey, setPublicKey] = useState<string>("");
  const [qrCodeData, setQrCodeData] = useState<QrCodeData | null>(null);

  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pollingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Carregar chave publica ao montar
  useEffect(() => {
    const key = getPagBankPublicKey();
    setPublicKey(key);
  }, []);

  // Limpar polling ao desmontar
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
      if (pollingTimeoutRef.current) {
        clearTimeout(pollingTimeoutRef.current);
      }
    };
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    if (pollingTimeoutRef.current) {
      clearTimeout(pollingTimeoutRef.current);
      pollingTimeoutRef.current = null;
    }
    setCheckingPayment(false);
  }, []);

  const checkOrderStatus = useCallback(async (pedidoId: string) => {
    try {
      const response = await fetch(`/api/pedido/status?pedidoId=${pedidoId}`);
      const result = await response.json();

      if (result.success) {
        return {
          isPaid: result.pedido.isPaid,
          status: result.pedido.status_pagamento || "",
        };
      }
      return { isPaid: false, status: "" };
    } catch {
      return { isPaid: false, status: "" };
    }
  }, []);

  const encryptCard = useCallback(
    async (cardData: CardData): Promise<string | null> => {
      if (!window.PagSeguro) {
        setError("SDK do PagBank nao carregado. Recarregue a pagina.");
        return null;
      }

      if (!publicKey) {
        setError("Chave publica do PagBank nao configurada.");
        return null;
      }

      try {
        const result = window.PagSeguro.encryptCard({
          publicKey,
          holder: cardData.holder,
          number: cardData.number,
          expMonth: cardData.expMonth,
          expYear: cardData.expYear,
          securityCode: cardData.securityCode,
        });

        if (result.hasErrors) {
          const errorMessages = Array.isArray(result.errors)
            ? result.errors
                .map((err: any) => err.message || err.description || JSON.stringify(err))
                .join(", ")
            : "Erro ao processar cartao";
          setError(errorMessages);
          return null;
        }

        return result.encryptedCard || null;
      } catch (err) {
        setError("Erro ao criptografar dados do cartao.");
        return null;
      }
    },
    [publicKey]
  );

  const createCardPayment = useCallback(
    async (
      pedidoId: string,
      encryptedCard: string,
      installments: number
    ): Promise<PaymentResult> => {
      setLoading(true);
      setError(null);

      try {
        // Verificar se ja foi pago
        const status = await checkOrderStatus(pedidoId);
        if (status.isPaid) {
          return {
            success: false,
            message: "Este pedido ja foi pago.",
          };
        }

        const response = await fetch("/api/pagbank/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pedidoId,
            paymentMethod: "credit_card",
            encryptedCard,
            installments,
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Erro ao processar pagamento");
        }

        return {
          success: true,
          orderId: result.orderId,
          chargeId: result.chargeId,
          status: result.status,
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erro ao processar pagamento";
        setError(message);
        return { success: false, message };
      } finally {
        setLoading(false);
      }
    },
    [checkOrderStatus]
  );

  const createPixPayment = useCallback(
    async (pedidoId: string): Promise<PaymentResult> => {
      setLoading(true);
      setError(null);

      try {
        // Verificar se ja foi pago
        const status = await checkOrderStatus(pedidoId);
        if (status.isPaid) {
          return {
            success: false,
            message: "Este pedido ja foi pago.",
          };
        }

        const response = await fetch("/api/pagbank/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pedidoId,
            paymentMethod: "pix",
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Erro ao gerar PIX");
        }

        const qrCode: QrCodeData = {
          text: result.qrCode?.text || "",
          imageUrl: result.qrCode?.imageUrl || "",
          expirationDate: result.qrCode?.expirationDate || "",
        };

        setQrCodeData(qrCode);

        return {
          success: true,
          orderId: result.orderId,
          chargeId: result.chargeId,
          status: result.status,
          qrCode,
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erro ao gerar PIX";
        setError(message);
        return { success: false, message };
      } finally {
        setLoading(false);
      }
    },
    [checkOrderStatus]
  );

  const startPaymentPolling = useCallback(
    (
      orderId: string,
      onSuccess: (result: PaymentResult) => void,
      onError: (error: string) => void,
      intervalMs = 5000,
      timeoutMs = 15 * 60 * 1000
    ) => {
      setCheckingPayment(true);

      pollingIntervalRef.current = setInterval(async () => {
        try {
          const response = await fetch(`/api/pagbank/webhook?orderId=${orderId}`);
          const result = await response.json();

          if (result.success && result.order) {
            const order = result.order;
            const charge = order.charges?.[0];

            // Log para debug
            console.log("Polling status:", {
              orderId,
              orderStatus: order.status,
              chargeStatus: charge?.status,
              hasQrCodes: !!order.qr_codes?.length,
            });

            // Para cartao: verificar status do charge
            if (charge) {
              if (charge.status === "PAID" || charge.status === "AUTHORIZED") {
                stopPolling();
                onSuccess({
                  success: true,
                  status: charge.status,
                  message:
                    charge.status === "PAID"
                      ? "Pagamento aprovado!"
                      : "Pagamento autorizado!",
                });
                return;
              } else if (charge.status === "DECLINED" || charge.status === "CANCELED") {
                stopPolling();
                onError(
                  charge.status === "DECLINED"
                    ? "Pagamento recusado. Verifique os dados e tente novamente."
                    : "Pagamento cancelado."
                );
                return;
              }
            }

            // Para PIX: verificar status geral do pedido
            // No sandbox, quando PIX e pago, o status muda para PAID
            if (order.qr_codes && order.qr_codes.length > 0) {
              // Verificar se existe um charge criado apos o pagamento do PIX
              // ou se o status geral indica pagamento
              if (order.status === "PAID") {
                stopPolling();
                onSuccess({
                  success: true,
                  status: "PAID",
                  message: "Pagamento PIX confirmado!",
                });
                return;
              } else if (order.status === "CANCELED") {
                stopPolling();
                onError("Pagamento PIX cancelado ou expirado.");
                return;
              }
            }
          }
        } catch (err) {
          console.error("Erro ao verificar pagamento:", err);
        }
      }, intervalMs);

      // Timeout
      pollingTimeoutRef.current = setTimeout(() => {
        stopPolling();
        onError("Tempo de verificacao expirado. Verifique o status do pedido.");
      }, timeoutMs);
    },
    [stopPolling]
  );

  return {
    loading,
    checkingPayment,
    error,
    publicKey,
    qrCodeData,
    encryptCard,
    createCardPayment,
    createPixPayment,
    startPaymentPolling,
    stopPolling,
    checkOrderStatus,
    clearError,
  };
}
