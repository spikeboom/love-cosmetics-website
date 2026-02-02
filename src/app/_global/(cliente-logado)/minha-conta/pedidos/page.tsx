"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaChevronDown, FaChevronUp, FaShoppingBag, FaMapMarkerAlt, FaCreditCard } from 'react-icons/fa';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface PedidoItem {
  name: string;
  quantity: number;
  unit_amount: number;
  reference_id: string;
  image_url?: string;
}

interface Endereco {
  cep: string;
  endereco: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
}

interface Pedido {
  id: string;
  total: number;
  frete: number;
  status: string;
  statusColor: string;
  items: PedidoItem[];
  cupons: string[];
  createdAt: string;
  endereco: Endereco;
  pagamentos: any[];
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

interface PedidosResponse {
  pedidos: Pedido[];
  pagination: PaginationInfo;
}

export default function PedidosPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedPedidos, setExpandedPedidos] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/conta/entrar');
      return;
    }

    if (isAuthenticated) {
      fetchPedidos(currentPage);
    }
  }, [isAuthenticated, authLoading, currentPage, router]);

  const fetchPedidos = async (page: number) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/cliente/conta/pedidos?page=${page}&limit=10`, {
        credentials: 'include'
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/conta/entrar');
          return;
        }
        throw new Error('Erro ao carregar pedidos');
      }

      const data: PedidosResponse = await response.json();
      setPedidos(data.pedidos);
      setPagination(data.pagination);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar pedidos');
    } finally {
      setLoading(false);
    }
  };

  const togglePedidoExpansion = (pedidoId: string) => {
    const newExpanded = new Set(expandedPedidos);
    if (newExpanded.has(pedidoId)) {
      newExpanded.delete(pedidoId);
    } else {
      newExpanded.add(pedidoId);
    }
    setExpandedPedidos(newExpanded);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadgeColor = (color: string) => {
    const colors = {
      green: 'bg-green-100 text-green-800',
      blue: 'bg-blue-100 text-blue-800',
      orange: 'bg-orange-100 text-orange-800',
      red: 'bg-red-100 text-red-800'
    };
    return colors[color as keyof typeof colors] || colors.orange;
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#dcafad]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => fetchPedidos(currentPage)}
            className="bg-[#dcafad] text-white px-4 py-2 rounded hover:bg-[#c19b98]"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center">
              <Link href="/minha-conta" className="text-[#dcafad] hover:text-[#c19b98] mr-2">
                ← Voltar
              </Link>
              <h1 className="text-3xl font-bold text-gray-900 ml-2">
                Meus Pedidos
              </h1>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Acompanhe seus pedidos e histórico de compras
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {pedidos.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <FaShoppingBag className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum pedido encontrado
            </h3>
            <p className="text-gray-500 mb-6">
              Você ainda não fez nenhum pedido. Que tal começar a explorar nossos produtos?
            </p>
            <Link
              href="/"
              className="bg-[#dcafad] text-white px-6 py-2 rounded-md hover:bg-[#c19b98] transition-colors"
            >
              Começar a comprar
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-6">
              {pedidos.map((pedido) => {
                const isExpanded = expandedPedidos.has(pedido.id);
                
                return (
                  <div key={pedido.id} className="bg-white rounded-lg shadow">
                    {/* Cabeçalho do pedido */}
                    <div className="p-6 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div>
                            <h3 className="text-lg font-medium text-gray-900">
                              Pedido #{pedido.id.slice(0, 8)}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {formatDate(pedido.createdAt)}
                            </p>
                          </div>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(pedido.statusColor)}`}>
                            {pedido.status}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <p className="text-lg font-semibold text-gray-900">
                              {formatPrice(pedido.total)}
                            </p>
                            <p className="text-sm text-gray-500">
                              Frete: {formatPrice(pedido.frete)}
                            </p>
                            <p className="text-sm text-gray-500">
                              {pedido.items.length} {pedido.items.length === 1 ? 'item' : 'itens'}
                            </p>
                          </div>
                          <button
                            onClick={() => togglePedidoExpansion(pedido.id)}
                            className="p-2 text-gray-400 hover:text-gray-600"
                          >
                            {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Detalhes expandidos */}
                    {isExpanded && (
                      <div className="p-6 space-y-6">
                        {/* Items do pedido */}
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                            <FaShoppingBag className="mr-2" />
                            Itens do Pedido
                          </h4>
                          <div className="space-y-3">
                            {pedido.items.map((item, index) => (
                              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center space-x-3">
                                  {item.image_url && (
                                    <img
                                      src={item.image_url}
                                      alt={item.name}
                                      className="w-12 h-12 object-cover rounded"
                                    />
                                  )}
                                  <div>
                                    <p className="font-medium text-gray-900">{item.name}</p>
                                    <p className="text-sm text-gray-500">Qtd: {item.quantity}</p>
                                  </div>
                                </div>
                                <p className="font-medium text-gray-900">
                                  {formatPrice(item.unit_amount / 100)}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Cupons aplicados */}
                        {pedido.cupons.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 mb-3">
                              Cupons Aplicados
                            </h4>
                            <div className="space-y-2">
                              {pedido.cupons.map((cupom, index) => (
                                <span key={index} className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                                  {cupom}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Endereço de entrega */}
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                            <FaMapMarkerAlt className="mr-2" />
                            Endereço de Entrega
                          </h4>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <address className="text-sm text-gray-600 not-italic">
                              {pedido.endereco.endereco}, {pedido.endereco.numero}
                              {pedido.endereco.complemento && `, ${pedido.endereco.complemento}`}
                              <br />
                              {pedido.endereco.bairro}
                              <br />
                              {pedido.endereco.cidade} - {pedido.endereco.estado}
                              <br />
                              CEP: {pedido.endereco.cep}
                            </address>
                            <div className="mt-2 pt-2 border-t border-gray-200">
                              <p className="text-sm font-medium text-gray-900">
                                Valor do Frete: <span className="text-green-600">{formatPrice(pedido.frete)}</span>
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Informações de pagamento */}
                        {pedido.pagamentos.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                              <FaCreditCard className="mr-2" />
                              Informações de Pagamento
                            </h4>
                            <div className="space-y-2">
                              {pedido.pagamentos.map((pagamento, index) => {
                                const charge = pagamento?.info?.charges?.[0];
                                return (
                                  <div key={index} className="bg-gray-50 p-3 rounded-lg">
                                    <p className="text-sm">
                                      <span className="font-medium">Método:</span> {charge?.payment_method?.type || 'N/A'}
                                    </p>
                                    {charge?.payment_method?.installments && (
                                      <p className="text-sm">
                                        <span className="font-medium">Parcelas:</span> {charge.payment_method.installments}x
                                      </p>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Paginação */}
            {pagination && pagination.totalPages > 1 && (
              <div className="mt-8 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Mostrando página {pagination.currentPage} de {pagination.totalPages} 
                  ({pagination.totalItems} pedidos no total)
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={!pagination.hasPrevious}
                    className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Anterior
                  </button>
                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={!pagination.hasNext}
                    className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Próxima
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}