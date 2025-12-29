"use client";

import Image from "next/image";
import Link from "next/link";
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

export interface Pedido {
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

interface PedidoCardProps {
  pedido: Pedido;
}

export function PedidoCard({ pedido }: PedidoCardProps) {
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
