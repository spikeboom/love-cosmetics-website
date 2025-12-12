"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSnackbar } from "notistack";
import {
  StatusEntregaBadge,
  StatusEntregaManager,
  HistoricoStatusEntrega,
} from "./components/StatusEntregaManager";

interface Pagamento {
  id: string;
  info: any;
  status: string;
}

interface Item {
  name: string;
  quantity: number;
  image_url: string;
  unit_amount: number;
  reference_id: string;
}

interface Pedido {
  id: string;
  nome: string;
  sobrenome: string;
  email: string;
  telefone: string;
  cpf: string;
  data_nascimento: string;
  pais: string;
  cep: string;
  endereco: string;
  numero: string;
  complemento?: string | null;
  bairro: string;
  cidade: string;
  estado: string;
  total_pedido: number;
  frete_calculado: number;
  transportadora_nome?: string | null;
  transportadora_servico?: string | null;
  transportadora_prazo?: number | null;
  items: Item[];
  salvar_minhas_informacoes: boolean;
  aceito_receber_whatsapp: boolean;
  destinatario?: string | null;
  createdAt: string;
  pagamentos?: Pagamento[] | null;
  cupons: any[];
  notaFiscalGerada?: boolean;
  notaFiscalId?: string | null;
  notaFiscalErro?: string | null;
  status_entrega: string;
  status_pagamento?: string | null;
}

// Ícones SVG inline
const ChevronDownIcon = ({ className = "" }: { className?: string }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M6 9l6 6 6-6" />
  </svg>
);

const UserIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const MailIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="M22 6l-10 7L2 6" />
  </svg>
);

const PhoneIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

const MapPinIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const CreditCardIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="1" y="4" width="22" height="16" rx="2" />
    <line x1="1" y1="10" x2="23" y2="10" />
  </svg>
);

const PackageIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
);

const RefreshIcon = ({ className = "" }: { className?: string }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <polyline points="23 4 23 10 17 10" />
    <polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
);

const ReceiptIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1z" />
    <line x1="8" y1="6" x2="16" y2="6" />
    <line x1="8" y1="10" x2="16" y2="10" />
    <line x1="8" y1="14" x2="12" y2="14" />
  </svg>
);

const TruckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="1" y="3" width="15" height="13" />
    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
    <circle cx="5.5" cy="18.5" r="2.5" />
    <circle cx="18.5" cy="18.5" r="2.5" />
  </svg>
);

const ClockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

function StatusBadge({ status }: { status: string }) {
  const statusMap: Record<string, { label: string; bgColor: string; textColor: string; borderColor: string }> = {
    'PAID': { label: 'Pago', bgColor: 'bg-[#F0F9F4]', textColor: 'text-[#009142]', borderColor: 'border-[#009142]' },
    'IN_ANALYSIS': { label: 'Em Análise', bgColor: 'bg-[#FFF8E6]', textColor: 'text-[#ba7900]', borderColor: 'border-[#ba7900]' },
    'FAILED': { label: 'Falhou', bgColor: 'bg-red-50', textColor: 'text-[#B3261E]', borderColor: 'border-[#B3261E]' },
    'CANCELLED': { label: 'Cancelado', bgColor: 'bg-red-50', textColor: 'text-[#B3261E]', borderColor: 'border-[#B3261E]' },
    'WAITING_PAYMENT': { label: 'Aguardando', bgColor: 'bg-blue-50', textColor: 'text-blue-600', borderColor: 'border-blue-600' },
    'CORTESIA': { label: 'Cortesia', bgColor: 'bg-purple-50', textColor: 'text-purple-600', borderColor: 'border-purple-600' },
  };

  const config = statusMap[status] || { label: status, bgColor: 'bg-gray-100', textColor: 'text-[#666666]', borderColor: 'border-[#d2d2d2]' };

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-[4px] border ${config.bgColor} ${config.textColor} ${config.borderColor} font-cera-pro font-light text-[12px]`}>
      {config.label}
    </span>
  );
}

function PedidoCard({ pedido, onNotaGerada, onStatusChange }: { pedido: Pedido; onNotaGerada: () => void; onStatusChange: () => void }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showContato, setShowContato] = useState(false);
  const [showPagamentos, setShowPagamentos] = useState(false);
  const [showStatusEntrega, setShowStatusEntrega] = useState(false);
  const [generatingNota, setGeneratingNota] = useState(false);
  const [historicoRefreshKey, setHistoricoRefreshKey] = useState(0);
  const { enqueueSnackbar } = useSnackbar();

  const handleGerarNota = async () => {
    setGeneratingNota(true);
    try {
      const response = await fetch(`/api/pedidos/${pedido.id}/gerar-nota`, {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        enqueueSnackbar('Nota fiscal gerada com sucesso!', { variant: 'success' });
        onNotaGerada();
      } else {
        enqueueSnackbar(data.message || 'Erro ao gerar nota fiscal', { variant: 'error' });
      }
    } catch (error) {
      console.error('Erro ao gerar nota:', error);
      enqueueSnackbar('Erro ao gerar nota fiscal', { variant: 'error' });
    } finally {
      setGeneratingNota(false);
    }
  };

  const getMainPaymentStatus = () => {
    if (!pedido.pagamentos || pedido.pagamentos.length === 0) return null;
    const charge = pedido.pagamentos[0]?.info?.charges?.[0];
    return charge?.status || pedido.pagamentos[0].status;
  };

  const mainStatus = getMainPaymentStatus();

  return (
    <div className="bg-white rounded-[16px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.3),0px_1px_3px_1px_rgba(0,0,0,0.15)] overflow-hidden">
      {/* Header do Card */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 lg:p-6 flex items-center justify-between hover:bg-[#f8f3ed] transition-colors"
      >
        <div className="flex items-center gap-4 flex-1 min-w-0">
          {/* Avatar */}
          <div className="w-10 h-10 lg:w-12 lg:h-12 bg-[#254333] rounded-full flex items-center justify-center flex-shrink-0">
            <span className="font-cera-pro font-bold text-[16px] lg:text-[18px] text-white">
              {pedido.nome.charAt(0).toUpperCase()}
            </span>
          </div>

          {/* Info Principal */}
          <div className="flex-1 min-w-0 text-left">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-cera-pro font-bold text-[16px] lg:text-[18px] text-black truncate">
                {pedido.nome} {pedido.sobrenome}
              </p>
              {mainStatus && <StatusBadge status={mainStatus} />}
              <StatusEntregaBadge status={pedido.status_entrega || "AGUARDANDO_PAGAMENTO"} />
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="font-cera-pro font-light text-[12px] text-[#666666]">
                #{pedido.id.slice(-8)}
              </span>
              <span className="text-[#d2d2d2]">•</span>
              <span className="font-cera-pro font-light text-[12px] text-[#666666]">
                {new Date(pedido.createdAt).toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>

          {/* Valor */}
          <div className="text-right flex-shrink-0 hidden sm:block">
            <p className="font-cera-pro font-bold text-[18px] lg:text-[20px] text-[#009142]">
              {pedido.total_pedido.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </p>
            <p className="font-cera-pro font-light text-[12px] text-[#666666]">
              + {pedido.frete_calculado.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })} frete
            </p>
          </div>
        </div>

        {/* Chevron */}
        <ChevronDownIcon
          className={`w-6 h-6 text-[#666666] flex-shrink-0 ml-4 transition-transform ${isExpanded ? "rotate-180" : ""}`}
        />
      </button>

      {/* Valor Mobile */}
      <div className="px-4 pb-4 sm:hidden">
        <div className="flex items-center justify-between">
          <p className="font-cera-pro font-bold text-[18px] text-[#009142]">
            {pedido.total_pedido.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </p>
          <p className="font-cera-pro font-light text-[12px] text-[#666666]">
            + {pedido.frete_calculado.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })} frete
          </p>
        </div>
      </div>

      {/* Conteúdo Expandido */}
      {isExpanded && (
        <div className="border-t border-[#d2d2d2]">
          {/* Itens do Pedido */}
          <div className="p-4 lg:p-6 border-b border-[#d2d2d2]">
            <div className="flex items-center gap-2 mb-4">
              <PackageIcon />
              <h3 className="font-cera-pro font-bold text-[16px] lg:text-[18px] text-black">
                Itens do Pedido
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {pedido.items.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-[#f8f3ed] rounded-[8px] p-3"
                >
                  <p className="font-cera-pro font-medium text-[14px] text-black line-clamp-2 mb-2">
                    {item.name}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="font-cera-pro font-light text-[12px] text-[#666666]">
                      Qtd: {item.quantity}
                    </span>
                    <span className="font-cera-pro font-bold text-[14px] text-[#254333]">
                      {item.unit_amount.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Cupons */}
            {pedido.cupons && pedido.cupons.length > 0 && (
              <div className="mt-4 p-3 bg-[#F0F9F4] rounded-[8px] border border-[#009142]">
                <p className="font-cera-pro font-medium text-[12px] text-[#009142] mb-2">
                  Cupons Aplicados
                </p>
                <div className="flex flex-wrap gap-2">
                  {pedido.cupons.map((cupom, idx) => (
                    <span
                      key={idx}
                      className="bg-white px-2 py-1 rounded-[4px] font-cera-pro font-light text-[12px] text-[#009142] border border-[#009142]"
                    >
                      {cupom}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Ações */}
          <div className="p-4 lg:p-6 flex flex-wrap gap-3">
            <button
              onClick={() => setShowStatusEntrega(!showStatusEntrega)}
              className="flex items-center gap-2 px-4 py-2 bg-[#254333] hover:bg-[#1a3226] rounded-[8px] transition-colors"
            >
              <TruckIcon />
              <span className="font-cera-pro font-medium text-[14px] text-white">
                {showStatusEntrega ? "Ocultar" : "Gerenciar"} Entrega
              </span>
            </button>

            <button
              onClick={() => setShowContato(!showContato)}
              className="flex items-center gap-2 px-4 py-2 bg-[#D8F9E7] hover:bg-[#c5f0d9] rounded-[8px] transition-colors"
            >
              <UserIcon />
              <span className="font-cera-pro font-medium text-[14px] text-[#254333]">
                {showContato ? "Ocultar" : "Ver"} Cliente
              </span>
            </button>

            <button
              onClick={() => setShowPagamentos(!showPagamentos)}
              className="flex items-center gap-2 px-4 py-2 bg-[#D8F9E7] hover:bg-[#c5f0d9] rounded-[8px] transition-colors"
            >
              <CreditCardIcon />
              <span className="font-cera-pro font-medium text-[14px] text-[#254333]">
                {showPagamentos ? "Ocultar" : "Ver"} Pagamentos
              </span>
            </button>

            {/* Botão Nota Fiscal */}
            {pedido.notaFiscalGerada ? (
              <div className="flex items-center gap-2 px-4 py-2 bg-[#F0F9F4] rounded-[8px] border border-[#009142]">
                <ReceiptIcon />
                <span className="font-cera-pro font-medium text-[14px] text-[#009142]">
                  NF Gerada
                </span>
              </div>
            ) : (
              <button
                onClick={handleGerarNota}
                disabled={generatingNota}
                className={`flex items-center gap-2 px-4 py-2 rounded-[8px] transition-colors ${
                  pedido.notaFiscalErro
                    ? "bg-red-50 hover:bg-red-100 border border-[#B3261E]"
                    : "bg-[#254333] hover:bg-[#1a3226]"
                }`}
              >
                {generatingNota ? (
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                ) : (
                  <ReceiptIcon />
                )}
                <span className={`font-cera-pro font-medium text-[14px] ${
                  pedido.notaFiscalErro ? "text-[#B3261E]" : "text-white"
                }`}>
                  {pedido.notaFiscalErro ? "Erro - Tentar" : "Gerar NF"}
                </span>
              </button>
            )}
          </div>

          {/* Dados do Cliente */}
          {showContato && (
            <div className="p-4 lg:p-6 border-t border-[#d2d2d2] bg-[#f8f3ed]">
              <h4 className="font-cera-pro font-bold text-[16px] text-black mb-4 flex items-center gap-2">
                <UserIcon />
                Informações do Cliente
              </h4>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Contato */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <MailIcon />
                    <span className="font-cera-pro font-light text-[14px] text-[#333333]">
                      {pedido.email}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <PhoneIcon />
                    <span className="font-cera-pro font-light text-[14px] text-[#333333]">
                      {pedido.telefone}
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-cera-pro font-light text-[14px] text-[#333333]">
                      <strong>CPF:</strong> {pedido.cpf}
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-cera-pro font-light text-[14px] text-[#333333]">
                      <strong>Nascimento:</strong>{" "}
                      {new Date(pedido.data_nascimento).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                  <div className="mt-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-[4px] font-cera-pro font-light text-[12px] ${
                      pedido.aceito_receber_whatsapp
                        ? "bg-[#F0F9F4] text-[#009142] border border-[#009142]"
                        : "bg-gray-100 text-[#666666] border border-[#d2d2d2]"
                    }`}>
                      WhatsApp: {pedido.aceito_receber_whatsapp ? "Aceita" : "Não aceita"}
                    </span>
                  </div>
                </div>

                {/* Endereço */}
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <MapPinIcon />
                    <div>
                      <p className="font-cera-pro font-medium text-[14px] text-black">
                        Endereço de Entrega
                      </p>
                      <p className="font-cera-pro font-light text-[14px] text-[#333333]">
                        {pedido.endereco}, {pedido.numero}
                        {pedido.complemento && `, ${pedido.complemento}`}
                      </p>
                      <p className="font-cera-pro font-light text-[14px] text-[#333333]">
                        {pedido.bairro} - {pedido.cidade}/{pedido.estado}
                      </p>
                      <p className="font-cera-pro font-light text-[14px] text-[#333333]">
                        CEP: {pedido.cep}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 p-3 bg-white rounded-[8px]">
                    <p className="font-cera-pro font-medium text-[14px] text-[#254333]">
                      Frete: {pedido.frete_calculado.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </p>
                    {pedido.transportadora_nome && (
                      <p className="font-cera-pro font-light text-[12px] text-[#666666] mt-1">
                        {pedido.transportadora_nome} - {pedido.transportadora_servico}
                        {pedido.transportadora_prazo && (
                          <> ({pedido.transportadora_prazo} {pedido.transportadora_prazo === 1 ? 'dia útil' : 'dias úteis'})</>
                        )}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Pagamentos */}
          {showPagamentos && (
            <div className="p-4 lg:p-6 border-t border-[#d2d2d2] bg-[#f8f3ed]">
              <h4 className="font-cera-pro font-bold text-[16px] text-black mb-4 flex items-center gap-2">
                <CreditCardIcon />
                Métodos de Pagamento
              </h4>

              {pedido.pagamentos?.length ? (
                <div className="space-y-3">
                  {pedido.pagamentos.map((pagamento, pIdx) => {
                    const charge = pagamento?.info?.charges?.[0];
                    const status = charge?.status || pagamento.status;

                    return (
                      <div
                        key={pIdx}
                        className="bg-white rounded-[8px] p-4"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-cera-pro font-medium text-[14px] text-black">
                            Pagamento #{pIdx + 1}
                          </span>
                          <StatusBadge status={status} />
                        </div>

                        {charge && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-cera-pro font-light text-[12px] text-[#666666]">
                                ID: {charge.id?.slice(-12)}
                              </span>
                              <span className="font-cera-pro font-bold text-[16px] text-[#009142]">
                                {(charge.amount.value / 100).toLocaleString("pt-BR", {
                                  style: "currency",
                                  currency: charge.amount.currency,
                                })}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-[12px]">
                              <span className="font-cera-pro font-light text-[#333333]">
                                <strong>Método:</strong> {charge.payment_method?.type ?? "N/A"}
                              </span>
                              <span className="font-cera-pro font-light text-[#333333]">
                                <strong>Parcelas:</strong> {charge.payment_method?.installments ?? "N/A"}
                              </span>
                            </div>

                            {charge.payment_method?.pix && (
                              <div className="mt-3 pt-3 border-t border-[#d2d2d2]">
                                <p className="font-cera-pro font-medium text-[12px] text-[#254333] mb-2">
                                  Dados PIX
                                </p>
                                <p className="font-cera-pro font-light text-[12px] text-[#333333]">
                                  End to End: {charge.payment_method.pix.end_to_end_id || "N/A"}
                                </p>
                                {charge.payment_method.pix.holder && (
                                  <p className="font-cera-pro font-light text-[12px] text-[#333333]">
                                    Titular: {charge.payment_method.pix.holder.name} ({charge.payment_method.pix.holder.tax_id})
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="font-cera-pro font-light text-[14px] text-[#666666]">
                    Nenhum método de pagamento registrado
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Status de Entrega */}
          {showStatusEntrega && (
            <div className="p-4 lg:p-6 border-t border-[#d2d2d2] bg-[#f8f3ed]">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Alterar Status */}
                <div>
                  <h4 className="font-cera-pro font-bold text-[16px] text-black mb-4 flex items-center gap-2">
                    <TruckIcon />
                    Alterar Status de Entrega
                  </h4>
                  <StatusEntregaManager
                    pedidoId={pedido.id}
                    statusAtual={pedido.status_entrega || "AGUARDANDO_PAGAMENTO"}
                    onStatusChange={() => {
                      setHistoricoRefreshKey((k) => k + 1);
                      onStatusChange();
                    }}
                  />
                </div>

                {/* Histórico */}
                <div>
                  <h4 className="font-cera-pro font-bold text-[16px] text-black mb-4 flex items-center gap-2">
                    <ClockIcon />
                    Histórico de Alterações
                  </h4>
                  <HistoricoStatusEntrega pedidoId={pedido.id} refreshKey={historicoRefreshKey} />
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function PedidosPage() {
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
      // Buscar todos os pedidos sem paginação
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
        "Endereço",
        "Número",
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
            const charge = pedido.pagamentos[0]?.info?.charges?.[0];
            return charge?.status || pedido.pagamentos[0].status || "N/A";
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
          <svg
            className="animate-spin h-10 w-10 text-[#254333]"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
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
          <h1 className="font-cera-pro font-bold text-[24px] lg:text-[32px] text-white leading-normal">
            Painel de Pedidos
          </h1>
          <p className="font-cera-pro font-light text-[14px] lg:text-[16px] text-white/80 mt-1">
            Gerencie e visualize todos os pedidos da loja
          </p>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-6">
        {/* Barra de Ações */}
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

            {/* Ações */}
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/pedidos/novo"
                className="flex items-center gap-2 px-4 py-2 bg-[#254333] hover:bg-[#1a3226] rounded-[8px] transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
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
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#254333" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
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

        {/* Paginação */}
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
                Página {page}
              </span>
            </div>

            <button
              onClick={() => setPage((prev) => prev + 1)}
              disabled={pedidos.length < pageSize}
              className="px-4 py-2 bg-[#D8F9E7] hover:bg-[#c5f0d9] disabled:bg-[#d2d2d2] disabled:cursor-not-allowed rounded-[8px] transition-colors"
            >
              <span className="font-cera-pro font-medium text-[14px] text-[#254333]">
                Próxima
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
