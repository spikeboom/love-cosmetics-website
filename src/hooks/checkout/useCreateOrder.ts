"use client";

import { useState, useCallback } from "react";
import { useCart, useCoupon, useShipping, useCartTotals } from "@/contexts";

interface IdentificacaoData {
  cpf: string;
  dataNascimento: string;
  nome: string;
  email: string;
  telefone: string;
}

interface EntregaData {
  cep: string;
  rua: string;
  numero: string;
  semNumero: boolean;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
  informacoesAdicionais: string;
  tipoEntrega: "normal" | "expressa";
}

interface CreateOrderResult {
  success: boolean;
  pedidoId?: string;
  error?: string;
  code?: string;
}

interface UseCreateOrderReturn {
  loading: boolean;
  error: string | null;
  errorCode: string | null;
  createOrder: () => Promise<CreateOrderResult>;
  clearError: () => void;
}

export function useCreateOrder(): UseCreateOrderReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);

  // Novos hooks segmentados
  const { cart } = useCart();
  const { cupons } = useCoupon();
  const { freightValue, getSelectedFreightData } = useShipping();
  const { total, descontos } = useCartTotals();

  const clearError = useCallback(() => {
    setError(null);
    setErrorCode(null);
  }, []);

  const createOrder = useCallback(async (): Promise<CreateOrderResult> => {
    setLoading(true);
    setError(null);
    setErrorCode(null);

    try {
      // Buscar dados do localStorage
      const identificacaoStr = localStorage.getItem("checkoutIdentificacao");
      const entregaStr = localStorage.getItem("checkoutEntrega");

      if (!identificacaoStr) {
        throw new Error("Dados de identificacao nao encontrados.");
      }

      if (!entregaStr) {
        throw new Error("Dados de entrega nao encontrados.");
      }

      const identificacao: IdentificacaoData = JSON.parse(identificacaoStr);
      const entrega: EntregaData = JSON.parse(entregaStr);

      // Separar nome e sobrenome
      const nomeCompleto = identificacao.nome.trim();
      const partesNome = nomeCompleto.split(" ");
      const nome = partesNome[0] || "";
      const sobrenome = partesNome.slice(1).join(" ") || "";

      // Converter data de nascimento de DD/MM/AAAA para Date
      let dataNascimento: Date | undefined;
      if (identificacao.dataNascimento) {
        const [dia, mes, ano] = identificacao.dataNascimento.split("/");
        if (dia && mes && ano) {
          dataNascimento = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia), 12, 0, 0);
        }
      }

      // Preparar items do carrinho
      // Usar documentId (estável no Strapi v5) em vez de id (muda ao publicar)
      const items = Object.entries(cart).map(([id, product]: [string, any]) => {
        // Calcular campos de apresentação (mesma lógica do CartProductsList)
        const temCupomAplicado = !!product.cupom_applied || !!product.backup?.preco;
        const precoAtual = product.preco;
        const precoAntesDosCupom = product.backup?.preco ?? product.preco;

        // Preço original (preco_de) - o valor riscado
        let precoDeApresentacao: number | undefined;
        if (temCupomAplicado) {
          precoDeApresentacao = product.backup?.preco_de ?? product.preco_de ?? precoAntesDosCupom;
          if (precoDeApresentacao && precoDeApresentacao <= precoAtual) {
            precoDeApresentacao = undefined;
          }
        } else {
          precoDeApresentacao = product.preco_de && product.preco_de > precoAtual
            ? product.preco_de
            : undefined;
        }

        // Calcular % OFF acumulado (arredondado para cima)
        const descontoPercentualApresentacao =
          precoDeApresentacao && precoDeApresentacao > precoAtual
            ? Math.ceil(((precoDeApresentacao - precoAtual) / precoDeApresentacao) * 100)
            : undefined;

        // Imagem do produto
        const imagemUrl = product.imagem ||
          (product.carouselImagensPrincipal?.[0]?.imagem?.formats?.medium?.url
            ? process.env.NEXT_PUBLIC_STRAPI_URL + product.carouselImagensPrincipal[0].imagem.formats.medium.url
            : undefined);

        return {
          reference_id: product.documentId || id,
          name: product.nome,
          quantity: product.quantity,
          preco: product.preco,
          unit_amount: product.preco, // Salvar em REAIS no banco
          image_url: product.carouselImagensPrincipal?.[0]?.imagem?.formats?.medium?.url
            ? process.env.NEXT_PUBLIC_STRAPI_URL +
              product.carouselImagensPrincipal[0].imagem.formats.medium.url
            : undefined,
          bling_number: product.bling_number,
          // Campos novos para apresentação (não afetam cálculos)
          preco_de: precoDeApresentacao,
          desconto_percentual: descontoPercentualApresentacao,
          imagem: imagemUrl,
        };
      });

      // Usar frete do Context (ja calculado corretamente)
      const freteCalculado = freightValue;
      const freightData = getSelectedFreightData?.() || {};

      // Calcular subtotal para apresentação (soma dos preco_de ou preco se não existir)
      const subtotalProdutos = items.reduce((acc, item) => {
        const precoBase = item.preco_de ?? item.preco;
        return acc + (precoBase * item.quantity);
      }, 0);

      // Montar payload para API
      const payload = {
        nome,
        sobrenome,
        email: identificacao.email,
        telefone: identificacao.telefone.replace(/\D/g, ""),
        cpf: identificacao.cpf.replace(/\D/g, ""),
        data_nascimento: dataNascimento,
        pais: "Brasil",
        cep: entrega.cep.replace(/\D/g, ""),
        endereco: entrega.rua,
        numero: entrega.semNumero ? "S/N" : entrega.numero,
        complemento: entrega.complemento || "",
        bairro: entrega.bairro,
        cidade: entrega.cidade,
        estado: entrega.estado,
        salvar_minhas_informacoes: false,
        aceito_receber_whatsapp: false,
        destinatario: "",
        items,
        cupons: cupons?.map((c: any) => c.codigo) || [],
        descontos: descontos,
        total_pedido: total, // Salvar em REAIS no banco
        frete_calculado: freteCalculado, // Salvar em REAIS no banco
        transportadora_nome: freightData.transportadora_nome || null,
        transportadora_servico: freightData.transportadora_servico || null,
        transportadora_prazo: freightData.transportadora_prazo || null,
        // Campo novo para apresentação
        subtotal_produtos: subtotalProdutos,
      };

      // Chamar API
      const response = await fetch("/api/pedido", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        const errorMessage = result.error || "Erro ao criar pedido";
        const errorCodeResult = result.code || null;
        setError(errorMessage);
        setErrorCode(errorCodeResult);
        return { success: false, error: errorMessage, code: errorCodeResult };
      }

      return {
        success: true,
        pedidoId: result.id,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao criar pedido";
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, [cart, total, descontos, cupons, freightValue, getSelectedFreightData]);

  return {
    loading,
    error,
    errorCode,
    createOrder,
    clearError,
  };
}
