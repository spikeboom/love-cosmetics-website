"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart, useCoupon, useShipping, useCartTotals } from "@/contexts";
import { useCreateOrder } from "@/hooks/checkout";
import { ucPurchase } from "../../../../_tracking/uc-ecommerce";
import {
  TelaAtual,
  FormaPagamento,
  CheckoutData,
  ResumoProps,
  PagamentoSelecao,
  PagamentoPixReal,
  PagamentoCartaoReal,
} from "./components";
import { formatPrice } from "@/lib/formatters";

export function PagamentoPageClient() {
  const router = useRouter();
  const { cart, clearCart } = useCart();
  const { cupons, clearCupons, handleCupom } = useCoupon();
  const { freightValue } = useShipping();
  const { total, descontos, subtotalOriginal } = useCartTotals();
  const { loading: creatingOrder, error: orderError, errorCode: orderErrorCode, createOrder, clearError } = useCreateOrder();

  // Códigos de erro que indicam carrinho desatualizado
  const cartOutdatedCodes = ["PRICE_MISMATCH", "DISCOUNT_MISMATCH", "TOTAL_MISMATCH", "PRODUCT_NOT_FOUND"];
  const isCartOutdated = orderErrorCode && cartOutdatedCodes.includes(orderErrorCode);

  // Códigos de erro relacionados a cupom
  const couponErrorCodes = ["COUPON_FIRST_PURCHASE_ONLY", "INVALID_COUPON"];
  const isCouponError = orderErrorCode && couponErrorCodes.includes(orderErrorCode);

  const [formaPagamento, setFormaPagamento] = useState<FormaPagamento>("pix");
  const [telaAtual, setTelaAtual] = useState<TelaAtual>("selecao");
  const [pedidoId, setPedidoId] = useState<string | null>(null);
  const [checkoutData, setCheckoutData] = useState<CheckoutData>({
    identificacao: null,
    entrega: null,
  });

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

  const enderecoCompleto = checkoutData.entrega
    ? `${checkoutData.entrega.rua}, ${
        checkoutData.entrega.semNumero ? "S/N" : checkoutData.entrega.numero
      }${
        checkoutData.entrega.complemento
          ? `. ${checkoutData.entrega.complemento}`
          : ""
      }`
    : "";

  // Criar pedido antes de ir para pagamento
  const handleCriarPedidoEPagar = async (metodo: "pix" | "cartao") => {
    if (pedidoId) {
      // Ja tem pedido criado, ir direto para pagamento
      setFormaPagamento(metodo);
      setTelaAtual(metodo);
      return;
    }

    const result = await createOrder();

    if (result.success && result.pedidoId) {
      setPedidoId(result.pedidoId);
      setFormaPagamento(metodo);
      setTelaAtual(metodo);
    } else {
      // Erro será exibido pela tela de erro (orderError state)
      // Não precisa de alert - a UI de erro já trata isso
    }
  };

  const handleSelecionarPix = () => {
    handleCriarPedidoEPagar("pix");
  };

  const handleSelecionarCartao = () => {
    handleCriarPedidoEPagar("cartao");
  };

  const voltarParaSelecao = () => {
    setTelaAtual("selecao");
  };

  const handlePaymentSuccess = () => {
    if (pedidoId) {
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
              email: checkoutData.identificacao.email,
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

    // Limpar dados de pagamento do localStorage
    // Manter identificacao e entrega para proximas compras
    localStorage.removeItem("checkoutPagamento");

    // Redirecionar para confirmacao
    router.push(`/figma/checkout/confirmacao?pedidoId=${pedidoId}`);
  };

  const handlePaymentError = (error: string) => {
    alert(`Erro no pagamento: ${error}`);
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

  // Tela de loading enquanto cria pedido
  if (creatingOrder) {
    return (
      <div className="bg-white flex flex-col w-full flex-1 items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-[#254333] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="font-cera-pro text-[16px] text-[#333333]">
          Criando pedido...
        </p>
      </div>
    );
  }

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

  // Tela de PIX real
  if (telaAtual === "pix" && pedidoId) {
    return (
      <PagamentoPixReal
        pedidoId={pedidoId}
        valorTotal={valorTotal}
        formatPrice={formatPrice}
        onVoltar={voltarParaSelecao}
        onSuccess={handlePaymentSuccess}
        onError={handlePaymentError}
        resumoProps={resumoProps}
      />
    );
  }

  // Tela de Cartao real
  if (telaAtual === "cartao" && pedidoId) {
    return (
      <PagamentoCartaoReal
        pedidoId={pedidoId}
        valorTotal={valorTotal}
        formatPrice={formatPrice}
        onVoltar={voltarParaSelecao}
        onSuccess={handlePaymentSuccess}
        onError={handlePaymentError}
      />
    );
  }

  const voltarParaEntrega = () => {
    router.push("/figma/checkout/entrega");
  };

  // Tela de selecao de metodo de pagamento
  return (
    <PagamentoSelecao
      valorTotal={valorTotal}
      formatPrice={formatPrice}
      onSelecionarPix={handleSelecionarPix}
      onSelecionarCartao={handleSelecionarCartao}
      onVoltar={voltarParaEntrega}
      resumoProps={resumoProps}
    />
  );
}
