"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { CheckoutStepper } from "../../CheckoutStepper";
import { BotaoVoltar } from "./BotaoVoltar";
import { PagamentoResumo } from "./PagamentoResumo";
import { ResumoProps } from "./types";
import { usePagBankPayment } from "@/hooks/checkout";
import { formatCountdown } from "@/lib/formatters";

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
    error,
    qrCodeData,
    createPixPayment,
    startPaymentPolling,
    stopPolling,
    checkOrderStatus,
  } = usePagBankPayment();

  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutos
  const [verifyingManually, setVerifyingManually] = useState(false);
  const [verifyMessage, setVerifyMessage] = useState<string | null>(null);
  const [pollingEnabled, setPollingEnabled] = useState(true);
  const pixGeneratedRef = useRef(false);

  const orderIdRef = useRef<string | null>(null);

  // Gerar PIX ao montar (com protecao contra StrictMode)
  useEffect(() => {
    if (pixGeneratedRef.current) return;
    pixGeneratedRef.current = true;

    const generatePix = async () => {
      const result = await createPixPayment(pedidoId);

      if (result.success && result.orderId) {
        orderIdRef.current = result.orderId;
        if (pollingEnabled) {
          startPaymentPolling(
            result.orderId,
            () => onSuccess(),
            (err) => onError(err),
            10000, // 10 segundos (reduz requisicoes)
            15 * 60 * 1000 // 15 minutos
          );
        }
      } else if (result.message) {
        onError(result.message);
      }
    };

    generatePix();

    return () => {
      stopPolling();
    };
  }, [pedidoId]);

  // Controlar polling quando toggle muda
  const handleTogglePolling = () => {
    if (pollingEnabled) {
      stopPolling();
      setPollingEnabled(false);
    } else {
      setPollingEnabled(true);
      if (orderIdRef.current) {
        startPaymentPolling(
          orderIdRef.current,
          () => onSuccess(),
          (err) => onError(err),
          10000,
          15 * 60 * 1000
        );
      }
    }
  };

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

  const handleVerifyPayment = async () => {
    setVerifyingManually(true);
    setVerifyMessage(null);

    try {
      const result = await checkOrderStatus(pedidoId);

      if (result.isPaid) {
        onSuccess();
      } else {
        setVerifyMessage("Pagamento ainda nao identificado. Aguarde alguns instantes apos pagar.");
        setTimeout(() => setVerifyMessage(null), 5000);
      }
    } catch {
      setVerifyMessage("Erro ao verificar. Tente novamente.");
      setTimeout(() => setVerifyMessage(null), 3000);
    } finally {
      setVerifyingManually(false);
    }
  };

  return (
    <div className="bg-white flex flex-col w-full flex-1">
      <CheckoutStepper currentStep="pagamento" />

      <div className="flex justify-center px-4 lg:px-[24px] pt-6 lg:pt-[24px] pb-8 lg:pb-[32px]">
        <div className="flex flex-col gap-8 w-full max-w-[684px]">
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
              {/* Header: Falta pouco + QR Code */}
              <div className="flex flex-col lg:flex-row gap-8 items-start justify-between">
                {/* Lado esquerdo */}
                <div className="flex flex-col gap-6 flex-1">
                  <div className="flex flex-col gap-6">
                    <h1 className="font-cera-pro font-bold text-[24px] text-black">
                      Falta pouco!
                    </h1>
                    <p className="font-cera-pro font-light text-[16px] text-[#111111]">
                      Pague <span className="font-bold">{formatPrice(valorTotal)}</span> para garantir sua compra.
                      <br />
                      Seu codigo expira em:
                    </p>
                    {/* Timer Badge */}
                    <div className="inline-flex items-center gap-2 px-3 py-2 border border-[#d2d2d2] rounded-full w-fit">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M12 5.5V12L16.5 14.5" stroke="#E7A63A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <circle cx="12" cy="12" r="9" stroke="#E7A63A" strokeWidth="2"/>
                        <path d="M12 2V4" stroke="#E7A63A" strokeWidth="2" strokeLinecap="round"/>
                        <path d="M10 2H14" stroke="#E7A63A" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                      <span className="font-cera-pro font-bold text-[20px] text-[#254333]">
                        {formatCountdown(timeLeft)}
                      </span>
                    </div>
                  </div>

                  {/* Instrucoes QR Code */}
                  <div className="flex flex-col gap-6">
                    <p className="font-cera-pro font-medium text-[16px] text-black">
                      Pagar com QR Code
                    </p>
                    <div className="font-cera-pro font-light text-[14px] text-black leading-relaxed">
                      <p><span className="font-bold">1.</span> Acesse o app do seu banco ou de pagamentos.</p>
                      <p><span className="font-bold">2.</span> Escolha pagar via Pix.</p>
                      <p><span className="font-bold">3.</span> Selecione &quot;Codigo QR&quot; ou &quot;QR Code&quot;.</p>
                      <p><span className="font-bold">4.</span> Aponte a camera do celular para o codigo.</p>
                    </div>
                  </div>
                </div>

                {/* QR Code - lado direito */}
                <div className="shrink-0">
                  {qrCodeData.imageUrl ? (
                    <Image
                      src={qrCodeData.imageUrl}
                      alt="QR Code PIX"
                      width={303}
                      height={303}
                      className="w-[200px] h-[200px] lg:w-[303px] lg:h-[303px]"
                    />
                  ) : (
                    <div className="w-[200px] h-[200px] lg:w-[303px] lg:h-[303px] bg-gray-100 flex items-center justify-center rounded-[8px]">
                      <span className="text-gray-400">QR Code</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Codigo PIX + Botao Copiar */}
              <div className="flex flex-col gap-4">
                <div className="bg-[#f3f3f3] rounded-[8px] p-4">
                  <p className="font-cera-pro font-light text-[14px] text-black text-center break-all">
                    {qrCodeData.text}
                  </p>
                </div>
                <button
                  onClick={copyToClipboard}
                  className="w-full h-[64px] bg-[#254333] rounded-[8px] flex items-center justify-center gap-2 hover:bg-[#1a2e24] transition-colors"
                >
                  <span className="font-cera-pro font-bold text-[24px] text-white">
                    {copied ? "Codigo copiado!" : "Copiar codigo Pix"}
                  </span>
                  {!copied && (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <rect x="9" y="9" width="11" height="11" rx="2" stroke="white" strokeWidth="2"/>
                      <path d="M5 15V5C5 3.89543 5.89543 3 7 3H15" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  )}
                </button>
              </div>

              {/* Instrucoes Copia e Cola */}
              <div className="flex flex-col gap-4">
                <p className="font-cera-pro font-medium text-[16px] text-black leading-relaxed">
                  Para pagar com o codigo siga as instrucoes abaixo:
                </p>
                <div className="font-cera-pro font-light text-[14px] text-[#333333] leading-relaxed">
                  <p><span className="font-bold">1.</span> Copie o codigo no botao acima.</p>
                  <p><span className="font-bold">2.</span> Acesse o app do seu banco ou de pagamentos.</p>
                  <p><span className="font-bold">3.</span> Escolha pagar via Pix &quot;Copia e Cola&quot;.</p>
                  <p><span className="font-bold">4.</span> Cole o codigo copiado e realize o pagamento.</p>
                </div>
                <p className="font-cera-pro font-light text-[14px] text-[#333333] leading-relaxed">
                  Limites do Pix: por padrao do Banco Central, transacoes realizadas entre as 20h e 6h tem limite de R$1mil. Verifique os limites junto ao seu banco.
                </p>
              </div>

              {/* Botoes: Ir para pagina inicial + Ja realizei o Pix */}
              <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">
                <button
                  onClick={() => router.push("/figma")}
                  className="flex-1 h-[60px] bg-[#d8f9e7] rounded-[8px] flex items-center justify-center hover:bg-[#c5f0da] transition-colors"
                >
                  <span className="font-cera-pro font-bold text-[20px] lg:text-[24px] text-[#254333]">
                    Ir para pagina inicial
                  </span>
                </button>
                <button
                  onClick={handleVerifyPayment}
                  disabled={verifyingManually}
                  className="flex-1 h-[60px] bg-[#254333] rounded-[8px] flex items-center justify-center gap-2 hover:bg-[#1a2e24] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {verifyingManually ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span className="font-cera-pro font-bold text-[20px] lg:text-[24px] text-white">
                        Verificando...
                      </span>
                    </>
                  ) : (
                    <span className="font-cera-pro font-bold text-[20px] lg:text-[24px] text-white">
                      Ja realizei o Pix
                    </span>
                  )}
                </button>
              </div>

              {/* Mensagem de verificacao */}
              {verifyMessage && (
                <p className="font-cera-pro text-[14px] text-center text-amber-600">
                  {verifyMessage}
                </p>
              )}

              {/* Toggle Polling (Debug) */}
              <div className="flex items-center justify-between p-3 bg-gray-100 rounded-[8px]">
                <span className="font-cera-pro text-[14px] text-gray-600">
                  Polling automatico {pollingEnabled ? "(ativo)" : "(desativado)"}
                </span>
                <button
                  onClick={handleTogglePolling}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    pollingEnabled ? "bg-[#254333]" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      pollingEnabled ? "left-7" : "left-1"
                    }`}
                  />
                </button>
              </div>

              {/* Resumo */}
              <PagamentoResumo {...resumoProps} />
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
