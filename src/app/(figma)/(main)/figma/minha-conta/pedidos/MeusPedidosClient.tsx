"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { VitrineSection } from "../../components/VitrineSection";
import { PedidoCard, Pedido } from "./components";

// Interface para props
interface MeusPedidosClientProps {
  produtos: any[];
}

// Constantes de paginacao
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

  // Paginacao no frontend
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
          {/* Titulo e Sair */}
          <div className="flex items-center justify-between w-full">
            <h1 className="font-cera-pro font-bold text-[32px] text-black">
              Meus pedidos
            </h1>
            <Link
              href="/figma/sair"
              className="flex items-center gap-2 px-4 py-2 border border-[#254333] rounded-[8px] text-[#254333] hover:bg-[#254333] hover:text-white transition-colors"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M16 17L21 12L16 7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M21 12H9"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="font-cera-pro font-medium text-[14px]">Sair</span>
            </Link>
          </div>

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

      {/* Secao de Recomendacoes */}
      <div className="w-full bg-[#f8f3ed]">
        <div className="w-full flex flex-row justify-center">
          <div className="w-full max-w-[1440px] mx-auto">
            <VitrineSection
              titulo="Recomendacoes para voce"
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
