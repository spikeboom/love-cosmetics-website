"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts";
import {
  LoadingState,
  ErrorState,
  SuccessState,
  AccountForm,
  PedidoStatus,
  PedidoDetalhes,
  PageStatus,
} from "./components";
import { ucPurchase } from "../../../../_tracking/uc-ecommerce";

function ConfirmacaoContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pedidoId = searchParams.get("pedidoId");
  const { refreshAuth } = useAuth();

  const [pageStatus, setPageStatus] = useState<PageStatus>("loading");
  const [pedidoStatus, setPedidoStatus] = useState<PedidoStatus | null>(null);
  const [pedidoDetalhes, setPedidoDetalhes] = useState<PedidoDetalhes | null>(null);
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [receberComunicacoes, setReceberComunicacoes] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const firedPurchaseRef = useRef(false);

  // Funcao para buscar detalhes completos do pedido
  const fetchPedidoDetalhes = async () => {
    try {
      const response = await fetch(`/api/pedido/${pedidoId}`);
      if (response.ok) {
        const data = await response.json();
        setPedidoDetalhes(data);
      }
    } catch (error) {
      console.error("Erro ao buscar detalhes do pedido:", error);
    }
  };

  const purchaseItems = useMemo(() => {
    if (!pedidoDetalhes?.produtos?.items) return [];
    return pedidoDetalhes.produtos.items.map((it, index) => ({
      item_id: it.reference_id || it.name,
      item_name: it.name,
      price: it.preco,
      quantity: it.quantity,
      index,
    }));
  }, [pedidoDetalhes]);

  useEffect(() => {
    if (!pedidoId) return;
    if (pageStatus !== "success") return;
    if (!pedidoDetalhes) return;
    if (firedPurchaseRef.current) return;

    try {
      if (localStorage.getItem(`uc_purchase_sent_${pedidoId}`) === "1") {
        firedPurchaseRef.current = true;
        return;
      }
    } catch {
      // ignore
    }

    firedPurchaseRef.current = true;
    ucPurchase({
      transactionId: pedidoId,
      value: pedidoDetalhes.total,
      shipping: pedidoDetalhes.entrega?.valor,
      coupon: (pedidoDetalhes.cupons || []).join(",") || undefined,
      items: purchaseItems,
      user_data: {
        email_address: pedidoDetalhes.cliente?.email,
        phone_number: pedidoDetalhes.cliente?.telefone,
        address: pedidoDetalhes.endereco
          ? {
              city: pedidoDetalhes.endereco.cidade,
              region: pedidoDetalhes.endereco.estado,
              postal_code: pedidoDetalhes.endereco.cep,
              street: pedidoDetalhes.endereco.completo,
            }
          : undefined,
      },
    });
  }, [pedidoId, pageStatus, pedidoDetalhes, purchaseItems]);

  useEffect(() => {
    if (!pedidoId) {
      router.push("/figma/design");
      return;
    }

    // Verificar status do pedido e CPF
    const checkStatus = async () => {
      try {
        const response = await fetch(`/api/cliente/auth/cadastrar-pos-checkout?pedidoId=${pedidoId}`);
        const result = await response.json();

        if (!response.ok) {
          setPageStatus("error");
          return;
        }

        setPedidoStatus(result);

        // Se pedido ja vinculado, mostrar sucesso e buscar detalhes
        if (result.pedidoVinculado) {
          setPageStatus("success");
          fetchPedidoDetalhes();
          return;
        }

        // Se CPF ja cadastrado, mostrar login
        if (result.cpfCadastrado) {
          setPageStatus("login");
          return;
        }

        // Senao, mostrar criar conta
        setPageStatus("create_account");
      } catch {
        setPageStatus("error");
      }
    };

    checkStatus();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pedidoId, router]);

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== passwordConfirm) {
      setError("As senhas nao coincidem");
      return;
    }

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/cliente/auth/cadastrar-pos-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pedidoId,
          password,
          passwordConfirm,
          receberComunicacoes,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.cpfExistente) {
          setPageStatus("login");
          return;
        }
        setError(result.error || "Erro ao criar conta");
        return;
      }

      // Atualizar estado de auth no header
      await refreshAuth();
      setPageStatus("success");
      fetchPedidoDetalhes();
    } catch {
      setError("Erro ao criar conta. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!password) {
      setError("Digite sua senha");
      return;
    }

    if (!pedidoStatus?.cpf) {
      setError("Erro ao buscar dados do pedido");
      return;
    }

    setIsSubmitting(true);

    try {
      // Fazer login com CPF
      const response = await fetch("/api/cliente/auth/entrar-cpf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cpf: pedidoStatus.cpf,
          password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "CPF ou senha incorretos");
        return;
      }

      // Vincular pedido ao cliente logado
      const vincularResponse = await fetch("/api/cliente/auth/vincular-pedido", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pedidoId }),
      });

      if (!vincularResponse.ok) {
        const vincularResult = await vincularResponse.json();
        // Se falhou ao vincular mas login deu certo, ainda mostramos sucesso
        console.error("Erro ao vincular pedido:", vincularResult.error);
      }

      // Atualizar estado de auth no header
      await refreshAuth();
      setPageStatus("success");
      fetchPedidoDetalhes();
    } catch {
      setError("Erro ao fazer login. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading
  if (pageStatus === "loading") {
    return <LoadingState />;
  }

  // Erro
  if (pageStatus === "error") {
    return <ErrorState />;
  }

  // Sucesso
  if (pageStatus === "success") {
    return <SuccessState pedidoDetalhes={pedidoDetalhes} />;
  }

  // Formulario de criar conta ou login
  return (
    <AccountForm
      pageStatus={pageStatus}
      pedidoStatus={pedidoStatus}
      pedidoId={pedidoId}
      password={password}
      setPassword={setPassword}
      passwordConfirm={passwordConfirm}
      setPasswordConfirm={setPasswordConfirm}
      receberComunicacoes={receberComunicacoes}
      setReceberComunicacoes={setReceberComunicacoes}
      error={error}
      isSubmitting={isSubmitting}
      onSubmit={pageStatus === "login" ? handleLogin : handleCreateAccount}
    />
  );
}

function LoadingFallback() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center">
      <div className="w-12 h-12 border-4 border-[#254333] border-t-transparent rounded-full animate-spin mb-4" />
      <p className="font-cera-pro text-[16px] text-[#333333]">
        Carregando...
      </p>
    </div>
  );
}

export default function ConfirmacaoPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ConfirmacaoContent />
    </Suspense>
  );
}
