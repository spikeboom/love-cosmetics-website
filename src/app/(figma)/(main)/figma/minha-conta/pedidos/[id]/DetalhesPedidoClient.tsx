"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { VitrineSection } from "../../../components/VitrineSection";
import { VerifiedIcon, PendingIcon, ChevronRightIcon } from "@/components/figma-shared/icons";
import { formatDate, formatDateTime, formatPrice } from "@/lib/formatters";
import { ResumoCompraCard } from "@/components/checkout/ResumoCompraCard";

// Tipos
interface HistoricoStatus {
  status: string;
  data: string;
  observacao: string | null;
}

interface ProdutoItem {
  name: string;
  image_url: string;
  quantity: number;
  preco: number;
  // Campos de apresentação (salvos no momento do pedido)
  preco_de?: number;
  desconto_percentual?: number;
}

interface Pedido {
  id: string;
  total: number;
  frete: number;
  subtotal_produtos?: number;
  descontos?: number;
  cupom_valor?: number | null;
  cupom_descricao?: string | null;
  status: string;
  statusEntrega: string;
  historicoStatus: HistoricoStatus[];
  items: ProdutoItem[];
  cupons: string[];
  createdAt: string;
  endereco: {
    cep: string;
    endereco: string;
    numero: string;
    complemento: string;
    bairro: string;
    cidade: string;
    estado: string;
  };
  payment_method: string | null;
  parcelas: number | null;
  pagamentos: Array<{
    info: {
      charges?: Array<{
        status: string;
        payment_method?: {
          type: string;
          installments?: number;
        };
      }>;
    };
  }>;
}

// Constantes de status na ordem do fluxo (os mesmos do sistema)
const STATUS_FLOW = [
  { key: "AGUARDANDO_PAGAMENTO", label: "Aguardando Pagamento" },
  { key: "PAGAMENTO_CONFIRMADO", label: "Pagamento Confirmado" },
  { key: "EM_SEPARACAO", label: "Em Separação" },
  { key: "EMBALADO", label: "Embalado" },
  { key: "ENVIADO", label: "Enviado" },
  { key: "EM_TRANSITO", label: "Em transporte" },
  { key: "SAIU_PARA_ENTREGA", label: "Saiu para Entrega" },
  { key: "ENTREGUE", label: "Entrega realizada" },
];


// Interface para props
interface DetalhesPedidoClientProps {
  produtos: any[];
}

export function DetalhesPedidoClient({ produtos }: DetalhesPedidoClientProps) {
  const router = useRouter();
  const params = useParams();
  const pedidoId = params.id as string;

  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (pedidoId) {
      fetchPedido();
    }
  }, [pedidoId]);

  const fetchPedido = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/cliente/conta/pedidos/${pedidoId}`, {
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push("/figma/entrar");
          return;
        }
        if (response.status === 404) {
          setError("Pedido não encontrado");
          return;
        }
        throw new Error("Erro ao carregar pedido");
      }

      const data = await response.json();
      setPedido(data.pedido);
    } catch (err) {
      setError("Erro ao carregar detalhes do pedido. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  // Obter método de pagamento com parcelas
  const getMetodoPagamento = () => {
    if (!pedido) return "Pix";
    const metodo = pedido.payment_method;
    if (metodo === "credit_card") {
      const parcelas = pedido.parcelas;
      if (parcelas && parcelas > 1) return `Cartao ${parcelas}x`;
      return "Cartao";
    }
    return "Pix";
  };

  // Loading
  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#254333] border-t-transparent rounded-full animate-spin" />
          <p className="font-cera-pro text-[16px] text-[#333]">Carregando detalhes...</p>
        </div>
      </div>
    );
  }

  // Error
  if (error || !pedido) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="font-cera-pro text-[16px] text-red-600">{error || "Pedido não encontrado"}</p>
          <Link
            href="/figma/minha-conta/pedidos"
            className="h-[48px] px-6 bg-[#254333] rounded-[8px] text-white font-cera-pro font-medium hover:bg-[#1a2e24] transition-colors flex items-center justify-center"
          >
            Voltar para meus pedidos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="flex items-start justify-center px-[16px] lg:px-[24px] py-[24px] lg:py-[32px]">
        <div className="flex flex-col gap-[24px] items-start w-full max-w-[1200px]">
          {/* Breadcrumbs */}
          <div className="flex gap-[8px] items-center">
            <Link
              href="/figma/minha-conta/pedidos"
              className="font-cera-pro font-light text-[12px] text-black underline hover:text-[#254333]"
            >
              Meus pedidos
            </Link>
            <ChevronRightIcon className="w-[16px] h-[16px] text-black" />
            <span className="font-cera-pro font-light text-[12px] text-black">
              Detalhes do pedido
            </span>
          </div>

          {/* Título */}
          <h1 className="font-cera-pro font-bold text-[32px] text-black">
            Pedido N° <span className="text-[#b3261e]">{pedido.id.slice(0, 8)}</span>
          </h1>

          {/* Conteúdo principal - Layout de duas colunas */}
          <div className="flex flex-col lg:flex-row gap-[32px] w-full">
            {/* Coluna esquerda - Status do pedido */}
            <div className="flex-1 flex flex-col gap-[32px]">
              {/* Título da seção */}
              <div className="flex flex-col gap-[16px]">
                <h2 className="font-cera-pro font-bold text-[20px] text-black">
                  Status do pedido
                </h2>
              </div>

              {/* Timeline de status - Mostra apenas status já atingidos */}
              <div className="flex flex-col gap-[16px]">
                {pedido.historicoStatus && pedido.historicoStatus.length > 0 ? (
                  // Mostra o histórico real do pedido
                  pedido.historicoStatus.map((historico, index) => {
                    const statusInfo = STATUS_FLOW.find(s => s.key === historico.status);
                    const label = statusInfo?.label || historico.status;

                    return (
                      <div key={index} className="flex gap-[8px] items-start">
                        {/* Ícone */}
                        <div className="flex items-center py-[2px]">
                          <VerifiedIcon className="w-[24px] h-[24px] text-[#009142]" />
                        </div>

                        {/* Texto */}
                        <div className="flex flex-col gap-[8px]">
                          <p className="font-cera-pro font-medium text-[16px] text-[#009142]">
                            {label}
                          </p>
                          <p className="font-cera-pro font-light text-[14px] text-[#1d1b20]">
                            {formatDateTime(historico.data)}
                            {historico.observacao && <>. {historico.observacao}</>}
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  // Se não há histórico, mostra o status atual
                  <div className="flex gap-[8px] items-start">
                    <div className="flex items-center py-[2px]">
                      <VerifiedIcon className="w-[24px] h-[24px] text-[#009142]" />
                    </div>
                    <div className="flex flex-col gap-[8px]">
                      <p className="font-cera-pro font-medium text-[16px] text-[#009142]">
                        {STATUS_FLOW.find(s => s.key === pedido.statusEntrega)?.label || pedido.statusEntrega}
                      </p>
                      <p className="font-cera-pro font-light text-[14px] text-[#1d1b20]">
                        {formatDateTime(pedido.createdAt)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Coluna direita - Resumo do pedido */}
            <div className="w-full lg:w-[380px] flex flex-col gap-4">
              <ResumoCompraCard
                mode="order"
                pedido={{
                  items: pedido.items,
                  subtotal_produtos: pedido.subtotal_produtos,
                  total: pedido.total,
                  frete: pedido.frete,
                  cupom_valor: pedido.cupom_valor,
                  cupom_descricao: pedido.cupom_descricao,
                }}
                frete={pedido.frete}
                dataPedido={formatDate(pedido.createdAt)}
                metodoPagamento={getMetodoPagamento()}
                cupomDescricao={pedido.cupom_descricao ?? undefined}
              />

              {/* Botao comprar novamente */}
              <Link
                href="/figma/cart"
                className="w-full h-[48px] bg-[#254333] rounded-[8px] flex items-center justify-center hover:bg-[#1a2e24] transition-colors"
              >
                <span className="font-cera-pro font-medium text-[16px] text-white">
                  Comprar novamente
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Seção de Recomendações */}
      <div className="w-full bg-[#f8f3ed]">
        <div className="w-full flex flex-row justify-center">
          <div className="w-full max-w-[1440px] mx-auto">
            <VitrineSection
              titulo="Recomendações para você"
              backgroundColor="cream"
              showNavigation={true}
              tipo="produto-completo"
              produtos={produtos}
              showVerTodos={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
