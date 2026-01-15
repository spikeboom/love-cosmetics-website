"use client";

import { useState } from "react";
import { useSnackbar } from "notistack";
import { Pedido } from "./types";
import { StatusBadge } from "./StatusBadge";
import {
  StatusEntregaBadge,
  StatusEntregaManager,
  HistoricoStatusEntrega,
} from "./StatusEntregaManager";
import {
  ChevronDownIcon,
  UserIcon,
  MailIcon,
  PhoneIcon,
  MapPinIcon,
  CreditCardIcon,
  PackageIcon,
  ReceiptIcon,
  TruckIcon,
  ClockIcon,
  SpinnerIcon,
} from "./Icons";

interface PedidoCardProps {
  pedido: Pedido;
  onNotaGerada: () => void;
  onStatusChange: () => void;
}

export function PedidoCard({ pedido, onNotaGerada, onStatusChange }: PedidoCardProps) {
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
    const info = pedido.pagamentos[0]?.info;
    const charge = info?.charges?.[0];
    return charge?.status || info?.status || pedido.pagamentos[0].status;
  };

  const mainStatus = getMainPaymentStatus();

  return (
    <>
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
                <span className="text-[#d2d2d2]">*</span>
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

        {/* Conteudo Expandido */}
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

            {/* Acoes */}
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

              {/* Botao Nota Fiscal */}
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
                    <SpinnerIcon className="text-white" />
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
                  Informacoes do Cliente
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
                        WhatsApp: {pedido.aceito_receber_whatsapp ? "Aceita" : "Nao aceita"}
                      </span>
                    </div>
                  </div>

                  {/* Endereco */}
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <MapPinIcon />
                      <div>
                        <p className="font-cera-pro font-medium text-[14px] text-black">
                          Endereco de Entrega
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
                            <> ({pedido.transportadora_prazo} {pedido.transportadora_prazo === 1 ? 'dia util' : 'dias uteis'})</>
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
                  Metodos de Pagamento
                </h4>

                {pedido.pagamentos?.length ? (
                  <div className="space-y-3">
                    {pedido.pagamentos.map((pagamento, pIdx) => {
                      const info = pagamento?.info;
                      const charge = info?.charges?.[0];
                      const paymentData = charge || info;
                      const status = paymentData?.status || pagamento.status;

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

                          {paymentData && (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="font-cera-pro font-light text-[12px] text-[#666666]">
                                  ID: {paymentData.id?.slice(-12)}
                                </span>
                                {paymentData.amount && (
                                  <span className="font-cera-pro font-bold text-[16px] text-[#009142]">
                                    {(paymentData.amount.value / 100).toLocaleString("pt-BR", {
                                      style: "currency",
                                      currency: paymentData.amount.currency,
                                    })}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-4 text-[12px]">
                                <span className="font-cera-pro font-light text-[#333333]">
                                  <strong>Metodo:</strong> {paymentData.payment_method?.type ?? "N/A"}
                                </span>
                                <span className="font-cera-pro font-light text-[#333333]">
                                  <strong>Parcelas:</strong> {paymentData.payment_method?.installments ?? "N/A"}
                                </span>
                              </div>

                              {/* Dados do Cartao */}
                              {paymentData.payment_method?.card && (
                                <div className="mt-3 pt-3 border-t border-[#d2d2d2]">
                                  <p className="font-cera-pro font-medium text-[12px] text-[#254333] mb-2">
                                    Dados do Cartao
                                  </p>
                                  <p className="font-cera-pro font-light text-[12px] text-[#333333]">
                                    Bandeira: {paymentData.payment_method.card.brand?.toUpperCase() || "N/A"}
                                  </p>
                                  <p className="font-cera-pro font-light text-[12px] text-[#333333]">
                                    Final: **** {paymentData.payment_method.card.last_digits || "N/A"}
                                  </p>
                                  {paymentData.payment_method.card.holder?.name && (
                                    <p className="font-cera-pro font-light text-[12px] text-[#333333]">
                                      Titular: {paymentData.payment_method.card.holder.name}
                                    </p>
                                  )}
                                </div>
                              )}

                              {/* Dados PIX */}
                              {paymentData.payment_method?.pix && (
                                <div className="mt-3 pt-3 border-t border-[#d2d2d2]">
                                  <p className="font-cera-pro font-medium text-[12px] text-[#254333] mb-2">
                                    Dados PIX
                                  </p>
                                  <p className="font-cera-pro font-light text-[12px] text-[#333333]">
                                    End to End: {paymentData.payment_method.pix.end_to_end_id || "N/A"}
                                  </p>
                                  {paymentData.payment_method.pix.holder && (
                                    <p className="font-cera-pro font-light text-[12px] text-[#333333]">
                                      Titular: {paymentData.payment_method.pix.holder.name} ({paymentData.payment_method.pix.holder.tax_id})
                                    </p>
                                  )}
                                </div>
                              )}

                              {/* Data de pagamento */}
                              {paymentData.paid_at && (
                                <div className="mt-2">
                                  <span className="font-cera-pro font-light text-[12px] text-[#666666]">
                                    Pago em: {new Date(paymentData.paid_at).toLocaleString("pt-BR")}
                                  </span>
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
                      Nenhum metodo de pagamento registrado
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

                  {/* Historico */}
                  <div>
                    <h4 className="font-cera-pro font-bold text-[16px] text-black mb-4 flex items-center gap-2">
                      <ClockIcon />
                      Historico de Alteracoes
                    </h4>
                    <HistoricoStatusEntrega pedidoId={pedido.id} refreshKey={historicoRefreshKey} />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
