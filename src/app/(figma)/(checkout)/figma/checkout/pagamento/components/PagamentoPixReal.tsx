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

interface PreGeneratedPix {
  qrCode: { text: string; imageUrl: string; expirationDate: string };
  orderId: string;
}

interface PagamentoPixRealProps {
  pedidoId: string;
  valorTotal: number;
  formatPrice: (price: number) => string;
  onVoltar: () => void;
  onSuccess: () => void;
  onError: (error: string) => void;
  externalError?: string | null;
  onClearExternalError?: () => void;
  resumoProps: ResumoProps;
  preGenerated?: PreGeneratedPix | null;
}

export function PagamentoPixReal({
  pedidoId,
  valorTotal,
  formatPrice,
  onVoltar,
  onSuccess,
  onError,
  externalError = null,
  onClearExternalError,
  resumoProps,
  preGenerated = null,
}: PagamentoPixRealProps) {
  const {
    loading: hookLoading,
    error,
    qrCodeData: hookQrCodeData,
    createPixPayment,
    startPaymentPolling,
    stopPolling,
    checkOrderStatus,
    clearError,
  } = usePagBankPayment();

  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutos
  const [verifyingManually, setVerifyingManually] = useState(false);
  const [verifyMessage, setVerifyMessage] = useState<string | null>(null);
  const [pollingEnabled, setPollingEnabled] = useState(true);
  const [simulatingPayment, setSimulatingPayment] = useState(false);
  const pixGeneratedRef = useRef(false);

  // Se Pix foi pré-gerado pelo pai, usar esses dados; senão usar do hook
  const qrCodeData = preGenerated ? preGenerated.qrCode : hookQrCodeData;
  const loading = preGenerated ? false : hookLoading;

  const orderIdRef = useRef<string | null>(preGenerated?.orderId ?? null);

  // Gerar PIX ao montar — pula se já foi pré-gerado
  useEffect(() => {
    if (preGenerated) {
      // Pix já foi gerado pelo pai, apenas iniciar polling
      if (pixGeneratedRef.current) return;
      pixGeneratedRef.current = true;
      orderIdRef.current = preGenerated.orderId;

      if (pollingEnabled) {
        startPaymentPolling(
          preGenerated.orderId,
          () => onSuccess(),
          (err) => onError(err),
          10000,
          15 * 60 * 1000
        );
      }

      return () => {
        stopPolling();
      };
    }

    // Fluxo original: gerar Pix internamente
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
            10000,
            15 * 60 * 1000
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
  }, [pedidoId, preGenerated]);

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

    // Sync countdown with PagBank expiration when available.
    if (qrCodeData.expirationDate) {
      const exp = new Date(qrCodeData.expirationDate).getTime();
      if (Number.isFinite(exp)) {
        const seconds = Math.max(0, Math.floor((exp - Date.now()) / 1000));
        setTimeLeft(seconds);
      }
    }

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

  // When PIX expires, stop polling and block usage of the old code.
  useEffect(() => {
    if (!qrCodeData) return;
    if (timeLeft > 0) return;

    stopPolling();
    setPollingEnabled(false);
  }, [qrCodeData, timeLeft, stopPolling]);

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

  const handleRegeneratePix = async () => {
    if (loading) return;

    setVerifyMessage(null);
    setCopied(false);
    onClearExternalError?.();
    clearError();

    stopPolling();
    setPollingEnabled(true);
    setTimeLeft(15 * 60);

    const result = await createPixPayment(pedidoId);

    if (result.success && result.orderId) {
      orderIdRef.current = result.orderId;
      startPaymentPolling(
        result.orderId,
        () => onSuccess(),
        (err) => onError(err),
        10000,
        15 * 60 * 1000,
      );
    } else if (result.message) {
      onError(result.message);
    }
  };

  const handleSimulatePixPayment = async () => {
    setSimulatingPayment(true);
    try {
      const res = await fetch("/api/dev/simulate-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pedidoId, paymentMethod: "pix" }),
      });
      const data = await res.json();
      if (data.success) {
        onSuccess();
      } else {
        onError(data.error || "Erro ao simular pagamento PIX");
      }
    } catch {
      onError("Erro ao simular pagamento PIX");
    } finally {
      setSimulatingPayment(false);
    }
  };

  return (
    <div className="bg-white flex flex-col w-full flex-1">
      <CheckoutStepper currentStep="pagamento" />

      <div className="flex justify-center px-4 lg:px-[24px] pt-2 lg:pt-[12px] pb-6 lg:pb-[32px]">
        <div className="flex flex-col gap-4 lg:gap-8 w-full max-w-[684px]">
          <BotaoVoltar onClick={onVoltar} />

          {externalError ? (
            <div className="bg-red-50 border border-red-200 rounded-[8px] p-4 flex items-start justify-between gap-4">
              <div className="flex flex-col gap-1">
                <p className="font-cera-pro font-bold text-[14px] text-red-700">
                  Erro no pagamento
                </p>
                <p className="font-cera-pro text-[12px] text-red-600">{externalError}</p>
              </div>
              {onClearExternalError ? (
                <button
                  type="button"
                  onClick={onClearExternalError}
                  className="font-cera-pro text-[12px] text-red-700 underline"
                >
                  Fechar
                </button>
              ) : null}
            </div>
          ) : null}

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
            timeLeft === 0 ? (
              <>
                <div className="bg-amber-50 border border-amber-200 rounded-[8px] p-6 text-center">
                  <p className="font-cera-pro font-bold text-[18px] text-amber-700 mb-2">
                    PIX expirado
                  </p>
                  <p className="font-cera-pro text-[14px] text-amber-700">
                    O codigo PIX expirou. Gere um novo codigo para continuar o pagamento.
                  </p>
                </div>

                <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">
                  <button
                    onClick={handleRegeneratePix}
                    disabled={loading}
                    className="flex-1 h-[60px] bg-[#254333] rounded-[8px] flex items-center justify-center hover:bg-[#1a2e24] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    <span className="font-cera-pro font-bold text-[20px] lg:text-[24px] text-white">
                      Gerar novo codigo
                    </span>
                  </button>
                  <button
                    onClick={onVoltar}
                    className="flex-1 h-[60px] bg-white border border-[#254333] rounded-[8px] flex items-center justify-center hover:bg-[#f8f3ed] transition-colors"
                  >
                    <span className="font-cera-pro font-bold text-[20px] lg:text-[24px] text-[#254333]">
                      Voltar
                    </span>
                  </button>
                </div>

                <PagamentoResumo {...resumoProps} />
              </>
            ) : (
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
                  onClick={() => router.push("/figma/design")}
                  className="py-2 flex-1 h-[60px] bg-[#d8f9e7] rounded-[8px] flex items-center justify-center hover:bg-[#c5f0da] transition-colors"
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
                    <span className="py-2 font-cera-pro font-bold text-[20px] lg:text-[24px] text-white">
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

              {/* Toggle Polling (Debug) + Simular Pagamento PIX (Sandbox) */}
              {process.env.NEXT_PUBLIC_DEV_TOOLS === "true" && (
                <>
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

                  <button
                    onClick={handleSimulatePixPayment}
                    disabled={simulatingPayment}
                    className="w-full p-3 bg-gray-100 rounded-[8px] text-[14px] text-gray-500 hover:text-gray-700 hover:bg-gray-200 transition-colors disabled:opacity-50"
                  >
                    {simulatingPayment ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                        Simulando pagamento PIX...
                      </span>
                    ) : (
                      "Simular pagamento PIX"
                    )}
                  </button>
                </>
              )}

              {/* Resumo */}
              <PagamentoResumo {...resumoProps} />
            </>
            )
          ) : null}
        </div>
      </div>
    </div>
  );
}
