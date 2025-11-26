"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMeuContexto } from "@/components/common/Context/context";
import { useCreateOrder } from "@/hooks/checkout";
import {
  TelaAtual,
  FormaPagamento,
  CheckoutData,
  ResumoProps,
  PagamentoSelecao,
  PagamentoPixReal,
  PagamentoCartaoReal,
} from "./components";

export function PagamentoPageClient() {
  const router = useRouter();
  const { cart, total, descontos, cupons, freight, clearCart } = useMeuContexto();
  const { loading: creatingOrder, error: orderError, errorCode: orderErrorCode, createOrder } = useCreateOrder();

  // Códigos de erro que indicam carrinho desatualizado
  const cartOutdatedCodes = ["PRICE_MISMATCH", "DISCOUNT_MISMATCH", "TOTAL_MISMATCH", "PRODUCT_NOT_FOUND"];
  const isCartOutdated = orderErrorCode && cartOutdatedCodes.includes(orderErrorCode);

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
  const cartArray = Object.values(cart);

  // O total do Context ja inclui desconto e frete
  // Para mostrar corretamente: Produtos (original) - Desconto + Frete = Total
  // Entao: Produtos = Total - Frete + Desconto
  const valorFrete = freight.freightValue;
  const subtotal = total - valorFrete + descontos; // Valor original dos produtos (sem desconto)
  const freteGratis = valorFrete === 0;
  const valorTotal = total; // Usar direto do Context

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  };

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
      alert(result.error || "Erro ao criar pedido");
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
    // Limpar carrinho do Context (estado em memoria)
    clearCart();

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
    descontos,
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

  // Erro ao criar pedido
  if (orderError && !pedidoId) {
    return (
      <div className="bg-white flex flex-col w-full flex-1 items-center justify-center min-h-[400px] px-4">
        <div className={`${isCartOutdated ? 'bg-[#FFF3CD] border-[#FFE69C]' : 'bg-red-50 border-red-200'} border rounded-[8px] p-6 text-center max-w-md`}>
          <p className={`font-cera-pro font-bold text-[18px] ${isCartOutdated ? 'text-[#856404]' : 'text-red-600'} mb-2`}>
            {isCartOutdated ? 'Carrinho desatualizado' : 'Erro ao criar pedido'}
          </p>
          <p className={`font-cera-pro text-[14px] ${isCartOutdated ? 'text-[#856404]' : 'text-red-500'} mb-4`}>{orderError}</p>
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

  // Tela de selecao de metodo de pagamento
  return (
    <PagamentoSelecao
      valorTotal={valorTotal}
      formatPrice={formatPrice}
      onSelecionarPix={handleSelecionarPix}
      onSelecionarCartao={handleSelecionarCartao}
      resumoProps={resumoProps}
    />
  );
}
