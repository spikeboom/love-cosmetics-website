"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { VitrineSection } from "../../components/VitrineSection";
import { VerifiedIcon, ArrowForwardIcon } from "@/components/figma-shared/icons";
import { formatDate, formatDateTime, formatPrice } from "@/lib/formatters";

// Tipos
interface ProdutoImagem {
  name: string;
  image_url: string;
  quantity: number;
}

interface HistoricoStatus {
  status: string;
  data: string;
  observacao: string | null;
}

interface Pedido {
  id: string;
  total: number;
  frete: number;
  status: string;
  statusColor: string;
  statusEntrega: string;
  historicoStatus: HistoricoStatus[];
  ultimaAtualizacaoEntrega: {
    status: string;
    data: string;
    observacao: string | null;
  } | null;
  produtosImagens: ProdutoImagem[];
  createdAt: string;
}


// Constantes de status
const STATUS_LABELS: Record<string, string> = {
  AGUARDANDO_PAGAMENTO: "Aguardando Pagamento",
  PAGAMENTO_CONFIRMADO: "Pagamento Confirmado",
  EM_SEPARACAO: "Em Separacao",
  EMBALADO: "Embalado",
  ENVIADO: "Enviado",
  EM_TRANSITO: "Em transporte",
  SAIU_PARA_ENTREGA: "Saiu para Entrega",
  ENTREGUE: "Entrega realizada",
  CANCELADO: "Cancelado",
  DEVOLVIDO: "Devolvido",
};



// Componente de Card de Pedido
function PedidoCard({ pedido }: { pedido: Pedido }) {
  const getStatusLabel = (status: string) => {
    return STATUS_LABELS[status] || status;
  };

  const isEntregue = pedido.statusEntrega === "ENTREGUE";
  const isCancelado = pedido.statusEntrega === "CANCELADO";

  return (
    <div className="bg-white rounded-[8px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.3),0px_1px_3px_1px_rgba(0,0,0,0.15)] overflow-hidden w-full">
      <div className="p-[16px] flex flex-col gap-[16px]">
        {/* Header do pedido - Desktop */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-col gap-[16px]">
            <p className="font-cera-pro text-[20px] text-black">
              <span className="font-bold">N° do pedido: </span>
              <span className="font-bold text-[#b3261e]">{pedido.id.slice(0, 8)}</span>
            </p>
            <p className="font-cera-pro font-light text-[20px] text-black">
              {formatDate(pedido.createdAt)} | Valor total: {formatPrice(pedido.total)}
            </p>
          </div>

          {/* Botoes - Desktop */}
          <div className="hidden lg:flex gap-[16px]">
            {isEntregue && (
              <Link
                href={`/figma/cart`}
                className="h-[48px] w-[200px] bg-[#d8f9e7] rounded-[8px] flex items-center justify-center hover:bg-[#c5f0d8] transition-colors"
              >
                <span className="font-cera-pro font-medium text-[16px] text-[#254333]">
                  Comprar novamente
                </span>
              </Link>
            )}
            <Link
              href={`/figma/minha-conta/pedidos/${pedido.id}`}
              className="h-[48px] w-[200px] bg-[#254333] rounded-[8px] flex items-center justify-center hover:bg-[#1a2e24] transition-colors"
            >
              <span className="font-cera-pro font-medium text-[16px] text-white">
                Exibir detalhes
              </span>
            </Link>
          </div>
        </div>

        {/* Miniaturas dos produtos */}
        <div className="flex gap-[16px] overflow-x-auto">
          {pedido.produtosImagens.map((produto, index) => (
            <div
              key={index}
              className="relative w-[80px] h-[80px] rounded-[8px] overflow-hidden flex-shrink-0 bg-[#f8f3ed]"
            >
              {produto.image_url ? (
                <Image
                  src={produto.image_url}
                  alt={produto.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-[10px] text-[#999] text-center px-1">{produto.name}</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Status de entrega */}
        <div className="flex gap-[8px] items-start">
          {isEntregue ? (
            <VerifiedIcon className="w-[24px] h-[24px] text-[#009142] flex-shrink-0" />
          ) : (
            <div className="flex items-center px-0 py-[2px]">
              <ArrowForwardIcon className="w-[24px] h-[24px] text-[#254333] flex-shrink-0" />
            </div>
          )}
          <div className="flex flex-col gap-[8px]">
            <p className={`font-cera-pro font-medium text-[16px] ${isEntregue ? "text-[#009142]" : isCancelado ? "text-[#b3261e]" : "text-[#254333]"}`}>
              {getStatusLabel(pedido.statusEntrega)}
            </p>
            {pedido.ultimaAtualizacaoEntrega && (
              <p className="font-cera-pro font-light text-[14px] text-[#1d1b20]">
                {formatDateTime(pedido.ultimaAtualizacaoEntrega.data)}
                {pedido.ultimaAtualizacaoEntrega.observacao && (
                  <>. {pedido.ultimaAtualizacaoEntrega.observacao}</>
                )}
              </p>
            )}
          </div>
        </div>

        {/* Botoes - Mobile */}
        <div className="flex lg:hidden gap-[16px]">
          {isEntregue && (
            <Link
              href={`/figma/cart`}
              className="flex-1 h-[48px] bg-[#d8f9e7] rounded-[8px] flex items-center justify-center hover:bg-[#c5f0d8] transition-colors"
            >
              <span className="font-cera-pro font-medium text-[14px] text-[#254333]">
                Comprar novamente
              </span>
            </Link>
          )}
          <Link
            href={`/figma/minha-conta/pedidos/${pedido.id}`}
            className={`${isEntregue ? "flex-1" : "w-full"} h-[48px] bg-[#254333] rounded-[8px] flex items-center justify-center hover:bg-[#1a2e24] transition-colors`}
          >
            <span className="font-cera-pro font-medium text-[14px] text-white">
              Exibir detalhes
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}

// Interface para props
interface MeusPedidosClientProps {
  produtos: any[];
}

// Constantes de paginação
const ITEMS_PER_PAGE = 5;

// Componente Principal
export function MeusPedidosClient({ produtos }: MeusPedidosClientProps) {
  const router = useRouter();
  const [allPedidos, setAllPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchPedidos();
  }, []);

  const fetchPedidos = async () => {
    try {
      setLoading(true);
      setError(null);

      // Buscar todos os pedidos de uma vez (limite alto)
      const response = await fetch(`/api/cliente/conta/pedidos?page=1&limit=100`, {
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push("/figma/entrar");
          return;
        }
        throw new Error("Erro ao carregar pedidos");
      }

      const data = await response.json();
      setAllPedidos(data.pedidos);
    } catch (err) {
      setError("Erro ao carregar pedidos. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  // Paginação no frontend
  const totalPages = Math.ceil(allPedidos.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const pedidosPaginados = allPedidos.slice(startIndex, endIndex);
  const hasPrevious = currentPage > 1;
  const hasNext = currentPage < totalPages;

  // Loading
  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#254333] border-t-transparent rounded-full animate-spin" />
          <p className="font-cera-pro text-[16px] text-[#333]">Carregando pedidos...</p>
        </div>
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="font-cera-pro text-[16px] text-red-600">{error}</p>
          <button
            onClick={() => fetchPedidos()}
            className="h-[48px] px-6 bg-[#254333] rounded-[8px] text-white font-cera-pro font-medium hover:bg-[#1a2e24] transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Conteudo principal */}
      <div className="flex items-start justify-center px-[16px] lg:px-[24px] py-[24px] lg:py-[32px]">
        <div className="flex flex-col gap-[32px] items-start w-full max-w-[1200px]">
          {/* Titulo */}
          <h1 className="font-cera-pro font-bold text-[32px] text-black">
            Meus pedidos
          </h1>

          {/* Lista de pedidos */}
          {allPedidos.length === 0 ? (
            <div className="bg-[#f8f3ed] rounded-[16px] p-8 text-center w-full">
              <p className="font-cera-pro font-medium text-[18px] text-[#333] mb-2">
                Voce ainda nao fez nenhum pedido
              </p>
              <p className="font-cera-pro font-light text-[14px] text-[#666] mb-6">
                Que tal explorar nossos produtos?
              </p>
              <Link
                href="/figma/design"
                className="inline-flex h-[48px] px-8 bg-[#254333] rounded-[8px] items-center justify-center hover:bg-[#1a2e24] transition-colors"
              >
                <span className="font-cera-pro font-medium text-[16px] text-white">
                  Comecar a comprar
                </span>
              </Link>
            </div>
          ) : (
            <>
              {pedidosPaginados.map((pedido) => (
                <PedidoCard key={pedido.id} pedido={pedido} />
              ))}
            </>
          )}

          {/* Paginacao */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 w-full">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={!hasPrevious}
                className="h-[40px] px-4 border border-[#d2d2d2] rounded-[8px] font-cera-pro font-medium text-[14px] text-[#333] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#f8f3ed] transition-colors"
              >
                Anterior
              </button>
              <span className="font-cera-pro font-light text-[14px] text-[#666]">
                Pagina {currentPage} de {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={!hasNext}
                className="h-[40px] px-4 border border-[#d2d2d2] rounded-[8px] font-cera-pro font-medium text-[14px] text-[#333] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#f8f3ed] transition-colors"
              >
                Proxima
              </button>
            </div>
          )}
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
