"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMeuContexto } from "@/components/common/Context/context";
import {
  TelaAtual,
  FormaPagamento,
  CheckoutData,
  CartaoData,
  ResumoProps,
  PagamentoPix,
  PagamentoCartao,
  PagamentoSelecao,
} from "./components";

export function PagamentoPageClient() {
  const router = useRouter();
  const { cart, total, descontos, freight } = useMeuContexto();
  const [formaPagamento, setFormaPagamento] = useState<FormaPagamento>("pix");
  const [telaAtual, setTelaAtual] = useState<TelaAtual>("selecao");
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

  // Calculos de valores
  const cartArray = Object.values(cart);
  const subtotal = total - freight.freightValue;
  const freteGratis = checkoutData.entrega?.tipoEntrega === "normal";
  const valorFrete = freteGratis ? 0 : 14.99;
  const valorTotal = subtotal + valorFrete - descontos;
  const descontoPix = valorTotal * 0.1;
  const valorPix = valorTotal - descontoPix;

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

  // Handlers
  const handleSelecionarPix = () => {
    setFormaPagamento("pix");
    setTelaAtual("pix");
  };

  const handleSelecionarCartao = () => {
    setFormaPagamento("cartao");
    setTelaAtual("cartao");
  };

  const voltarParaSelecao = () => {
    setTelaAtual("selecao");
  };

  const handleFinalizarPix = () => {
    localStorage.setItem(
      "checkoutPagamento",
      JSON.stringify({ formaPagamento: "pix" })
    );

    alert("Pedido finalizado com sucesso!");
    limparCheckout();
    router.push("/figma");
  };

  const handleFinalizarCartao = (cartaoData: CartaoData) => {
    localStorage.setItem(
      "checkoutPagamento",
      JSON.stringify({ formaPagamento: "cartao", cartaoData })
    );

    alert("Pedido finalizado com sucesso!");
    limparCheckout();
    router.push("/figma");
  };

  const limparCheckout = () => {
    localStorage.removeItem("checkoutIdentificacao");
    localStorage.removeItem("checkoutEntrega");
    localStorage.removeItem("checkoutPagamento");
  };

  // Props compartilhadas para o resumo
  const resumoProps: ResumoProps = {
    cartArray,
    subtotal,
    freteGratis,
    valorFrete,
    descontos,
    valorTotal,
    enderecoCompleto,
    formatPrice,
    onAlterarProdutos: () => router.push("/figma/cart"),
    onAlterarEntrega: () => router.push("/figma/checkout/entrega"),
  };

  // Renderizacao condicional das telas
  if (telaAtual === "pix") {
    return (
      <PagamentoPix
        valorPix={valorPix}
        formatPrice={formatPrice}
        onVoltar={voltarParaSelecao}
        onFinalizar={handleFinalizarPix}
        onIrParaHome={() => router.push("/figma")}
        resumoProps={resumoProps}
      />
    );
  }

  if (telaAtual === "cartao") {
    return (
      <PagamentoCartao
        valorTotal={valorTotal}
        formatPrice={formatPrice}
        onVoltar={voltarParaSelecao}
        onFinalizar={handleFinalizarCartao}
      />
    );
  }

  return (
    <PagamentoSelecao
      valorPix={valorPix}
      valorTotal={valorTotal}
      formatPrice={formatPrice}
      onSelecionarPix={handleSelecionarPix}
      onSelecionarCartao={handleSelecionarCartao}
      resumoProps={resumoProps}
    />
  );
}
