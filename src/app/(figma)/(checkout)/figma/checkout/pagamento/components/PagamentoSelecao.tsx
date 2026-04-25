"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { CheckoutStepper } from "../../CheckoutStepper";
import { BotaoVoltar } from "./BotaoVoltar";
import { PagamentoResumo } from "./PagamentoResumo";
import { ResumoProps } from "./types";
import { usePagBankPayment } from "@/hooks/checkout";
import { formatCardNumber, formatValidade, formatCVV } from "@/lib/formatters";

type MetodoPagamento = "pix" | "cartao";
type Parcelas = 1 | 2 | 3;

interface CartaoFormData {
  numero: string;
  nome: string;
  validade: string;
  cvv: string;
  parcelas: Parcelas;
}

interface PagamentoSelecaoProps {
  valorTotal: number;
  formatPrice: (price: number) => string;
  onSelecionarPix: () => void;
  onSelecionarCartao: () => void;
  onVoltar: () => void;
  resumoProps: ResumoProps;
  loading?: boolean;
  errorMessage?: string | null;
  onClearError?: () => void;
  // Card payment props
  pedidoId?: string | null;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  /**
   * Disparado quando o PagBank retorna recusa de forma sincrona.
   * O caller decide renderizar o modal com o motivo amigavel (decline-reasons.ts).
   */
  onDeclined?: (info: {
    paymentResponse: {
      code?: string;
      message?: string;
      reference?: string;
      raw_data?: { reason_code?: string; nsu?: string; authorization_code?: string };
    } | null;
    pedidoId: string;
  }) => void;
  /**
   * Disparado quando a retentativa retorna COUPON_UNAVAILABLE — o caller
   * pergunta se o cliente quer seguir sem o cupom.
   */
  onCouponUnavailable?: (info: {
    cupom: string | null;
    novoTotal?: number;
    totalAtual?: number;
  }) => void;
  /** Quando true, a proxima chamada de create-order ignora o cupom. */
  skipCupomOnNextAttempt?: boolean;
  /** Trigger externo: incrementar para forcar nova tentativa do cartao atual. */
  retryNonce?: number;
}

export function PagamentoSelecao({
  valorTotal,
  formatPrice,
  onSelecionarPix,
  onSelecionarCartao,
  onVoltar,
  resumoProps,
  loading = false,
  errorMessage = null,
  onClearError,
  pedidoId,
  onSuccess,
  onError,
  onDeclined,
  onCouponUnavailable,
  skipCupomOnNextAttempt = false,
  retryNonce = 0,
}: PagamentoSelecaoProps) {
  const [selected, setSelected] = useState<MetodoPagamento | null>(null);
  const [pulsing, setPulsing] = useState<MetodoPagamento | null>(null);

  // Card form state
  const [cartaoData, setCartaoData] = useState<CartaoFormData>({
    numero: "",
    nome: "",
    validade: "",
    cvv: "",
    parcelas: 1,
  });
  const [cartaoErrors, setCartaoErrors] = useState<Partial<Record<keyof CartaoFormData, string>>>({});
  const [showTestCards, setShowTestCards] = useState(false);
  const [simulatingPayment, setSimulatingPayment] = useState(false);

  const pagbank = usePagBankPayment();

  // Reset pulse when loading ends with error
  useEffect(() => {
    if (!loading && errorMessage) {
      setPulsing(null);
    }
  }, [loading, errorMessage]);

  const handleSelecionar = (metodo: MetodoPagamento) => {
    if (loading || pulsing) return;

    if (metodo === "pix") {
      setPulsing("pix");
      onSelecionarPix();
    } else {
      // Card: just select, don't trigger order creation yet
      setSelected("cartao");
    }
  };

  // Card form logic
  const MIN_PARCELA = 5;
  const parcelas = [
    { valor: 1 as Parcelas, total: valorTotal },
    { valor: 2 as Parcelas, total: valorTotal / 2 },
    { valor: 3 as Parcelas, total: valorTotal / 3 },
  ].filter((p) => p.valor === 1 || p.total >= MIN_PARCELA);

  const testCards = [
    { numero: "4539620659922097", cvv: "123", bandeira: "VISA", status: "Aprovado" },
    { numero: "4929291898380766", cvv: "123", bandeira: "VISA", status: "Recusado" },
    { numero: "5240082975622454", cvv: "123", bandeira: "MASTER", status: "Aprovado" },
    { numero: "5530062640663264", cvv: "123", bandeira: "MASTER", status: "Recusado" },
    { numero: "345817690311361", cvv: "1234", bandeira: "AMEX", status: "Aprovado" },
    { numero: "372938001199778", cvv: "1234", bandeira: "AMEX", status: "Recusado" },
    { numero: "6062828598919021", cvv: "123", bandeira: "ELO", status: "Aprovado" },
    { numero: "6062822916014409", cvv: "123", bandeira: "ELO", status: "Recusado" },
  ];

  const selectTestCard = (card: typeof testCards[0]) => {
    setCartaoData((prev) => ({
      ...prev,
      numero: formatCardNumber(card.numero),
      cvv: card.cvv,
      validade: "12/26",
      nome: "TESTE SANDBOX",
    }));
    setShowTestCards(false);
  };

  const handleCardChange = (field: keyof CartaoFormData, value: string | number) => {
    let formattedValue = value;
    if (field === "numero" && typeof value === "string") formattedValue = formatCardNumber(value);
    else if (field === "validade" && typeof value === "string") formattedValue = formatValidade(value);
    else if (field === "cvv" && typeof value === "string") formattedValue = formatCVV(value);

    setCartaoData((prev) => ({ ...prev, [field]: formattedValue }));
    if (cartaoErrors[field]) setCartaoErrors((prev) => ({ ...prev, [field]: undefined }));
    if (pagbank.error) pagbank.clearError();
    if (errorMessage) onClearError?.();
  };

  const validateCardForm = () => {
    const newErrors: Partial<Record<keyof CartaoFormData, string>> = {};
    const numeroLimpo = cartaoData.numero.replace(/\s/g, "");
    if (!numeroLimpo || numeroLimpo.length < 13) newErrors.numero = "Numero do cartao invalido";
    if (!cartaoData.nome || cartaoData.nome.trim().length < 3) newErrors.nome = "Nome obrigatorio";
    if (!cartaoData.validade || cartaoData.validade.length < 5) newErrors.validade = "Validade invalida";
    if (!cartaoData.cvv || cartaoData.cvv.length < 3) newErrors.cvv = "CVV invalido";
    setCartaoErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Guard contra double-submit (cliente clicando rapido em Finalizar Compra
  // ou disparos concorrentes entre o useEffect e o handler do botao).
  const processingRef = useRef(false);

  // Callbacks via ref para que o useCallback abaixo nao precise re-criar a
  // funcao quando o pai re-renderiza (e tambem para evitar que o closure
  // capture uma versao antiga do callback).
  const callbacksRef = useRef({ onSuccess, onError, onDeclined, onCouponUnavailable });
  useEffect(() => {
    callbacksRef.current = { onSuccess, onError, onDeclined, onCouponUnavailable };
  }, [onSuccess, onError, onDeclined, onCouponUnavailable]);

  const processCardPayment = useCallback(
    async (effectivePedidoId: string, opts: { skipCupom: boolean }) => {
      if (processingRef.current) return;
      if (!cartaoData.numero) return;
      processingRef.current = true;

      try {
        const [expMonth, expYearShort] = cartaoData.validade.split("/");
        const expYear = `20${expYearShort}`;

        const encryptedCard = await pagbank.encryptCard({
          holder: cartaoData.nome.toUpperCase(),
          number: cartaoData.numero.replace(/\s/g, ""),
          expMonth,
          expYear,
          securityCode: cartaoData.cvv,
        });

        if (!encryptedCard) return;

        const result = await pagbank.createCardPayment(
          effectivePedidoId,
          encryptedCard,
          cartaoData.parcelas,
          { skipCupom: opts.skipCupom },
        );

        // Cupom esgotou no momento da retentativa: caller pergunta se segue sem.
        if (!result.success && result.errorCode === "COUPON_UNAVAILABLE") {
          callbacksRef.current.onCouponUnavailable?.({
            cupom: (result.errorDetails?.cupom as string | null) ?? null,
            novoTotal: result.errorDetails?.novo_total as number | undefined,
            totalAtual: result.errorDetails?.total_atual as number | undefined,
          });
          return;
        }

        if (result.success && result.orderId) {
          if (result.status === "PAID" || result.status === "AUTHORIZED") {
            callbacksRef.current.onSuccess?.();
            return;
          }
          // PagBank ja respondeu DECLINED de forma sincrona: nao entrar em
          // polling, apresentar o motivo imediatamente.
          if (result.status === "DECLINED") {
            callbacksRef.current.onDeclined?.({
              paymentResponse: result.paymentResponse ?? null,
              pedidoId: effectivePedidoId,
            });
            return;
          }
          // IN_ANALYSIS / outros: cair no polling padrao (webhook ainda nao chegou).
          pagbank.startPaymentPolling(
            { pedidoId: effectivePedidoId, pagbankOrderId: result.orderId },
            () => callbacksRef.current.onSuccess?.(),
            (err) => callbacksRef.current.onError?.(err),
            3000,
            2 * 60 * 1000,
          );
          return;
        }

        if (result.message) {
          callbacksRef.current.onError?.(result.message);
        }
      } finally {
        processingRef.current = false;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cartaoData.numero, cartaoData.nome, cartaoData.validade, cartaoData.cvv, cartaoData.parcelas],
  );

  const handleFinalizarCompra = async () => {
    if (selected !== "cartao") return;
    if (!validateCardForm()) return;

    // 1a tentativa: pedido ainda nao existe -> parent cria e o useEffect abaixo
    // dispara o pagamento quando pedidoId chega. Retentativas: pedido ja existe,
    // chamamos direto aqui (o useEffect nao re-dispara porque pedidoId nao muda).
    if (pedidoId) {
      processCardPayment(pedidoId, { skipCupom: skipCupomOnNextAttempt });
    } else {
      onSelecionarCartao();
    }
  };

  // Quando pedidoId acaba de chegar (1a tentativa) ou retryNonce incrementa
  // (cliente confirmou seguir sem cupom), dispara o pagamento.
  useEffect(() => {
    if (!pedidoId || selected !== "cartao") return;
    processCardPayment(pedidoId, { skipCupom: skipCupomOnNextAttempt });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pedidoId, retryNonce]);

  const handleSimulatePayment = async () => {
    if (!pedidoId) return;
    setSimulatingPayment(true);
    try {
      const res = await fetch("/api/dev/simulate-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pedidoId, paymentMethod: "credit_card", installments: cartaoData.parcelas }),
      });
      const data = await res.json();
      if (data.success) {
        onSuccess?.();
      } else {
        onError?.(data.error || "Erro ao simular pagamento");
      }
    } catch {
      onError?.("Erro ao simular pagamento");
    } finally {
      setSimulatingPayment(false);
    }
  };

  const isProcessingCard = pagbank.loading || pagbank.checkingPayment;
  const finalizarDisabled = selected !== "cartao" || loading || isProcessingCard || !!pulsing;

  return (
    <div className="bg-white flex flex-col w-full flex-1">
      <CheckoutStepper currentStep="pagamento" />

      <div className="flex justify-center px-4 lg:px-[24px] pt-2 lg:pt-[12px] pb-6 lg:pb-[32px]">
        <div className="flex flex-col gap-2 lg:gap-[32px] w-full max-w-[684px]">
          <BotaoVoltar onClick={onVoltar} />

          <PagamentoResumo {...resumoProps} />

          {/* Secao de Pagamento */}
          <div className="flex flex-col gap-2 pb-4">
            <div className="flex flex-col gap-2">
              <h2 className="font-cera-pro font-bold text-[18px] lg:text-[20px] text-black">
                Pagamento
              </h2>
              <p className="font-cera-pro font-light text-[14px] lg:text-[16px] text-[#111111]">
                Selecione a forma de pagamento:
              </p>
            </div>

            {errorMessage ? (
              <div className="bg-red-50 border border-red-200 rounded-[8px] p-4 flex items-start justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <p className="font-cera-pro font-bold text-[14px] text-red-700">
                    Erro no pagamento
                  </p>
                  <p className="font-cera-pro text-[12px] text-red-600">
                    {errorMessage}
                  </p>
                </div>
                {onClearError ? (
                  <button
                    type="button"
                    onClick={onClearError}
                    className="font-cera-pro text-[12px] text-red-700 underline"
                  >
                    Fechar
                  </button>
                ) : null}
              </div>
            ) : null}

            {pagbank.error && (
              <div className="bg-red-50 border border-red-200 rounded-[8px] p-4">
                <p className="font-cera-pro font-bold text-[14px] text-red-600">Erro no pagamento</p>
                <p className="font-cera-pro text-[12px] text-red-500">{pagbank.error}</p>
              </div>
            )}

            {/* Opcoes de Pagamento */}
            <div className="flex flex-col gap-4">
              {/* PIX */}
              <button
                onClick={() => handleSelecionar("pix")}
                disabled={loading || !!pulsing || isProcessingCard}
                className={`w-full rounded-[8px] border bg-white p-4 text-left transition-all shadow-[0px_1px_2px_0px_rgba(0,0,0,0.3),0px_1px_3px_1px_rgba(0,0,0,0.15)] hover:shadow-[0px_2px_4px_0px_rgba(0,0,0,0.3),0px_2px_6px_2px_rgba(0,0,0,0.15)] disabled:opacity-70 ${
                  pulsing === "pix" ? "animate-pulse-once border-[#E7A63A] !shadow-[0px_0px_0px_3px_rgba(231,166,58,0.3)]" : "border-transparent"
                }`}
              >
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-1">
                    <Image src="/icons/pix.svg" alt="Pix" width={24} height={24} />
                    <span className="font-cera-pro font-bold text-[18px] lg:text-[20px] text-[#254333]">
                      Pix {formatPrice(valorTotal)}
                    </span>
                  </div>
                  <div className="bg-[#f8f3ed] px-4 py-1 rounded flex items-center gap-1">
                    <Image src="/icons/verified.svg" alt="" width={16} height={16} />
                    <span className="font-cera-pro font-light text-[12px] lg:text-[14px] text-[#b3261e]">
                      Aprovacao imediata
                    </span>
                  </div>
                  {pulsing === "pix" && (
                    <div className="w-4 h-4 border-2 border-[#254333] border-t-transparent rounded-full animate-spin ml-auto" />
                  )}
                </div>
              </button>

              {/* Cartao de Credito */}
              <div
                className={`w-full rounded-[8px] border bg-white transition-all shadow-[0px_1px_2px_0px_rgba(0,0,0,0.3),0px_1px_3px_1px_rgba(0,0,0,0.15)] ${
                  selected === "cartao"
                    ? "border-[#254333] shadow-[0px_0px_0px_2px_rgba(37,67,51,0.2)]"
                    : "border-transparent hover:shadow-[0px_2px_4px_0px_rgba(0,0,0,0.3),0px_2px_6px_2px_rgba(0,0,0,0.15)]"
                }`}
              >
                <button
                  onClick={() => handleSelecionar("cartao")}
                  disabled={loading || !!pulsing || isProcessingCard}
                  className="w-full p-4 text-left disabled:opacity-70"
                >
                  <div className="flex items-start gap-1">
                    <Image src="/icons/card.svg" alt="Cartao" width={24} height={24} />
                    <div className="flex flex-col gap-2 flex-1">
                      <span className="font-cera-pro font-bold text-[18px] lg:text-[20px] text-[#254333]">
                        Cartao de credito {formatPrice(valorTotal)}
                      </span>
                      <span className="font-cera-pro font-light text-[16px] lg:text-[16px] text-[#333333]">
                        Ate 3x {formatPrice(valorTotal / 3)} sem juros
                      </span>
                    </div>
                    {/* Chevron */}
                    <svg
                      className={`w-5 h-5 text-[#254333] transition-transform self-center ${selected === "cartao" ? "rotate-180" : ""}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {/* Accordion: Card form */}
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    selected === "cartao" ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="px-4 pb-4 pt-2 border-t border-[#e5e5e5]">
                    <div className="flex flex-col gap-6">
                      {/* Dev tools */}
                      {process.env.NEXT_PUBLIC_DEV_TOOLS === "true" && (
                        <div className="flex items-center justify-end gap-2">
                          {pedidoId && (
                            <>
                              <button
                                onClick={handleSimulatePayment}
                                disabled={simulatingPayment || isProcessingCard}
                                className="text-[12px] text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                              >
                                {simulatingPayment ? "Simulando..." : "Simular Pagamento"}
                              </button>
                              <span className="text-gray-300">|</span>
                            </>
                          )}
                          <button
                            onClick={() => setShowTestCards(!showTestCards)}
                            className="text-[12px] text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            {showTestCards ? "Fechar" : "Sandbox"}
                          </button>
                        </div>
                      )}

                      {/* Test cards */}
                      {process.env.NEXT_PUBLIC_DEV_TOOLS === "true" && showTestCards && (
                        <div className="bg-gray-50 rounded-[8px] p-3 border border-gray-200">
                          <p className="text-[11px] text-gray-500 mb-2">Cartoes de teste:</p>
                          <div className="grid grid-cols-2 gap-2">
                            {testCards.map((card, idx) => (
                              <button
                                key={idx}
                                onClick={() => selectTestCard(card)}
                                className={`text-left px-2 py-1.5 rounded text-[11px] transition-colors ${
                                  card.status === "Aprovado"
                                    ? "bg-green-50 hover:bg-green-100 text-green-700"
                                    : "bg-red-50 hover:bg-red-100 text-red-700"
                                }`}
                              >
                                <span className="font-medium">{card.bandeira}</span>
                                <span className="text-gray-400 ml-1">
                                  ({card.status === "Aprovado" ? "✓" : "✗"})
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Card preview */}
                      <div className="relative w-full max-w-[314px] h-[185px] bg-[#d2d2d2] rounded-[8px] flex flex-col justify-center px-3">
                        <p className="font-bold text-[24px] text-[#1a1a1a] mt-8">
                          {cartaoData.numero || "**** **** **** ****"}
                        </p>
                        <div className="absolute bottom-8 right-8 text-center">
                          <p className="text-[7px] font-bold text-[#1a1a1a]">Valido</p>
                          <p className="text-[7px] font-bold text-[#1a1a1a]">Ate</p>
                          <p className="text-[10px] font-bold text-[#1a1a1a]">
                            {cartaoData.validade || "MM/AA"}
                          </p>
                        </div>
                      </div>

                      {/* Public key alert */}
                      {!pagbank.publicKey && (
                        <div className="bg-red-50 border border-red-200 rounded-[8px] p-4">
                          <p className="font-cera-pro font-bold text-[14px] text-red-600">Configuracao incompleta</p>
                          <p className="font-cera-pro text-[12px] text-red-500">O sistema de pagamento nao esta disponivel no momento.</p>
                        </div>
                      )}

                      {/* Card number */}
                      <div className="flex flex-col gap-2">
                        <label className="font-cera-pro font-bold text-[16px] lg:text-[18px] text-black">
                          Numero do cartao
                        </label>
                        <input
                          type="text"
                          value={cartaoData.numero}
                          onChange={(e) => handleCardChange("numero", e.target.value)}
                          maxLength={19}
                          disabled={isProcessingCard}
                          className={`w-full h-[48px] px-4 bg-white border ${
                            cartaoErrors.numero ? "border-red-500" : "border-[#d2d2d2]"
                          } rounded-[8px] font-cera-pro font-light text-[18px] lg:text-[20px] text-black placeholder:text-[#8c8c8c] focus:outline-none focus:border-[#254333] disabled:bg-gray-100`}
                        />
                        {cartaoErrors.numero && <span className="text-red-500 text-sm">{cartaoErrors.numero}</span>}
                      </div>

                      {/* Card name */}
                      <div className="flex flex-col gap-2">
                        <label className="font-cera-pro font-bold text-[16px] lg:text-[18px] text-black">
                          Nome no cartao
                        </label>
                        <input
                          type="text"
                          value={cartaoData.nome}
                          onChange={(e) => handleCardChange("nome", e.target.value)}
                          placeholder="Nome e sobrenome"
                          disabled={isProcessingCard}
                          className={`w-full h-[48px] px-4 bg-white border ${
                            cartaoErrors.nome ? "border-red-500" : "border-[#d2d2d2]"
                          } rounded-[8px] font-cera-pro font-light text-[18px] lg:text-[20px] text-black placeholder:text-[#8c8c8c] focus:outline-none focus:border-[#254333] disabled:bg-gray-100 uppercase`}
                        />
                        {cartaoErrors.nome && <span className="text-red-500 text-sm">{cartaoErrors.nome}</span>}
                      </div>

                      {/* Validity + CVV */}
                      <div className="flex gap-4">
                        <div className="flex flex-col gap-2 flex-1">
                          <label className="font-cera-pro font-bold text-[16px] lg:text-[18px] text-black">
                            Validade
                          </label>
                          <input
                            type="text"
                            value={cartaoData.validade}
                            onChange={(e) => handleCardChange("validade", e.target.value)}
                            placeholder="MM/AA"
                            maxLength={5}
                            disabled={isProcessingCard}
                            className={`w-full h-[48px] px-4 bg-white border ${
                              cartaoErrors.validade ? "border-red-500" : "border-[#d2d2d2]"
                            } rounded-[8px] font-cera-pro font-light text-[18px] lg:text-[20px] text-black placeholder:text-[#8c8c8c] focus:outline-none focus:border-[#254333] disabled:bg-gray-100`}
                          />
                          {cartaoErrors.validade && <span className="text-red-500 text-sm">{cartaoErrors.validade}</span>}
                        </div>

                        <div className="flex flex-col gap-2 w-[120px]">
                          <label className="font-cera-pro font-bold text-[16px] lg:text-[18px] text-black">
                            CVV
                          </label>
                          <input
                            type="text"
                            value={cartaoData.cvv}
                            onChange={(e) => handleCardChange("cvv", e.target.value)}
                            maxLength={4}
                            disabled={isProcessingCard}
                            className={`w-full h-[48px] px-4 bg-white border ${
                              cartaoErrors.cvv ? "border-red-500" : "border-[#d2d2d2]"
                            } rounded-[8px] font-cera-pro font-light text-[18px] lg:text-[20px] text-black placeholder:text-[#8c8c8c] focus:outline-none focus:border-[#254333] disabled:bg-gray-100`}
                          />
                          {cartaoErrors.cvv && <span className="text-red-500 text-sm">{cartaoErrors.cvv}</span>}
                        </div>
                      </div>

                      {/* Installments */}
                      <div className="flex flex-col gap-2">
                        <label className="font-cera-pro font-bold text-[16px] lg:text-[18px] text-black">
                          Parcelas
                        </label>
                        <div className="flex flex-col">
                          {parcelas.map((parcela) => (
                            <label key={parcela.valor} className="flex items-center gap-1 h-[46px] cursor-pointer">
                              <div className="p-[11px]">
                                <input
                                  type="radio"
                                  name="parcelas"
                                  value={parcela.valor}
                                  checked={cartaoData.parcelas === parcela.valor}
                                  onChange={() => handleCardChange("parcelas", parcela.valor)}
                                  disabled={isProcessingCard}
                                  className="w-[18px] h-[18px] cursor-pointer accent-[#254333]"
                                />
                              </div>
                              <div className="flex-1 flex items-center gap-[6px]">
                                <span className="font-cera-pro font-medium text-[14px] lg:text-[16px] text-[#111111]">
                                  {parcela.valor} x {formatPrice(parcela.total)}
                                </span>
                                {parcela.valor > 1 && (
                                  <span className="font-cera-pro font-light text-[14px] lg:text-[16px] text-[#111111]">
                                    sem juros
                                  </span>
                                )}
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment verification status */}
            {pagbank.checkingPayment && (
              <div className="bg-blue-50 border border-blue-200 rounded-[8px] p-4 flex items-center gap-3">
                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <div>
                  <p className="font-cera-pro font-bold text-[14px] text-blue-700">Verificando pagamento...</p>
                  <p className="font-cera-pro text-[12px] text-blue-600">Aguarde enquanto confirmamos com a operadora</p>
                </div>
              </div>
            )}

            {/* Botao Finalizar compra */}
            <button
              onClick={handleFinalizarCompra}
              disabled={finalizarDisabled}
              className="w-full h-[60px] bg-[#254333] rounded-[8px] flex items-center justify-center hover:bg-[#1a2e24] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed mt-2"
            >
              {loading || isProcessingCard ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <span className="font-cera-pro font-bold text-[20px] lg:text-[24px] text-white">
                  {pagbank.checkingPayment ? "Verificando..." : "Finalizar compra"}
                </span>
              )}
            </button>

            {/* Security */}
            <div className="text-center">
              <p className="font-cera-pro text-[12px] text-[#666666]">
                Seus dados sao criptografados e seguros
              </p>
              <p className="font-cera-pro text-[12px] text-[#666666]">
                Processado por PagBank - PagSeguro UOL
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
