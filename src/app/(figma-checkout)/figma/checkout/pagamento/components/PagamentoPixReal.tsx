"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { CheckoutStepper } from "../../CheckoutStepper";
import { BotaoVoltar } from "./BotaoVoltar";
import { PagamentoResumo } from "./PagamentoResumo";
import { ResumoProps } from "./types";
import { usePagBankPayment } from "@/hooks/checkout";

interface PagamentoPixRealProps {
  pedidoId: string;
  valorTotal: number;
  formatPrice: (price: number) => string;
  onVoltar: () => void;
  onSuccess: () => void;
  onError: (error: string) => void;
  resumoProps: ResumoProps;
}

export function PagamentoPixReal({
  pedidoId,
  valorTotal,
  formatPrice,
  onVoltar,
  onSuccess,
  onError,
  resumoProps,
}: PagamentoPixRealProps) {
  const {
    loading,
    checkingPayment,
    error,
    qrCodeData,
    createPixPayment,
    startPaymentPolling,
    stopPolling,
  } = usePagBankPayment();

  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutos
  const pixGeneratedRef = useRef(false);

  // Gerar PIX ao montar (com proteção contra StrictMode)
  useEffect(() => {
    if (pixGeneratedRef.current) return;
    pixGeneratedRef.current = true;

    const generatePix = async () => {
      const result = await createPixPayment(pedidoId);

      if (result.success && result.orderId) {
        startPaymentPolling(
          result.orderId,
          () => onSuccess(),
          (err) => onError(err),
          5000, // 5 segundos
          15 * 60 * 1000 // 15 minutos
        );
      } else if (result.message) {
        onError(result.message);
      }
    };

    generatePix();

    return () => {
      stopPolling();
    };
  }, [pedidoId]);

  // Timer countdown
  useEffect(() => {
    if (!qrCodeData) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [qrCodeData]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const copyToClipboard = async () => {
    if (!qrCodeData?.text) return;

    try {
      await navigator.clipboard.writeText(qrCodeData.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      // Fallback
      const textArea = document.createElement("textarea");
      textArea.value = qrCodeData.text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  return (
    <div className="bg-white flex flex-col w-full flex-1">
      <CheckoutStepper currentStep="pagamento" />

      <div className="flex justify-center px-4 lg:px-[24px] pt-6 lg:pt-[24px] pb-8 lg:pb-[32px]">
        <div className="flex flex-col gap-6 lg:gap-[32px] w-full max-w-[684px]">
          <BotaoVoltar onClick={onVoltar} />

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-12 h-12 border-4 border-[#254333] border-t-transparent rounded-full animate-spin mb-4" />
              <p className="font-cera-pro text-[16px] text-[#333333]">
                Gerando codigo PIX...
              </p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-[8px] p-6 text-center">
              <p className="font-cera-pro font-bold text-[18px] text-red-600 mb-2">
                Erro ao gerar PIX
              </p>
              <p className="font-cera-pro text-[14px] text-red-500">{error}</p>
              <button
                onClick={onVoltar}
                className="mt-4 px-6 py-2 bg-[#254333] text-white rounded-[8px] font-cera-pro"
              >
                Voltar
              </button>
            </div>
          ) : qrCodeData ? (
            <>
              {/* Timer e Valor */}
              <div className="flex flex-col items-center gap-4">
                <div className="flex items-center gap-2">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="#254333" strokeWidth="2" />
                    <path d="M12 6V12L16 14" stroke="#254333" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  <span className="font-cera-pro font-bold text-[24px] text-[#254333]">
                    {formatTime(timeLeft)}
                  </span>
                </div>
                <p className="font-cera-pro font-bold text-[28px] text-[#254333]">
                  {formatPrice(valorTotal)}
                </p>
              </div>

              {/* QR Code */}
              <div className="flex justify-center">
                <div className="bg-white p-4 rounded-[8px] border border-[#d2d2d2]">
                  {qrCodeData.imageUrl ? (
                    <Image
                      src={qrCodeData.imageUrl}
                      alt="QR Code PIX"
                      width={200}
                      height={200}
                      className="w-[200px] h-[200px]"
                    />
                  ) : (
                    <div className="w-[200px] h-[200px] bg-gray-100 flex items-center justify-center">
                      <span className="text-gray-400">QR Code</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Codigo Copia e Cola */}
              <div className="flex flex-col gap-3">
                <label className="font-cera-pro font-bold text-[16px] text-black">
                  Ou copie o codigo:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={qrCodeData.text}
                    readOnly
                    className="flex-1 h-[48px] px-4 bg-gray-50 border border-[#d2d2d2] rounded-[8px] font-cera-pro text-[14px] text-[#333333] truncate"
                  />
                  <button
                    onClick={copyToClipboard}
                    className="px-6 h-[48px] bg-[#254333] text-white rounded-[8px] font-cera-pro font-bold text-[16px] hover:bg-[#1a2e24] transition-colors"
                  >
                    {copied ? "Copiado!" : "Copiar"}
                  </button>
                </div>
              </div>

              {/* Instrucoes */}
              <div className="bg-[#f8f3ed] rounded-[8px] p-6">
                <h3 className="font-cera-pro font-bold text-[18px] text-[#254333] mb-4">
                  Como pagar:
                </h3>
                <ol className="list-decimal list-inside space-y-2 font-cera-pro text-[14px] text-[#333333]">
                  <li>Abra o app do seu banco</li>
                  <li>Escolha pagar com PIX</li>
                  <li>Escaneie o QR Code ou cole o codigo</li>
                  <li>Confirme o pagamento</li>
                </ol>
              </div>

              {/* Status de Verificacao */}
              {checkingPayment && (
                <div className="bg-blue-50 border border-blue-200 rounded-[8px] p-4 flex items-center gap-3">
                  <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  <div>
                    <p className="font-cera-pro font-bold text-[14px] text-blue-700">
                      Aguardando pagamento...
                    </p>
                    <p className="font-cera-pro text-[12px] text-blue-600">
                      Voce sera notificado quando o pagamento for confirmado
                    </p>
                  </div>
                </div>
              )}

              <PagamentoResumo {...resumoProps} />
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
