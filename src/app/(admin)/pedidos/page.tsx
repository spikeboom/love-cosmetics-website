"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Pedido } from "./components/types";
import { PedidoCard } from "./components/PedidoCard";
import { AbandonosPanel } from "./components/AbandonosPanel";
import {
  PackageIcon,
  RefreshIcon,
  PlusIcon,
  DownloadIcon,
  SpinnerIcon,
} from "./components/Icons";

const ShoppingCartIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="9" cy="21" r="1" />
    <circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
  </svg>
);

export default function PedidosPage() {
  const [activeTab, setActiveTab] = useState<"pedidos" | "abandonos">("pedidos");
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [filterMode, setFilterMode] = useState<'hideTests' | 'showOnlyTests'>('hideTests');
  const [apenasEfetivados, setApenasEfetivados] = useState(false);
  const [page, setPage] = useState(1);
  const [exporting, setExporting] = useState(false);
  const pageSize = 10;

  const fetchPedidos = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setInitialLoading(true);
    }

    try {
      const response = await fetch(
        `/api/pedidos?page=${page}&pageSize=${pageSize}&filterMode=${filterMode}&apenasEfetivados=${apenasEfetivados}`,
      );
      if (!response.ok) {
        throw new Error("Erro ao buscar os pedidos.");
      }
      const data = await response.json();
      setPedidos(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Erro desconhecido.");
    } finally {
      if (isRefresh) {
        setRefreshing(false);
      } else {
        setInitialLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchPedidos(false);
  }, [page, filterMode, apenasEfetivados]);

  const exportToExcel = async () => {
    setExporting(true);
    try {
      // Buscar todos os pedidos sem paginacao
      const response = await fetch(
        `/api/pedidos?page=1&pageSize=10000&filterMode=${filterMode}&apenasEfetivados=${apenasEfetivados}`,
      );
      if (!response.ok) throw new Error("Erro ao buscar pedidos");
      const allPedidos: Pedido[] = await response.json();

      // Preparar dados para CSV
      const headers = [
        "ID",
        "Data",
        "Nome",
        "Email",
        "Telefone",
        "CPF",
        "Endereco",
        "Numero",
        "Complemento",
        "Bairro",
        "Cidade",
        "Estado",
        "CEP",
        "Itens",
        "Total Pedido",
        "Frete",
        "Total Final",
        "Status Pagamento",
        "Transportadora",
        "Prazo Entrega",
      ];

      const rows = allPedidos.map((pedido) => {
        const getPaymentStatus = () => {
          if (pedido.pagamentos && pedido.pagamentos.length > 0) {
            const info = pedido.pagamentos[0]?.info;
            const charge = info?.charges?.[0];
            return charge?.status || info?.status || pedido.pagamentos[0].status || "N/A";
          }
          return pedido.status_pagamento || "N/A";
        };

        const itensResumo = (pedido.items || [])
          .map((item) => `${item.name} (${item.quantity}x)`)
          .join("; ");

        return [
          pedido.id,
          new Date(pedido.createdAt).toLocaleString("pt-BR"),
          `${pedido.nome} ${pedido.sobrenome}`,
          pedido.email,
          pedido.telefone,
          pedido.cpf,
          pedido.endereco,
          pedido.numero,
          pedido.complemento || "",
          pedido.bairro,
          pedido.cidade,
          pedido.estado,
          pedido.cep,
          itensResumo,
          pedido.total_pedido.toFixed(2),
          pedido.frete_calculado.toFixed(2),
          (pedido.total_pedido + pedido.frete_calculado).toFixed(2),
          getPaymentStatus(),
          pedido.transportadora_nome || "",
          pedido.transportadora_prazo ? `${pedido.transportadora_prazo} dias` : "",
        ];
      });

      // Criar CSV com BOM para UTF-8
      const BOM = "\uFEFF";
      const csvContent =
        BOM +
        [headers.join(";"), ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(";"))].join("\n");

      // Download
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `pedidos_${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Erro ao exportar:", err);
      alert("Erro ao exportar pedidos");
    } finally {
      setExporting(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-[#f8f3ed] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <SpinnerIcon className="h-10 w-10 text-[#254333]" />
          <p className="font-cera-pro font-light text-[14px] text-[#666666]">
            Carregando pedidos...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f8f3ed] flex items-center justify-center p-4">
        <div className="bg-white rounded-[16px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.3),0px_1px_3px_1px_rgba(0,0,0,0.15)] p-6 max-w-md w-full">
          <div className="flex gap-[8px] items-center w-full bg-red-50 rounded-lg p-3 mb-4">
            <p className="font-cera-pro font-light text-[14px] text-[#B3261E]">
              {error}
            </p>
          </div>
          <button
            onClick={() => fetchPedidos(false)}
            className="w-full flex justify-center items-center gap-2 px-4 py-3 bg-[#254333] hover:bg-[#1a3226] rounded-[8px] transition-colors"
          >
            <RefreshIcon />
            <span className="font-cera-pro font-medium text-[16px] text-white">
              Tentar Novamente
            </span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f3ed]">
      {/* Header */}
      <div className="bg-[#254333] px-4 lg:px-8 py-6">
        <div className="max-w-[1440px] mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-cera-pro font-bold text-[24px] lg:text-[32px] text-white leading-normal">
                Painel de Pedidos
              </h1>
              <p className="font-cera-pro font-light text-[14px] lg:text-[16px] text-white/80 mt-1">
                Gerencie e visualize todos os pedidos da loja
              </p>
            </div>
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-[8px] transition-colors"
            >
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span className="font-cera-pro font-medium text-[14px] text-white">
                Dashboard
              </span>
            </Link>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-4">
            <button
              onClick={() => setActiveTab("pedidos")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-t-[10px] font-cera-pro font-medium text-[14px] transition-colors ${
                activeTab === "pedidos"
                  ? "bg-[#f8f3ed] text-[#254333]"
                  : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
              }`}
            >
              <PackageIcon />
              Pedidos
            </button>
            <button
              onClick={() => setActiveTab("abandonos")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-t-[10px] font-cera-pro font-medium text-[14px] transition-colors ${
                activeTab === "abandonos"
                  ? "bg-[#f8f3ed] text-[#254333]"
                  : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
              }`}
            >
              <ShoppingCartIcon />
              Carrinhos Abandonados
            </button>
          </div>
        </div>
      </div>

      {/* Conteudo */}
      <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-6">
        {activeTab === "abandonos" ? (
          <AbandonosPanel />
        ) : (
        <>
        {/* Barra de Acoes */}
        <div className="bg-white rounded-[16px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.3),0px_1px_3px_1px_rgba(0,0,0,0.15)] p-4 lg:p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Info */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#D8F9E7] rounded-full flex items-center justify-center">
                <PackageIcon />
              </div>
              <div>
                <p className="font-cera-pro font-bold text-[18px] lg:text-[20px] text-black">
                  {pedidos.length} pedidos
                </p>
                <p className="font-cera-pro font-light text-[12px] text-[#666666]">
                  {filterMode === 'hideTests' ? 'Excluindo testes' : 'Apenas testes'}
                </p>
              </div>
            </div>

            {/* Acoes */}
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/pedidos/novo"
                className="flex items-center gap-2 px-4 py-2 bg-[#254333] hover:bg-[#1a3226] rounded-[8px] transition-colors"
              >
                <PlusIcon />
                <span className="font-cera-pro font-medium text-[14px] text-white">
                  Novo Pedido
                </span>
              </Link>
              <button
                onClick={() => fetchPedidos(true)}
                disabled={refreshing}
                className="flex items-center gap-2 px-4 py-2 bg-[#D8F9E7] hover:bg-[#c5f0d9] disabled:opacity-50 rounded-[8px] transition-colors"
              >
                <RefreshIcon className={refreshing ? "animate-spin" : ""} />
                <span className="font-cera-pro font-medium text-[14px] text-[#254333]">
                  {refreshing ? 'Atualizando...' : 'Atualizar'}
                </span>
              </button>

              <button
                onClick={exportToExcel}
                disabled={exporting || pedidos.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-[#D8F9E7] hover:bg-[#c5f0d9] disabled:opacity-50 rounded-[8px] transition-colors"
              >
                <DownloadIcon />
                <span className="font-cera-pro font-medium text-[14px] text-[#254333]">
                  {exporting ? 'Exportando...' : 'Exportar Excel'}
                </span>
              </button>

              <label className="flex items-center gap-2 px-4 py-2 bg-white border border-[#d2d2d2] rounded-[8px] cursor-pointer hover:bg-[#f8f3ed] transition-colors">
                <input
                  type="checkbox"
                  checked={apenasEfetivados}
                  onChange={(e) => {
                    setApenasEfetivados(e.target.checked);
                    setPage(1);
                  }}
                  className="w-4 h-4 accent-[#254333]"
                />
                <span className="font-cera-pro font-medium text-[14px] text-[#333333]">
                  Apenas Pagos
                </span>
              </label>

              <div className="flex rounded-[8px] overflow-hidden border border-[#d2d2d2]">
                <button
                  onClick={() => setFilterMode('hideTests')}
                  className={`px-4 py-2 font-cera-pro font-medium text-[14px] transition-colors ${
                    filterMode === 'hideTests'
                      ? 'bg-[#254333] text-white'
                      : 'bg-white text-[#333333] hover:bg-[#f8f3ed]'
                  }`}
                >
                  Ocultar Testes
                </button>
                <button
                  onClick={() => setFilterMode('showOnlyTests')}
                  className={`px-4 py-2 font-cera-pro font-medium text-[14px] transition-colors ${
                    filterMode === 'showOnlyTests'
                      ? 'bg-[#254333] text-white'
                      : 'bg-white text-[#333333] hover:bg-[#f8f3ed]'
                  }`}
                >
                  Apenas Testes
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Pedidos */}
        <div className="space-y-4">
          {pedidos.length === 0 ? (
            <div className="bg-white rounded-[16px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.3),0px_1px_3px_1px_rgba(0,0,0,0.15)] p-8 text-center">
              <p className="font-cera-pro font-light text-[16px] text-[#666666]">
                Nenhum pedido encontrado
              </p>
            </div>
          ) : (
            pedidos.map((pedido) => (
              <PedidoCard
                key={pedido.id}
                pedido={pedido}
                onNotaGerada={() => fetchPedidos(true)}
                onStatusChange={() => fetchPedidos(true)}
              />
            ))
          )}
        </div>

        {/* Paginacao */}
        <div className="mt-6 bg-white rounded-[16px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.3),0px_1px_3px_1px_rgba(0,0,0,0.15)] p-4">
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-[#D8F9E7] hover:bg-[#c5f0d9] disabled:bg-[#d2d2d2] disabled:cursor-not-allowed rounded-[8px] transition-colors"
            >
              <span className="font-cera-pro font-medium text-[14px] text-[#254333]">
                Anterior
              </span>
            </button>

            <div className="px-4 py-2 bg-[#f8f3ed] rounded-[8px]">
              <span className="font-cera-pro font-bold text-[14px] text-black">
                Pagina {page}
              </span>
            </div>

            <button
              onClick={() => setPage((prev) => prev + 1)}
              disabled={pedidos.length < pageSize}
              className="px-4 py-2 bg-[#D8F9E7] hover:bg-[#c5f0d9] disabled:bg-[#d2d2d2] disabled:cursor-not-allowed rounded-[8px] transition-colors"
            >
              <span className="font-cera-pro font-medium text-[14px] text-[#254333]">
                Proxima
              </span>
            </button>
          </div>
        </div>
        </>
        )}
      </div>
    </div>
  );
}
