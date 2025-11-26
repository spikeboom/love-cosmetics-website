"use client";

import { useState, useCallback } from "react";
import { useMeuContexto } from "@/components/common/Context/context";

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
}

interface UseCreateOrderReturn {
  loading: boolean;
  error: string | null;
  createOrder: () => Promise<CreateOrderResult>;
  clearError: () => void;
}

export function useCreateOrder(): UseCreateOrderReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { cart, total, descontos, cupons, freight } = useMeuContexto();

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const createOrder = useCallback(async (): Promise<CreateOrderResult> => {
    setLoading(true);
    setError(null);

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
      const items = Object.entries(cart).map(([id, product]: [string, any]) => ({
        reference_id: id,
        name: product.nome,
        quantity: product.quantity,
        preco: product.preco,
        unit_amount: product.preco, // Salvar em REAIS no banco
        image_url: product.carouselImagensPrincipal?.[0]?.imagem?.formats?.medium?.url
          ? process.env.NEXT_PUBLIC_STRAPI_URL +
            product.carouselImagensPrincipal[0].imagem.formats.medium.url
          : undefined,
        bling_number: product.bling_number,
      }));

      // Calcular frete
      const freteCalculado = entrega.tipoEntrega === "expressa" ? 14.99 : 0;
      const freightData = freight.getSelectedFreightData?.() || {};

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
      };

      // Chamar API
      const response = await fetch("/api/pedido", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Erro ao criar pedido");
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
  }, [cart, total, descontos, cupons, freight]);

  return {
    loading,
    error,
    createOrder,
    clearError,
  };
}
