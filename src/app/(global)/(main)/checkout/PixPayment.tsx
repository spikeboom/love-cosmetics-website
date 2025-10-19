"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface PixPaymentProps {
  pedidoId: string;
  onSuccess: (result: any) => void;
  onError: (error: string) => void;
}

export default function PixPayment({
  pedidoId,
  onSuccess,
  onError,
}: PixPaymentProps) {
  const [loading, setLoading] = useState(false);
  const [qrCodeData, setQrCodeData] = useState<{
    text: string;
    imageUrl: string;
    expirationDate: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const [checkingPayment, setCheckingPayment] = useState(false);

  const generatePix = async () => {
    setLoading(true);

    try {
      const response = await fetch("/api/pagbank/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pedidoId,
          paymentMethod: "pix",
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Erro ao gerar PIX");
      }

      setQrCodeData(result.qrCode);

      // Iniciar verificação automática de pagamento
      startPaymentCheck(result.orderId);
    } catch (error) {
      console.error("Erro ao gerar PIX:", error);
      onError(
        error instanceof Error ? error.message : "Erro ao gerar código PIX"
      );
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!qrCodeData?.text) return;

    try {
      await navigator.clipboard.writeText(qrCodeData.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (error) {
      console.error("Erro ao copiar:", error);
      onError("Erro ao copiar código PIX");
    }
  };

  // Verificar status do pagamento periodicamente
  const startPaymentCheck = (orderId: string) => {
    setCheckingPayment(true);

    const intervalId = setInterval(async () => {
      try {
        const response = await fetch(
          `/api/pagbank/webhook?orderId=${orderId}`
        );
        const result = await response.json();

        if (result.success && result.order) {
          const charge = result.order.charges?.[0];

          // Se o pagamento foi confirmado
          if (charge?.status === "PAID") {
            clearInterval(intervalId);
            setCheckingPayment(false);
            onSuccess({
              success: true,
              status: "PAID",
              message: "Pagamento PIX confirmado!",
            });
          }
        }
      } catch (error) {
        console.error("Erro ao verificar pagamento:", error);
      }
    }, 5000); // Verificar a cada 5 segundos

    // Parar de verificar após 15 minutos
    setTimeout(() => {
      clearInterval(intervalId);
      setCheckingPayment(false);
    }, 15 * 60 * 1000);
  };

  // Formatar data de expiração
  const formatExpirationDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-white p-6 shadow-md">
        <h3 className="mb-4 text-lg font-semibold">Pagamento com PIX</h3>

        {!qrCodeData ? (
          // Botão para gerar PIX
          <div className="text-center">
            <p className="mb-4 text-gray-600">
              Clique no botão abaixo para gerar o código PIX
            </p>
            <button
              onClick={generatePix}
              disabled={loading}
              className="w-full rounded-md bg-teal-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-teal-700 disabled:bg-gray-400"
            >
              {loading ? "Gerando..." : "Gerar Código PIX"}
            </button>
          </div>
        ) : (
          // Exibir QR Code e código copiável
          <div className="space-y-4">
            {/* QR Code */}
            <div className="flex justify-center">
              <div className="rounded-lg border-4 border-gray-200 p-2">
                {qrCodeData.imageUrl && (
                  <Image
                    src={qrCodeData.imageUrl}
                    alt="QR Code PIX"
                    width={256}
                    height={256}
                    className="h-64 w-64"
                  />
                )}
              </div>
            </div>

            {/* Instruções */}
            <div className="rounded-md bg-teal-50 p-4">
              <h4 className="mb-2 font-semibold text-teal-900">
                Como pagar:
              </h4>
              <ol className="list-inside list-decimal space-y-1 text-sm text-teal-800">
                <li>Abra o app do seu banco</li>
                <li>Escolha pagar com PIX</li>
                <li>Escaneie o QR Code acima ou copie o código abaixo</li>
                <li>Confirme o pagamento</li>
              </ol>
            </div>

            {/* Código PIX Copiável */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Código PIX (Pix Copia e Cola)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={qrCodeData.text}
                  readOnly
                  className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
                <button
                  onClick={copyToClipboard}
                  className="rounded-md bg-pink-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-pink-700"
                >
                  {copied ? "✓ Copiado!" : "Copiar"}
                </button>
              </div>
            </div>

            {/* Data de Expiração */}
            <div className="text-center text-sm text-gray-600">
              <p>
                Válido até:{" "}
                {formatExpirationDate(qrCodeData.expirationDate)}
              </p>
            </div>

            {/* Status de Verificação */}
            {checkingPayment && (
              <div className="rounded-md bg-blue-50 p-4 text-center">
                <div className="mb-2 flex justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                </div>
                <p className="text-sm font-medium text-blue-900">
                  Aguardando pagamento...
                </p>
                <p className="text-xs text-blue-700">
                  Você será notificado automaticamente quando o pagamento for
                  confirmado
                </p>
              </div>
            )}

            {/* Informações de Segurança */}
            <div className="mt-4 text-center text-xs text-gray-500">
              <p>🔒 Transação segura via PIX</p>
              <p>Processado por PagBank - PagSeguro UOL</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
