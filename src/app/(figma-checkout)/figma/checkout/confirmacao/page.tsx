"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ConfirmacaoStepper } from "./ConfirmacaoStepper";
import { useMeuContexto } from "@/components/common/Context/context";

// Icone de verificado dourado
function VerifiedIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M23 12L20.56 9.22L20.9 5.54L17.29 4.72L15.4 1.54L12 3L8.6 1.54L6.71 4.72L3.1 5.53L3.44 9.21L1 12L3.44 14.78L3.1 18.47L6.71 19.29L8.6 22.47L12 21L15.4 22.46L17.29 19.28L20.9 18.46L20.56 14.78L23 12ZM10 17L6 13L7.41 11.59L10 14.17L16.59 7.58L18 9L10 17Z" fill="#E7A63A"/>
    </svg>
  );
}

interface PedidoStatus {
  pedidoVinculado: boolean;
  cpfCadastrado: boolean;
  cpf: string;
  cpfMascarado: string;
  nome: string;
  email: string;
  statusPagamento: string;
}

interface PedidoDetalhes {
  id: string;
  cliente: {
    nome: string;
    sobrenome: string;
    email: string;
    telefone: string;
    cpf: string;
  };
  endereco: {
    completo: string;
    cidade: string;
    estado: string;
    cep: string;
  };
  produtos: {
    nomes: string[];
    subtotal: number;
  };
  entrega: {
    transportadora: string;
    servico: string;
    prazo: number;
    valor: number;
    gratis: boolean;
  };
  descontos: number;
  total: number;
  status: {
    pagamento: string;
    entrega: string;
  };
  metodoPagamento: string;
  vinculado: boolean;
}

function ConfirmacaoContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pedidoId = searchParams.get("pedidoId");
  const { refreshAuth } = useMeuContexto();

  const [pageStatus, setPageStatus] = useState<"loading" | "create_account" | "login" | "success" | "error">("loading");
  const [pedidoStatus, setPedidoStatus] = useState<PedidoStatus | null>(null);
  const [pedidoDetalhes, setPedidoDetalhes] = useState<PedidoDetalhes | null>(null);
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [receberComunicacoes, setReceberComunicacoes] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  useEffect(() => {
    if (!pedidoId) {
      router.push("/figma");
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
        if (result.cpfExistente || result.emailExistente) {
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
    return (
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#254333] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="font-cera-pro text-[16px] text-[#333333]">
          Verificando pedido...
        </p>
      </div>
    );
  }

  // Erro
  if (pageStatus === "error") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="max-w-md w-full text-center">
          <div className="w-24 h-24 mx-auto mb-6 bg-red-500 rounded-full flex items-center justify-center">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </div>
          <h1 className="font-cera-pro font-bold text-[28px] text-red-600 mb-4">
            Algo deu errado
          </h1>
          <p className="font-cera-pro text-[16px] text-[#333333] mb-8">
            Nao conseguimos encontrar seu pedido. Por favor, entre em contato com nosso suporte.
          </p>
          <Link
            href="/figma"
            className="inline-block w-full h-[60px] bg-[#254333] rounded-[8px] flex items-center justify-center hover:bg-[#1a2e24] transition-colors"
          >
            <span className="font-cera-pro font-bold text-[20px] text-white">
              Voltar para a loja
            </span>
          </Link>
        </div>
      </div>
    );
  }

  // Funcao auxiliar para formatar moeda
  const formatarMoeda = (valor: number) => {
    return valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).replace("R$", "R$ ");
  };

  // Sucesso - Tela de Confirmacao Logada igual ao Figma
  if (pageStatus === "success") {
    return (
      <div className="bg-white flex flex-col w-full flex-1">
        <ConfirmacaoStepper currentStep="pagamento" />

        <div className="flex justify-center px-4 lg:px-[24px] pt-6 lg:pt-[24px] pb-8 lg:pb-[32px]">
          <div className="flex flex-col gap-6 lg:gap-[32px] w-full max-w-[684px]">
            {/* Banner de sucesso do pagamento */}
            <div className="bg-[#f8f3ed] rounded-[16px] h-[64px] p-4 flex gap-2 items-center">
              <VerifiedIcon className="w-8 h-8 shrink-0" />
              <div className="flex flex-col flex-1 gap-1">
                <p className="font-cera-pro font-bold text-[18px] lg:text-[20px] text-[#1d1b20]">
                  Pagamento aprovado!
                </p>
                <p className="font-cera-pro font-light text-[12px] lg:text-[14px] text-[#1d1b20]">
                  Boas noticias, seu pagamento foi confirmado!
                </p>
              </div>
            </div>

            {/* Card com resumo do pedido */}
            <div className="bg-[#f8f3ed] rounded-[8px] overflow-hidden">
              {/* Produtos */}
              <div className="p-4 flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <p className="font-cera-pro font-bold text-[18px] lg:text-[20px] text-[#111]">
                    Produtos
                  </p>
                  <p className="font-cera-pro font-bold text-[18px] lg:text-[20px] text-black">
                    {pedidoDetalhes ? formatarMoeda(pedidoDetalhes.produtos.subtotal) : "-"}
                  </p>
                </div>
                <div className="font-cera-pro font-light text-[14px] lg:text-[16px] text-[#111]">
                  {pedidoDetalhes?.produtos.nomes.map((nome, i) => (
                    <p key={i}>{nome}</p>
                  ))}
                </div>
              </div>

              <div className="bg-white h-px" />

              {/* Entrega */}
              <div className="p-4 flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <p className="font-cera-pro font-bold text-[18px] lg:text-[20px] text-[#111]">
                    Entrega
                  </p>
                  <p className={`font-cera-pro font-bold text-[18px] lg:text-[20px] ${pedidoDetalhes?.entrega.gratis ? "text-[#009142]" : "text-black"}`}>
                    {pedidoDetalhes?.entrega.gratis ? "Gratis" : pedidoDetalhes ? formatarMoeda(pedidoDetalhes.entrega.valor) : "-"}
                  </p>
                </div>
                <p className="font-cera-pro font-light text-[14px] lg:text-[16px] text-[#111]">
                  {pedidoDetalhes?.endereco.completo}
                </p>
              </div>

              <div className="bg-white h-px" />

              {/* Descontos */}
              {(pedidoDetalhes?.descontos ?? 0) > 0 && (
                <>
                  <div className="p-4 flex justify-between items-center">
                    <p className="font-cera-pro font-bold text-[18px] lg:text-[20px] text-[#111]">
                      Descontos
                    </p>
                    <p className="font-cera-pro font-bold text-[18px] lg:text-[20px] text-[#009142]">
                      - {formatarMoeda(pedidoDetalhes?.descontos ?? 0)}
                    </p>
                  </div>
                  <div className="bg-white h-px" />
                </>
              )}

              {/* Valor Total */}
              <div className="p-4 flex justify-between items-center">
                <p className="font-cera-pro font-bold text-[18px] lg:text-[20px] text-[#111]">
                  Valor total
                </p>
                <p className="font-cera-pro font-bold text-[18px] lg:text-[20px] text-black">
                  {pedidoDetalhes ? formatarMoeda(pedidoDetalhes.total) : "-"}
                </p>
              </div>
            </div>

            {/* Botoes */}
            <div className="flex gap-4">
              <Link
                href="/figma/minha-conta/pedidos"
                className="flex-1 h-[56px] lg:h-[64px] bg-[#254333] rounded-[8px] flex items-center justify-center hover:bg-[#1a2e24] transition-colors"
              >
                <span className="font-cera-pro font-medium text-[16px] text-white">
                  Ver meus pedidos
                </span>
              </Link>
              <Link
                href="/figma"
                className="flex-1 h-[56px] lg:h-[64px] bg-[#d8f9e7] rounded-[8px] flex items-center justify-center hover:bg-[#c5f0d8] transition-colors"
              >
                <span className="font-cera-pro font-medium text-[16px] text-[#254333]">
                  Ir para pagina inicial
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Formulario de criar conta ou login
  return (
    <div className="bg-white flex flex-col w-full flex-1">
      <ConfirmacaoStepper currentStep="senha" />

      <div className="flex justify-center px-4 lg:px-[24px] pt-6 lg:pt-[24px] pb-8 lg:pb-[32px]">
        <div className="flex flex-col gap-6 lg:gap-[32px] w-full max-w-[684px]">
          {/* Banner de sucesso do pagamento */}
          <div className="bg-[#f8f3ed] rounded-[16px] p-4 flex gap-2 items-center">
            <VerifiedIcon className="w-8 h-8 shrink-0" />
            <div className="flex flex-col gap-1">
              <p className="font-cera-pro font-bold text-[18px] lg:text-[20px] text-[#1d1b20]">
                Pagamento aprovado!
              </p>
              <p className="font-cera-pro font-light text-[12px] lg:text-[14px] text-[#1d1b20]">
                Boas noticias, seu pagamento foi confirmado!
              </p>
            </div>
          </div>

          {/* Texto explicativo */}
          <div className="flex flex-col gap-2">
            <p className="font-cera-pro font-bold text-[18px] lg:text-[20px] text-[#1d1b20]">
              Acompanhe seu pedido
            </p>
            <p className="font-cera-pro font-light text-[12px] lg:text-[14px] text-[#1d1b20]">
              {pageStatus === "login"
                ? "Voce ja tem uma conta. Faca login para vincular este pedido e acompanhar o status."
                : "Confirme seus dados para criar uma conta e acompanhar o status do seu pedido. E rapidinho!"}
            </p>
          </div>

          {/* Formulario */}
          <form onSubmit={pageStatus === "login" ? handleLogin : handleCreateAccount} className="flex flex-col gap-4 lg:gap-[16px]">
            {/* Campo de senha */}
            <div className="flex flex-col gap-3 lg:gap-[16px] w-full">
              <div className="flex justify-between items-center">
                <label className="font-cera-pro font-bold text-[18px] lg:text-[20px] text-black">
                  {pageStatus === "login" ? "Digite sua senha" : "Informe uma senha"}
                </label>
                {pageStatus === "login" && pedidoStatus?.cpf && (
                  <Link
                    href={`/figma/checkout/esqueci-senha?cpf=${pedidoStatus.cpf}${pedidoId ? `&pedidoId=${pedidoId}` : ""}`}
                    className="font-cera-pro font-light text-[14px] text-[#254333] underline hover:text-[#1a2e24]"
                  >
                    Esqueci minha senha
                  </Link>
                )}
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="********"
                className="w-full h-[48px] px-4 bg-white border border-[#d2d2d2] rounded-[8px] font-cera-pro font-light text-[18px] lg:text-[20px] text-[#333] placeholder:text-[#8c8c8c] focus:outline-none focus:border-[#254333]"
              />
            </div>

            {/* Confirmar senha (apenas para criar conta) */}
            {pageStatus === "create_account" && (
              <div className="flex flex-col gap-3 lg:gap-[16px] w-full">
                <label className="font-cera-pro font-bold text-[18px] lg:text-[20px] text-black">
                  Confirme sua senha
                </label>
                <input
                  type="password"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  placeholder="********"
                  className="w-full h-[48px] px-4 bg-white border border-[#d2d2d2] rounded-[8px] font-cera-pro font-light text-[18px] lg:text-[20px] text-[#333] placeholder:text-[#8c8c8c] focus:outline-none focus:border-[#254333]"
                />
              </div>
            )}

            {/* Checkbox de comunicacoes (apenas para criar conta) */}
            {pageStatus === "create_account" && (
              <div className="flex gap-2 items-start py-2">
                <button
                  type="button"
                  onClick={() => setReceberComunicacoes(!receberComunicacoes)}
                  className={`shrink-0 w-[18px] h-[18px] border-2 border-[#333] rounded-sm flex items-center justify-center ${
                    receberComunicacoes ? "bg-[#254333] border-[#254333]" : ""
                  }`}
                >
                  {receberComunicacoes && (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </button>
                <div className="flex flex-col gap-1">
                  <p className="font-cera-pro font-medium text-[14px] lg:text-[16px] text-[#111]">
                    Quero receber comunicacoes da Love
                  </p>
                  <p className="font-cera-pro font-light text-[10px] lg:text-[12px] text-[#111]">
                    Aceito receber atualizacoes sobre meus pedidos e ofertas de acordo com o termo de consentimento
                  </p>
                </div>
              </div>
            )}

            {/* Erro */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-[8px] p-3">
                <p className="font-cera-pro text-[14px] text-red-600">{error}</p>
              </div>
            )}

            {/* Botao */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-[60px] lg:h-[64px] bg-[#254333] rounded-[8px] flex items-center justify-center hover:bg-[#1a2e24] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <span className="font-cera-pro font-medium text-[16px] text-white">
                  Continuar
                </span>
              )}
            </button>

            {/* Link para pular */}
            <Link
              href="/figma"
              className="text-center font-cera-pro font-light text-[14px] text-[#666] underline hover:text-[#254333]"
            >
              Pular por enquanto
            </Link>
          </form>
        </div>
      </div>
    </div>
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
