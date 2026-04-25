"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart, useCoupon, useShipping, useCartTotals } from "@/contexts";
import { useCreateOrder, usePagBankPayment } from "@/hooks/checkout";
import { useCheckoutSync } from "@/hooks/checkout/useCheckoutSync";
import { ucAddPaymentInfo, ucCheckoutStep, ucPurchase } from "../../../../_tracking/uc-ecommerce";
import {
  TelaAtual,
  FormaPagamento,
  CheckoutData,
  ResumoProps,
  PagamentoSelecao,
  PagamentoPixReal,
  PagamentoRecusadoModal,
  CupomIndisponivelModal,
} from "./components";
import { formatPrice } from "@/lib/formatters";

export function PagamentoPageClient() {
  const router = useRouter();
  const { cart, clearCart, isCartLoaded } = useCart();
  const { cupons, clearCupons, handleCupom } = useCoupon();
  const { freightValue } = useShipping();
  const { total, descontos, subtotalOriginal } = useCartTotals();
  const { loading: creatingOrder, error: orderError, errorCode: orderErrorCode, createOrder, clearError } = useCreateOrder();
  const pagbank = usePagBankPayment();
  const { syncToServer } = useCheckoutSync();
  const firedStepEventRef = useRef(false);
  const firedPaymentInfoRef = useRef<Set<string>>(new Set());

  // Track pagamento step on mount
  useEffect(() => {
    syncToServer({ step: "pagamento" });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Códigos de erro que indicam carrinho desatualizado
  const cartOutdatedCodes = [
    "PRICE_MISMATCH",
    "DISCOUNT_MISMATCH",
    "TOTAL_MISMATCH",
    "PRODUCT_NOT_FOUND",
    "FREIGHT_MISMATCH",
    "FREIGHT_UNAVAILABLE",
    "INVALID_CEP",
    "INVALID_FREIGHT",
    "EMPTY_CART",
  ];
  const isCartOutdated = orderErrorCode && cartOutdatedCodes.includes(orderErrorCode);

  // Códigos de erro relacionados a cupom
  const couponErrorCodes = ["COUPON_FIRST_PURCHASE_ONLY", "INVALID_COUPON", "COUPON_EXHAUSTED"];
  const isCouponError = orderErrorCode && couponErrorCodes.includes(orderErrorCode);

  const [formaPagamento, setFormaPagamento] = useState<FormaPagamento>("pix");
  const [telaAtual, setTelaAtual] = useState<TelaAtual>("selecao");
  const [telaVisivel, setTelaVisivel] = useState<TelaAtual>("selecao");
  const [transitioning, setTransitioning] = useState(false);
  const [pedidoId, setPedidoId] = useState<string | null>(null);
  const [pixPreGenerated, setPixPreGenerated] = useState(false);
  const [pixOrderId, setPixOrderId] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [declineModal, setDeclineModal] = useState<{
    paymentResponse: {
      code?: string;
      message?: string;
      reference?: string;
      raw_data?: { reason_code?: string; nsu?: string; authorization_code?: string };
    } | null;
    pedidoId: string;
  } | null>(null);
  const [couponModal, setCouponModal] = useState<{
    cupom: string | null;
    novoTotal?: number;
    totalAtual?: number;
  } | null>(null);
  const [skipCupomOnNextAttempt, setSkipCupomOnNextAttempt] = useState(false);
  const [retryNonce, setRetryNonce] = useState(0);
  const [checkoutData, setCheckoutData] = useState<CheckoutData>({
    identificacao: null,
    entrega: null,
  });

  // Restaurar pedidoId (evita criar novo pedido ao voltar/avancar no navegador)
  useEffect(() => {
    try {
      const storedPedidoId = sessionStorage.getItem("checkoutPedidoId");
      if (storedPedidoId) {
        setPedidoId(storedPedidoId);
      }
    } catch {
      // ignore
    }
  }, []);

  // Guard: checkout sem itens no carrinho
  useEffect(() => {
    if (pedidoId) return;
    if (!isCartLoaded) return;
    if (Object.keys(cart).length === 0) {
      router.push("/figma/cart");
    }
  }, [cart, router, pedidoId, isCartLoaded]);

  // Carregar dados das etapas anteriores
  useEffect(() => {
    const identificacao = localStorage.getItem("checkoutIdentificacao");
    const entrega = localStorage.getItem("checkoutEntrega");

    if (!identificacao) {
      router.push("/figma/checkout/identificacao");
      return;
    }

    if (!entrega) {
      router.push("/figma/checkout/entrega");
      return;
    }

    if (!firedStepEventRef.current) {
      firedStepEventRef.current = true;
      ucCheckoutStep({ step: "pagamento" });
    }

    setCheckoutData({
      identificacao: JSON.parse(identificacao),
      entrega: JSON.parse(entrega),
    });
  }, [router]);

  // Calculos de valores - usar valores do Context diretamente
  const cartArray = Object.values(cart) as unknown[];

  // Mesma lógica do /cart:
  // subtotalOriginal = soma dos preco_de (preços originais riscados)
  // descontosAcumulados = subtotalOriginal - (total - frete)
  const valorFrete = freightValue;
  const subtotal = subtotalOriginal; // Soma dos preços originais (preco_de)
  const descontosAcumulados = subtotalOriginal - (total - valorFrete);
  const freteGratis = valorFrete === 0;
  const valorTotal = total; // Usar direto do Context

  // Tracking: add_payment_info (GA4) ao selecionar método de pagamento (PIX / cartão)
  const paymentMethod = telaAtual === "pix" ? "pix" : formaPagamento === "cartao" ? "cartao" : null;
  useEffect(() => {
    if (!pedidoId) return;
    if (!paymentMethod) return;

    const key = `${pedidoId}:${paymentMethod}`;
    if (firedPaymentInfoRef.current.has(key)) return;
    firedPaymentInfoRef.current.add(key);

    const coupon =
      cupons
        ?.map((cupom) => {
          if (!cupom || typeof cupom !== "object") return undefined;
          const codigo = (cupom as unknown as Record<string, unknown>).codigo;
          return typeof codigo === "string" ? codigo : undefined;
        })
        .filter(Boolean)
        .join(",") || undefined;

    const cartItemsForTracking = cartArray.map((raw, index: number) => {
      const p = raw as {
        id?: unknown;
        nome?: unknown;
        preco?: unknown;
        quantity?: unknown;
      };

      return {
        item_id: String(p.id ?? "unknown"),
        item_name: String(p.nome ?? "Produto"),
        price: typeof p.preco === "number" ? p.preco : Number(p.preco ?? 0),
        quantity: typeof p.quantity === "number" ? p.quantity : Number(p.quantity ?? 1),
        index,
      };
    });

    ucAddPaymentInfo({
      paymentType: paymentMethod === "pix" ? "pix" : "credit_card",
      items: cartItemsForTracking,
      value: valorTotal,
      shipping: valorFrete,
      coupon,
    });

    // Early/anticipated Purchase signal for Meta optimization (signal density).
    // Fires when PIX QR is generated or card accordion opens, before actual payment.
    // Uses a distinct event_id prefix so it doesn't deduplicate with the real purchase.
    ucPurchase({
      transactionId: pedidoId,
      value: valorTotal,
      shipping: valorFrete,
      coupon,
      items: cartItemsForTracking,
      user_data: checkoutData?.identificacao
        ? {
            email_address: checkoutData.identificacao.email,
            phone_number: checkoutData.identificacao.telefone,
            address: checkoutData.entrega
              ? {
                  city: checkoutData.entrega.cidade,
                  region: checkoutData.entrega.estado,
                  postal_code: checkoutData.entrega.cep,
                  street: checkoutData.entrega.rua,
                }
              : undefined,
          }
        : undefined,
      eventIdPrefix: "purchase_intent",
    });
  }, [pedidoId, paymentMethod, cartArray, cupons, valorFrete, valorTotal, checkoutData]);

  const enderecoCompleto = checkoutData.entrega
    ? `${checkoutData.entrega.rua}, ${
        checkoutData.entrega.semNumero ? "S/N" : checkoutData.entrega.numero
      }${
        checkoutData.entrega.complemento
          ? `. ${checkoutData.entrega.complemento}`
          : ""
      }`
    : "";

  // Transição suave entre telas (fade-out → troca → fade-in)
  const transitionTo = (tela: TelaAtual) => {
    setTransitioning(true);
    setTimeout(() => {
      setTelaVisivel(tela);
      setTelaAtual(tela);
      // Scroll suave para o topo ao trocar de tela
      window.scrollTo({ top: 0, behavior: "smooth" });
      setTimeout(() => setTransitioning(false), 50);
    }, 250);
  };

  // Criar pedido antes de ir para pagamento
  // Para Pix: cria pedido + gera QR code, só transiciona quando pronto
  // Para Cartão: cria pedido e transiciona direto (usuário precisa preencher form)
  const handleCriarPedidoEPagar = async (metodo: "pix" | "cartao") => {
    setPaymentError(null);

    let currentPedidoId = pedidoId;

    if (!currentPedidoId) {
      const result = await createOrder();
      if (result.success && result.pedidoId) {
        currentPedidoId = result.pedidoId;
        setPedidoId(result.pedidoId);
      } else {
        return;
      }
    }

    setFormaPagamento(metodo);

    if (metodo === "pix") {
      // Pré-gerar Pix antes de transicionar (o pulse continua na seleção)
      const pixResult = await pagbank.createPixPayment(currentPedidoId);
      if (pixResult.success && pixResult.orderId) {
        setPixOrderId(pixResult.orderId);
        setPixPreGenerated(true);
        transitionTo("pix");
      } else {
        setPaymentError(pixResult.message || "Erro ao gerar PIX");
      }
    } else {
      // Cartão: order created, PagamentoSelecao handles card form inline
      setFormaPagamento("cartao");
    }
  };

  const handleSelecionarPix = () => {
    handleCriarPedidoEPagar("pix");
  };

  const handleSelecionarCartao = () => {
    // Card: only create order, PagamentoSelecao handles the rest
    handleCriarPedidoEPagar("cartao");
  };

  const voltarParaSelecao = () => {
    transitionTo("selecao");
  };

  const handlePaymentSuccess = () => {
    if (pedidoId) {
      // Marca essa sessao de checkout como convertida para filtrar abandonos reais.
      syncToServer({ step: "pagamento", convertido: true });

      ucPurchase({
        transactionId: pedidoId,
        value: valorTotal,
        shipping: valorFrete,
        coupon: cupons
          ?.map((cupom) => {
            if (!cupom || typeof cupom !== "object") return undefined;
            const codigo = (cupom as unknown as Record<string, unknown>).codigo;
            return typeof codigo === "string" ? codigo : undefined;
          })
          .filter(Boolean)
          .join(",") || undefined,
        items: cartArray.map((raw, index: number) => {
          const p = raw as {
            id?: unknown;
            nome?: unknown;
            preco?: unknown;
            quantity?: unknown;
          };

          return {
            item_id: String(p.id ?? "unknown"),
            item_name: String(p.nome ?? "Produto"),
            price: typeof p.preco === "number" ? p.preco : Number(p.preco ?? 0),
            quantity: typeof p.quantity === "number" ? p.quantity : Number(p.quantity ?? 1),
            index,
          };
        }),
        user_data: checkoutData?.identificacao
          ? {
              email_address: checkoutData.identificacao.email,
              phone_number: checkoutData.identificacao.telefone,
              address: checkoutData.entrega
                ? {
                    city: checkoutData.entrega.cidade,
                    region: checkoutData.entrega.estado,
                    postal_code: checkoutData.entrega.cep,
                    street: checkoutData.entrega.rua,
                  }
                : undefined,
            }
          : undefined,
      });

      try {
        localStorage.setItem(`uc_purchase_sent_${pedidoId}`, "1");
      } catch {
        // ignore
      }
    }

    // Limpar carrinho do Context (estado em memoria)
    clearCart();
    clearCupons();

    // Limpar sessao do checkout (idempotencia/pedido persistido)
    try {
      sessionStorage.removeItem("checkoutPedidoId");
      sessionStorage.removeItem("checkoutIdempotencyKey");
      sessionStorage.removeItem("checkout_session_id");
    } catch {
      // ignore
    }
    setPaymentError(null);

    // Limpar dados de pagamento do localStorage
    // Manter identificacao e entrega para proximas compras
    localStorage.removeItem("checkoutPagamento");

    // Redirecionar para confirmacao
    router.push(`/figma/checkout/confirmacao?pedidoId=${pedidoId}`);
  };

  const handlePaymentError = (error: string) => {
    setPaymentError(error);
  };

  const clearPaymentError = () => setPaymentError(null);

  const handleDeclined = (info: {
    paymentResponse: {
      code?: string;
      message?: string;
      reference?: string;
      raw_data?: { reason_code?: string; nsu?: string; authorization_code?: string };
    } | null;
    pedidoId: string;
  }) => {
    setDeclineModal(info);
  };

  const handleCouponUnavailable = (info: {
    cupom: string | null;
    novoTotal?: number;
    totalAtual?: number;
  }) => {
    setCouponModal(info);
  };

  const handleTryOtherCardFromModal = () => {
    setDeclineModal(null);
    // Mantemos o pedido e o estado da tela; o cliente vai trocar os dados do
    // cartao no proprio formulario aberto e clicar Finalizar compra de novo.
  };

  const handleUsePixFromModal = () => {
    setDeclineModal(null);
    // Reusa o pedido existente e dispara o fluxo Pix.
    handleCriarPedidoEPagar("pix");
  };

  const handleContinueWithoutCoupon = () => {
    setCouponModal(null);
    setSkipCupomOnNextAttempt(true);
    setRetryNonce((n) => n + 1);
  };

  // Props compartilhadas para o resumo
  const resumoProps: ResumoProps = {
    cartArray,
    subtotal,
    freteGratis,
    valorFrete,
    descontos: descontosAcumulados,
    cupons,
    valorTotal,
    enderecoCompleto,
    formatPrice,
    onAlterarProdutos: () => router.push("/figma/cart"),
    onAlterarEntrega: () => router.push("/figma/checkout/entrega"),
  };

  // Remover cupom e voltar para tela de pagamento
  const handleRemoverCupom = () => {
    if (cupons.length > 0) {
      // handleCupom faz toggle: se já está na lista, remove e reverte preços do carrinho
      cupons.forEach((cupom: any) => handleCupom(cupom));
    }
    clearError();
  };

  // Erro ao criar pedido
  if (orderError && !pedidoId) {
    return (
      <div className="bg-white flex flex-col w-full flex-1 items-center justify-center min-h-[400px] px-4">
        <div className={`${isCartOutdated ? 'bg-[#FFF3CD] border-[#FFE69C]' : isCouponError ? 'bg-[#FFF3CD] border-[#FFE69C]' : 'bg-red-50 border-red-200'} border rounded-[8px] p-6 text-center max-w-md`}>
          <p className={`font-cera-pro font-bold text-[18px] ${isCartOutdated || isCouponError ? 'text-[#856404]' : 'text-red-600'} mb-2`}>
            {isCartOutdated ? 'Carrinho desatualizado' : isCouponError ? 'Cupom indisponível' : 'Erro ao criar pedido'}
          </p>
          <p className={`font-cera-pro text-[14px] ${isCartOutdated || isCouponError ? 'text-[#856404]' : 'text-red-500'} mb-4`}>{orderError}</p>

          {isCouponError ? (
            <div className="flex flex-col gap-3">
              <button
                onClick={handleRemoverCupom}
                className="px-6 py-2 bg-[#254333] text-white rounded-[8px] font-cera-pro"
              >
                Retirar cupom e continuar
              </button>
              <button
                onClick={() => {
                  router.push("/figma/cart");
                  window.location.href = "/figma/cart";
                }}
                className="px-6 py-2 bg-white text-[#856404] border border-[#856404] rounded-[8px] font-cera-pro"
              >
                Voltar ao carrinho
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                if (isCartOutdated) {
                  router.push("/figma/cart");
                  window.location.href = "/figma/cart";
                } else {
                  router.push("/figma/checkout/entrega");
                }
              }}
              className={`px-6 py-2 ${isCartOutdated ? 'bg-[#856404]' : 'bg-[#254333]'} text-white rounded-[8px] font-cera-pro`}
            >
              {isCartOutdated ? 'Voltar ao carrinho' : 'Voltar'}
            </button>
          )}
        </div>
      </div>
    );
  }

  const voltarParaEntrega = () => {
    router.push("/figma/checkout/entrega");
  };

  // Renderizar a tela atual com transição fade
  const renderTela = () => {
    if (telaVisivel === "pix" && pedidoId) {
      return (
        <PagamentoPixReal
          pedidoId={pedidoId}
          valorTotal={valorTotal}
          formatPrice={formatPrice}
          onVoltar={voltarParaSelecao}
          onSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
          externalError={paymentError}
          onClearExternalError={clearPaymentError}
          resumoProps={resumoProps}
          preGenerated={
            pixPreGenerated && pixOrderId && pagbank.qrCodeData
              ? { qrCode: pagbank.qrCodeData, orderId: pixOrderId }
              : null
          }
        />
      );
    }

    if (telaVisivel === "cartao" && pedidoId) {
      // Card is now handled inside PagamentoSelecao as accordion
      // Fall through to selecao
    }

    return (
      <PagamentoSelecao
        valorTotal={valorTotal}
        formatPrice={formatPrice}
        onSelecionarPix={handleSelecionarPix}
        onSelecionarCartao={handleSelecionarCartao}
        onVoltar={voltarParaEntrega}
        loading={creatingOrder || pagbank.loading}
        errorMessage={paymentError}
        onClearError={clearPaymentError}
        resumoProps={resumoProps}
        pedidoId={pedidoId}
        onSuccess={handlePaymentSuccess}
        onError={handlePaymentError}
        onDeclined={handleDeclined}
        onCouponUnavailable={handleCouponUnavailable}
        skipCupomOnNextAttempt={skipCupomOnNextAttempt}
        retryNonce={retryNonce}
      />
    );
  };

  return (
    <>
      <div
        className="transition-opacity duration-250 ease-in-out"
        style={{ opacity: transitioning ? 0 : 1 }}
      >
        {renderTela()}
      </div>

      {declineModal ? (
        <PagamentoRecusadoModal
          paymentResponse={declineModal.paymentResponse}
          pedidoId={declineModal.pedidoId}
          onTryOtherCard={handleTryOtherCardFromModal}
          onUsePix={handleUsePixFromModal}
          onClose={() => setDeclineModal(null)}
        />
      ) : null}

      {couponModal ? (
        <CupomIndisponivelModal
          cupom={couponModal.cupom}
          novoTotal={couponModal.novoTotal}
          totalAtual={couponModal.totalAtual}
          onContinueWithoutCoupon={handleContinueWithoutCoupon}
          onClose={() => setCouponModal(null)}
        />
      ) : null}
    </>
  );
}
