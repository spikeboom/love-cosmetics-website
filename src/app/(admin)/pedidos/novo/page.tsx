"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { colors, typography, components, spacing, shadows, borderRadius } from "@/styles/design-system/tokens";
import { calculateFreightFrenet, type FrenetCalculationSuccess } from "@/app/actions/freight-actions";

// Tipos
interface Produto {
  id: number;
  documentId: string;
  nome: string;
  preco: number;
  preco_de?: number;
  imagem?: string;
  bling_number?: string;
}

interface ItemCarrinho extends Produto {
  quantity: number;
}

interface DadosCliente {
  nome: string;
  sobrenome: string;
  email: string;
  cpf: string;
  telefone: string;
  data_nascimento: string;
  cep: string;
  endereco: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
}

// Máscaras
function maskCPF(value: string): string {
  return value
    .replace(/\D/g, "")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})/, "$1-$2")
    .replace(/(-\d{2})\d+?$/, "$1");
}

function maskPhone(value: string): string {
  return value
    .replace(/\D/g, "")
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2")
    .replace(/(-\d{4})\d+?$/, "$1");
}

function maskCEP(value: string): string {
  return value
    .replace(/\D/g, "")
    .replace(/(\d{5})(\d)/, "$1-$2")
    .replace(/(-\d{3})\d+?$/, "$1");
}

function maskDate(value: string): string {
  return value
    .replace(/\D/g, "")
    .replace(/(\d{2})(\d)/, "$1/$2")
    .replace(/(\d{2})(\d)/, "$1/$2")
    .replace(/(\/\d{4})\d+?$/, "$1");
}

function formatPrice(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export default function NovoPedidoPage() {
  const router = useRouter();

  // Estados
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ message: string; link?: string; pedidoId?: string } | null>(null);

  // Produtos
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [buscaProduto, setBuscaProduto] = useState("");
  const [produtosFiltrados, setProdutosFiltrados] = useState<Produto[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [carrinho, setCarrinho] = useState<ItemCarrinho[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Frete
  const [tipoFrete, setTipoFrete] = useState<"frenet" | "manual" | "gratis">("manual");
  const [freteValor, setFreteValor] = useState<number>(0);
  const [freteTransportadora, setFreteTransportadora] = useState("");
  const [fretePrazo, setFretePrazo] = useState<number | null>(null);

  // Frenet
  const [freteCep, setFreteCep] = useState("");
  const [calculandoFrete, setCalculandoFrete] = useState(false);
  const [opcoesFrenet, setOpcoesFrenet] = useState<FrenetCalculationSuccess["services"]>([]);
  const [frenetError, setFrenetError] = useState<string | null>(null);
  const [servicoSelecionado, setServicoSelecionado] = useState<string | null>(null);

  // Desconto
  const [tipoDesconto, setTipoDesconto] = useState<"nenhum" | "cupom" | "manual">("nenhum");
  const [cupomCodigo, setCupomCodigo] = useState("");
  const [descontoValor, setDescontoValor] = useState<number>(0);
  const [descontoPorcentagem, setDescontoPorcentagem] = useState<number>(0);

  // Cortesia
  const [cortesia, setCortesia] = useState(false);

  // Cliente
  const [cliente, setCliente] = useState<DadosCliente>({
    nome: "",
    sobrenome: "",
    email: "",
    cpf: "",
    telefone: "",
    data_nascimento: "",
    cep: "",
    endereco: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    estado: "",
  });

  // Buscar produtos ao montar
  useEffect(() => {
    async function fetchProdutos() {
      try {
        setLoading(true);
        const res = await fetch("/api/produtos/busca");
        const data = await res.json();
        if (data.success) {
          setProdutos(data.produtos);
        }
      } catch (err) {
        console.error("Erro ao buscar produtos:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProdutos();
  }, []);

  // Filtrar produtos
  useEffect(() => {
    if (buscaProduto.trim()) {
      const filtrados = produtos.filter((p) =>
        p.nome.toLowerCase().includes(buscaProduto.toLowerCase())
      );
      setProdutosFiltrados(filtrados);
    } else {
      setProdutosFiltrados(produtos);
    }
  }, [buscaProduto, produtos]);

  // Fechar dropdown ao clicar fora ou pressionar Esc
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [showDropdown]);

  // Adicionar produto ao carrinho
  const adicionarProduto = useCallback((produto: Produto) => {
    setCarrinho((prev) => {
      const existente = prev.find((p) => p.id === produto.id);
      if (existente) {
        return prev.map((p) =>
          p.id === produto.id ? { ...p, quantity: p.quantity + 1 } : p
        );
      }
      return [...prev, { ...produto, quantity: 1 }];
    });
    setBuscaProduto("");
    setShowDropdown(false);
  }, []);

  // Remover produto
  const removerProduto = useCallback((id: number) => {
    setCarrinho((prev) => prev.filter((p) => p.id !== id));
  }, []);

  // Atualizar quantidade
  const atualizarQuantidade = useCallback((id: number, delta: number) => {
    setCarrinho((prev) =>
      prev
        .map((p) =>
          p.id === id ? { ...p, quantity: Math.max(1, p.quantity + delta) } : p
        )
    );
  }, []);

  // Cálculos
  const subtotal = carrinho.reduce((acc, item) => acc + item.preco * item.quantity, 0);

  let descontoTotal = 0;
  if (tipoDesconto === "manual") {
    if (descontoPorcentagem > 0) {
      descontoTotal = subtotal * (descontoPorcentagem / 100);
    } else {
      descontoTotal = descontoValor;
    }
  } else if (tipoDesconto === "cupom") {
    descontoTotal = descontoValor;
  }

  const total = cortesia ? 0 : Math.max(0, subtotal - descontoTotal + freteValor);

  // Buscar CEP
  const buscarCEP = async () => {
    const cepLimpo = cliente.cep.replace(/\D/g, "");
    if (cepLimpo.length !== 8) return;

    try {
      const res = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setCliente((prev) => ({
          ...prev,
          endereco: data.logradouro || "",
          bairro: data.bairro || "",
          cidade: data.localidade || "",
          estado: data.uf || "",
        }));
      }
    } catch (err) {
      console.error("Erro ao buscar CEP:", err);
    }
  };

  // Calcular frete via Frenet
  const calcularFreteFrenet = async () => {
    const cepLimpo = freteCep.replace(/\D/g, "");
    if (cepLimpo.length !== 8) {
      setFrenetError("CEP inválido");
      return;
    }

    if (carrinho.length === 0) {
      setFrenetError("Adicione produtos ao carrinho primeiro");
      return;
    }

    setCalculandoFrete(true);
    setFrenetError(null);
    setOpcoesFrenet([]);
    setServicoSelecionado(null);

    try {
      const itemsParaFrete = carrinho.map((item) => ({
        quantity: item.quantity,
        preco: item.preco,
        peso_gramas: 200, // padrão
        altura: 10,
        largura: 10,
        comprimento: 10,
      }));

      const resultado = await calculateFreightFrenet(cepLimpo, itemsParaFrete);

      if (resultado.success) {
        setOpcoesFrenet(resultado.services);
        // Auto-selecionar o mais barato
        if (resultado.cheapest) {
          setServicoSelecionado(`${resultado.cheapest.carrier}-${resultado.cheapest.service}`);
          setFreteValor(resultado.cheapest.price);
          setFreteTransportadora(`${resultado.cheapest.carrier} - ${resultado.cheapest.service}`);
          setFretePrazo(resultado.cheapest.deliveryTime);
        }
      } else {
        setFrenetError(resultado.error);
      }
    } catch (err) {
      console.error("Erro ao calcular frete:", err);
      setFrenetError("Erro ao calcular frete. Tente novamente.");
    } finally {
      setCalculandoFrete(false);
    }
  };

  // Selecionar opção de frete
  const selecionarOpcaoFrete = (opcao: FrenetCalculationSuccess["services"][0]) => {
    const key = opcao.serviceCode || `${opcao.carrier}-${opcao.service}`;
    setServicoSelecionado(key);
    setFreteValor(opcao.price);
    setFreteTransportadora(`${opcao.carrier} - ${opcao.service}`);
    setFretePrazo(opcao.deliveryTime);
  };

  // Submeter pedido
  const handleSubmit = async () => {
    setError(null);
    setSuccess(null);

    // Validações
    if (carrinho.length === 0) {
      setError("Adicione pelo menos um produto");
      return;
    }

    if (!cliente.nome || !cliente.sobrenome || !cliente.email || !cliente.cpf || !cliente.telefone) {
      setError("Preencha todos os dados obrigatórios do cliente");
      return;
    }

    if (!cliente.cep || !cliente.endereco || !cliente.numero || !cliente.bairro || !cliente.cidade || !cliente.estado) {
      setError("Preencha o endereço completo");
      return;
    }

    // Converter data de nascimento
    const [dia, mes, ano] = cliente.data_nascimento.split("/");
    const dataNascimento = `${ano}-${mes}-${dia}`;

    setSubmitting(true);

    try {
      const res = await fetch("/api/pedido/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cliente: {
            ...cliente,
            data_nascimento: dataNascimento,
          },
          items: carrinho.map((item) => ({
            id: String(item.id),
            documentId: item.documentId,
            nome: item.nome,
            preco: item.preco,
            quantity: item.quantity,
            bling_number: item.bling_number,
            imagem: item.imagem,
          })),
          frete: {
            valor: freteValor,
            transportadora_nome: freteTransportadora || null,
            transportadora_prazo: fretePrazo,
          },
          desconto: {
            tipo: tipoDesconto,
            cupom_codigo: tipoDesconto === "cupom" ? cupomCodigo : undefined,
            valor: tipoDesconto === "manual" && descontoPorcentagem === 0 ? descontoValor : undefined,
            porcentagem: tipoDesconto === "manual" && descontoPorcentagem > 0 ? descontoPorcentagem : undefined,
          },
          cortesia,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erro ao criar pedido");
        return;
      }

      setSuccess({
        message: data.message,
        link: data.link,
        pedidoId: data.pedidoId,
      });

    } catch (err) {
      console.error("Erro ao criar pedido:", err);
      setError("Erro de conexão ao criar pedido");
    } finally {
      setSubmitting(false);
    }
  };

  // Copiar link
  const copiarLink = () => {
    if (success?.link) {
      navigator.clipboard.writeText(success.link);
      alert("Link copiado!");
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f3ed]">
      {/* Header */}
      <header className="bg-[#254333] text-white px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="font-cera-pro font-bold text-[24px]">Novo Pedido</h1>
            <p className="font-cera-pro font-light text-[14px] opacity-80">
              Registrar pedido manual para cliente
            </p>
          </div>
          <Link
            href="/pedidos"
            className="font-cera-pro font-medium text-[14px] bg-white/20 hover:bg-white/30 px-4 py-2 rounded-[8px] transition-colors"
          >
            Voltar para Pedidos
          </Link>
        </div>
      </header>

      {/* Conteúdo */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Sucesso */}
        {success && (
          <div className="mb-6 p-6 bg-[#F0F9F4] border border-[#009142] rounded-[16px]">
            <h2 className="font-cera-pro font-bold text-[20px] text-[#009142] mb-2">
              {success.message}
            </h2>
            {success.link && (
              <div className="mt-4">
                <p className="font-cera-pro font-light text-[14px] text-[#333] mb-2">
                  Link de pagamento:
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={success.link}
                    readOnly
                    className="flex-1 bg-white border border-[#d2d2d2] rounded-[8px] p-2 font-cera-pro text-[14px]"
                  />
                  <button
                    onClick={copiarLink}
                    className="bg-[#254333] hover:bg-[#1a3226] text-white font-cera-pro font-medium px-4 py-2 rounded-[8px] transition-colors"
                  >
                    Copiar
                  </button>
                </div>
              </div>
            )}
            <div className="mt-4 flex gap-4">
              <button
                onClick={() => {
                  setSuccess(null);
                  setCarrinho([]);
                  setCliente({
                    nome: "",
                    sobrenome: "",
                    email: "",
                    cpf: "",
                    telefone: "",
                    data_nascimento: "",
                    cep: "",
                    endereco: "",
                    numero: "",
                    complemento: "",
                    bairro: "",
                    cidade: "",
                    estado: "",
                  });
                  setCortesia(false);
                  setTipoDesconto("nenhum");
                  setFreteValor(0);
                }}
                className="bg-[#D8F9E7] hover:bg-[#c5f0d9] text-[#254333] font-cera-pro font-medium px-4 py-2 rounded-[8px] transition-colors"
              >
                Criar Novo Pedido
              </button>
              <Link
                href="/pedidos"
                className="bg-[#254333] hover:bg-[#1a3226] text-white font-cera-pro font-medium px-4 py-2 rounded-[8px] transition-colors"
              >
                Ver Pedidos
              </Link>
            </div>
          </div>
        )}

        {/* Erro */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-[#B3261E] rounded-[8px]">
            <p className="font-cera-pro font-medium text-[#B3261E]">{error}</p>
          </div>
        )}

        {!success && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Coluna Principal */}
            <div className="lg:col-span-2 space-y-6">
              {/* Toggle Cortesia */}
              <div className="bg-white rounded-[16px] p-6 shadow-[0px_1px_2px_0px_rgba(0,0,0,0.3),0px_1px_3px_1px_rgba(0,0,0,0.15)]">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={cortesia}
                    onChange={(e) => setCortesia(e.target.checked)}
                    className="w-5 h-5 accent-[#254333]"
                  />
                  <span className="font-cera-pro font-bold text-[18px] text-[#254333]">
                    Pedido Cortesia (sem custo)
                  </span>
                </label>
                {cortesia && (
                  <p className="mt-2 font-cera-pro font-light text-[14px] text-[#666]">
                    O pedido será criado com valor R$ 0,00 e não gerará link de pagamento.
                  </p>
                )}
              </div>

              {/* Produtos */}
              <div className="bg-white rounded-[16px] p-6 shadow-[0px_1px_2px_0px_rgba(0,0,0,0.3),0px_1px_3px_1px_rgba(0,0,0,0.15)]">
                <h2 className="font-cera-pro font-bold text-[18px] text-black mb-4">
                  Produtos
                </h2>

                {/* Busca com Dropdown */}
                <div ref={dropdownRef} className="relative mb-4">
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        placeholder="Digite para buscar ou clique para ver todos..."
                        value={buscaProduto}
                        onChange={(e) => {
                          setBuscaProduto(e.target.value);
                          setShowDropdown(true);
                        }}
                        onFocus={() => setShowDropdown(true)}
                        className="w-full bg-white border border-[#d2d2d2] rounded-[8px] p-3 pr-10 font-cera-pro text-[14px] focus:outline-none focus:border-[#254333]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowDropdown(!showDropdown)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666] hover:text-[#254333]"
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d={showDropdown ? "M18 15l-6-6-6 6" : "M6 9l6 6 6-6"} />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Dropdown de Produtos */}
                  {showDropdown && (
                    <div className="absolute z-20 w-full mt-1 bg-white border border-[#d2d2d2] rounded-[8px] shadow-lg max-h-[400px] overflow-y-auto">
                      {loading ? (
                        <div className="p-4 text-center">
                          <p className="font-cera-pro font-light text-[14px] text-[#666]">Carregando produtos...</p>
                        </div>
                      ) : produtosFiltrados.length === 0 ? (
                        <div className="p-4 text-center">
                          <p className="font-cera-pro font-light text-[14px] text-[#666]">Nenhum produto encontrado</p>
                        </div>
                      ) : (
                        <>
                          <div className="p-2 border-b border-[#d2d2d2] bg-[#f8f3ed]">
                            <p className="font-cera-pro font-light text-[12px] text-[#666]">
                              {produtosFiltrados.length} produto(s) encontrado(s) - clique para adicionar
                            </p>
                          </div>
                          {produtosFiltrados.map((produto) => (
                            <button
                              key={produto.id}
                              onClick={() => adicionarProduto(produto)}
                              className="w-full flex items-center gap-3 p-3 hover:bg-[#D8F9E7] transition-colors text-left border-b border-[#f0f0f0] last:border-b-0"
                            >
                              <div className="w-[50px] h-[50px] bg-[#f8f3ed] rounded-[4px] flex items-center justify-center overflow-hidden flex-shrink-0">
                                {produto.imagem ? (
                                  <Image
                                    src={produto.imagem}
                                    alt={produto.nome}
                                    width={50}
                                    height={50}
                                    className="rounded-[4px] object-cover"
                                  />
                                ) : (
                                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="1.5">
                                    <rect x="3" y="3" width="18" height="18" rx="2" />
                                    <circle cx="8.5" cy="8.5" r="1.5" />
                                    <path d="M21 15l-5-5L5 21" />
                                  </svg>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-cera-pro font-medium text-[14px] text-black truncate">
                                  {produto.nome}
                                </p>
                                <p className="font-cera-pro font-bold text-[16px] text-[#009142]">
                                  {formatPrice(produto.preco)}
                                </p>
                              </div>
                              <div className="flex-shrink-0">
                                <span className="bg-[#254333] text-white font-cera-pro font-medium text-[12px] px-3 py-1 rounded-[4px]">
                                  + Adicionar
                                </span>
                              </div>
                            </button>
                          ))}
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Carrinho */}
                {carrinho.length === 0 ? (
                  <p className="font-cera-pro font-light text-[14px] text-[#666]">
                    Nenhum produto adicionado
                  </p>
                ) : (
                  <div className="space-y-3">
                    {carrinho.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 p-3 bg-[#f8f3ed] rounded-[8px]"
                      >
                        {item.imagem && (
                          <Image
                            src={item.imagem}
                            alt={item.nome}
                            width={50}
                            height={50}
                            className="rounded-[4px] object-cover"
                          />
                        )}
                        <div className="flex-1">
                          <p className="font-cera-pro font-medium text-[14px] text-black">
                            {item.nome}
                          </p>
                          <p className="font-cera-pro font-bold text-[14px] text-[#009142]">
                            {formatPrice(item.preco)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => atualizarQuantidade(item.id, -1)}
                            className="w-8 h-8 bg-white border border-[#d2d2d2] rounded-[4px] font-cera-pro font-bold"
                          >
                            -
                          </button>
                          <span className="font-cera-pro font-medium text-[14px] w-8 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => atualizarQuantidade(item.id, 1)}
                            className="w-8 h-8 bg-white border border-[#d2d2d2] rounded-[4px] font-cera-pro font-bold"
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => removerProduto(item.id)}
                          className="text-[#B3261E] font-cera-pro font-medium text-[14px] hover:underline"
                        >
                          Remover
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Frete */}
              <div className="bg-white rounded-[16px] p-6 shadow-[0px_1px_2px_0px_rgba(0,0,0,0.3),0px_1px_3px_1px_rgba(0,0,0,0.15)]">
                <h2 className="font-cera-pro font-bold text-[18px] text-black mb-4">
                  Frete
                </h2>

                <div className="flex flex-wrap gap-4 mb-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="tipoFrete"
                      checked={tipoFrete === "frenet"}
                      onChange={() => {
                        setTipoFrete("frenet");
                        setFreteValor(0);
                        setOpcoesFrenet([]);
                        setServicoSelecionado(null);
                      }}
                      className="accent-[#254333]"
                    />
                    <span className="font-cera-pro font-medium text-[14px]">Calcular (Frenet)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="tipoFrete"
                      checked={tipoFrete === "manual"}
                      onChange={() => setTipoFrete("manual")}
                      className="accent-[#254333]"
                    />
                    <span className="font-cera-pro font-medium text-[14px]">Valor manual</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="tipoFrete"
                      checked={tipoFrete === "gratis"}
                      onChange={() => {
                        setTipoFrete("gratis");
                        setFreteValor(0);
                        setFreteTransportadora("");
                        setFretePrazo(null);
                      }}
                      className="accent-[#254333]"
                    />
                    <span className="font-cera-pro font-medium text-[14px]">Frete Grátis</span>
                  </label>
                </div>

                {/* Calcular via Frenet */}
                {tipoFrete === "frenet" && (
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className="font-cera-pro font-light text-[12px] text-[#666] block mb-1">
                          CEP de Destino
                        </label>
                        <input
                          type="text"
                          value={freteCep}
                          onChange={(e) => setFreteCep(maskCEP(e.target.value))}
                          placeholder="00000-000"
                          className="w-full bg-white border border-[#d2d2d2] rounded-[8px] p-2 font-cera-pro text-[14px] focus:outline-none focus:border-[#254333]"
                        />
                      </div>
                      <div className="flex items-end">
                        <button
                          type="button"
                          onClick={calcularFreteFrenet}
                          disabled={calculandoFrete || carrinho.length === 0}
                          className={`
                            px-4 py-2 rounded-[8px] font-cera-pro font-medium text-[14px] transition-colors
                            ${calculandoFrete || carrinho.length === 0
                              ? "bg-[#999] text-white cursor-not-allowed"
                              : "bg-[#254333] hover:bg-[#1a3226] text-white"
                            }
                          `}
                        >
                          {calculandoFrete ? "Calculando..." : "Calcular"}
                        </button>
                      </div>
                    </div>

                    {/* Erro */}
                    {frenetError && (
                      <div className="p-3 bg-red-50 border border-[#B3261E] rounded-[8px]">
                        <p className="font-cera-pro font-light text-[14px] text-[#B3261E]">{frenetError}</p>
                      </div>
                    )}

                    {/* Opções de Frete */}
                    {opcoesFrenet.length > 0 && (
                      <div className="space-y-2">
                        <p className="font-cera-pro font-light text-[12px] text-[#666]">
                          Selecione uma opção de frete:
                        </p>
                        {opcoesFrenet.map((opcao) => {
                          const key = opcao.serviceCode || `${opcao.carrier}-${opcao.service}`;
                          const isSelected = servicoSelecionado === key;
                          return (
                            <button
                              key={key}
                              type="button"
                              onClick={() => selecionarOpcaoFrete(opcao)}
                              className={`
                                w-full p-3 rounded-[8px] border text-left transition-colors
                                ${isSelected
                                  ? "border-[#254333] bg-[#D8F9E7]"
                                  : "border-[#d2d2d2] bg-white hover:border-[#254333]"
                                }
                              `}
                            >
                              <div className="flex justify-between items-center">
                                <div>
                                  <p className="font-cera-pro font-medium text-[14px] text-black">
                                    {opcao.carrier} - {opcao.service}
                                  </p>
                                  <p className="font-cera-pro font-light text-[12px] text-[#666]">
                                    Prazo: {opcao.deliveryTime} dia(s) útil(eis)
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="font-cera-pro font-bold text-[16px] text-[#009142]">
                                    {formatPrice(opcao.price)}
                                  </p>
                                  {isSelected && (
                                    <span className="font-cera-pro font-light text-[12px] text-[#254333]">
                                      Selecionado
                                    </span>
                                  )}
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Resumo do frete selecionado */}
                    {servicoSelecionado && freteValor > 0 && (
                      <div className="p-3 bg-[#F0F9F4] border border-[#009142] rounded-[8px]">
                        <p className="font-cera-pro font-medium text-[14px] text-[#009142]">
                          Frete selecionado: {freteTransportadora} - {formatPrice(freteValor)}
                          {fretePrazo && ` (${fretePrazo} dias)`}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Valor manual */}
                {tipoFrete === "manual" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="font-cera-pro font-light text-[12px] text-[#666] block mb-1">
                        Valor do Frete (R$)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={freteValor}
                        onChange={(e) => setFreteValor(parseFloat(e.target.value) || 0)}
                        className="w-full bg-white border border-[#d2d2d2] rounded-[8px] p-2 font-cera-pro text-[14px] focus:outline-none focus:border-[#254333]"
                      />
                    </div>
                    <div>
                      <label className="font-cera-pro font-light text-[12px] text-[#666] block mb-1">
                        Transportadora (opcional)
                      </label>
                      <input
                        type="text"
                        value={freteTransportadora}
                        onChange={(e) => setFreteTransportadora(e.target.value)}
                        placeholder="Ex: Correios SEDEX"
                        className="w-full bg-white border border-[#d2d2d2] rounded-[8px] p-2 font-cera-pro text-[14px] focus:outline-none focus:border-[#254333]"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Desconto */}
              <div className="bg-white rounded-[16px] p-6 shadow-[0px_1px_2px_0px_rgba(0,0,0,0.3),0px_1px_3px_1px_rgba(0,0,0,0.15)]">
                <h2 className="font-cera-pro font-bold text-[18px] text-black mb-4">
                  Desconto
                </h2>

                <div className="flex gap-4 mb-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="tipoDesconto"
                      checked={tipoDesconto === "nenhum"}
                      onChange={() => {
                        setTipoDesconto("nenhum");
                        setDescontoValor(0);
                        setDescontoPorcentagem(0);
                      }}
                      className="accent-[#254333]"
                    />
                    <span className="font-cera-pro font-medium text-[14px]">Nenhum</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="tipoDesconto"
                      checked={tipoDesconto === "cupom"}
                      onChange={() => setTipoDesconto("cupom")}
                      className="accent-[#254333]"
                    />
                    <span className="font-cera-pro font-medium text-[14px]">Cupom</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="tipoDesconto"
                      checked={tipoDesconto === "manual"}
                      onChange={() => setTipoDesconto("manual")}
                      className="accent-[#254333]"
                    />
                    <span className="font-cera-pro font-medium text-[14px]">Manual</span>
                  </label>
                </div>

                {tipoDesconto === "cupom" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="font-cera-pro font-light text-[12px] text-[#666] block mb-1">
                        Código do Cupom
                      </label>
                      <input
                        type="text"
                        value={cupomCodigo}
                        onChange={(e) => setCupomCodigo(e.target.value.toUpperCase())}
                        placeholder="CUPOM10"
                        className="w-full bg-white border border-[#d2d2d2] rounded-[8px] p-2 font-cera-pro text-[14px] focus:outline-none focus:border-[#254333]"
                      />
                    </div>
                    <div>
                      <label className="font-cera-pro font-light text-[12px] text-[#666] block mb-1">
                        Valor do Desconto (R$)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={descontoValor}
                        onChange={(e) => setDescontoValor(parseFloat(e.target.value) || 0)}
                        className="w-full bg-white border border-[#d2d2d2] rounded-[8px] p-2 font-cera-pro text-[14px] focus:outline-none focus:border-[#254333]"
                      />
                    </div>
                  </div>
                )}

                {tipoDesconto === "manual" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="font-cera-pro font-light text-[12px] text-[#666] block mb-1">
                        Valor Fixo (R$)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={descontoValor}
                        onChange={(e) => {
                          setDescontoValor(parseFloat(e.target.value) || 0);
                          setDescontoPorcentagem(0);
                        }}
                        className="w-full bg-white border border-[#d2d2d2] rounded-[8px] p-2 font-cera-pro text-[14px] focus:outline-none focus:border-[#254333]"
                      />
                    </div>
                    <div>
                      <label className="font-cera-pro font-light text-[12px] text-[#666] block mb-1">
                        OU Porcentagem (%)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={descontoPorcentagem}
                        onChange={(e) => {
                          setDescontoPorcentagem(parseFloat(e.target.value) || 0);
                          setDescontoValor(0);
                        }}
                        className="w-full bg-white border border-[#d2d2d2] rounded-[8px] p-2 font-cera-pro text-[14px] focus:outline-none focus:border-[#254333]"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Dados do Cliente */}
              <div className="bg-white rounded-[16px] p-6 shadow-[0px_1px_2px_0px_rgba(0,0,0,0.3),0px_1px_3px_1px_rgba(0,0,0,0.15)]">
                <h2 className="font-cera-pro font-bold text-[18px] text-black mb-4">
                  Dados do Cliente
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="font-cera-pro font-light text-[12px] text-[#666] block mb-1">
                      Nome *
                    </label>
                    <input
                      type="text"
                      value={cliente.nome}
                      onChange={(e) => setCliente({ ...cliente, nome: e.target.value })}
                      className="w-full bg-white border border-[#d2d2d2] rounded-[8px] p-2 font-cera-pro text-[14px] focus:outline-none focus:border-[#254333]"
                    />
                  </div>
                  <div>
                    <label className="font-cera-pro font-light text-[12px] text-[#666] block mb-1">
                      Sobrenome *
                    </label>
                    <input
                      type="text"
                      value={cliente.sobrenome}
                      onChange={(e) => setCliente({ ...cliente, sobrenome: e.target.value })}
                      className="w-full bg-white border border-[#d2d2d2] rounded-[8px] p-2 font-cera-pro text-[14px] focus:outline-none focus:border-[#254333]"
                    />
                  </div>
                  <div>
                    <label className="font-cera-pro font-light text-[12px] text-[#666] block mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={cliente.email}
                      onChange={(e) => setCliente({ ...cliente, email: e.target.value })}
                      className="w-full bg-white border border-[#d2d2d2] rounded-[8px] p-2 font-cera-pro text-[14px] focus:outline-none focus:border-[#254333]"
                    />
                  </div>
                  <div>
                    <label className="font-cera-pro font-light text-[12px] text-[#666] block mb-1">
                      Telefone *
                    </label>
                    <input
                      type="text"
                      value={cliente.telefone}
                      onChange={(e) => setCliente({ ...cliente, telefone: maskPhone(e.target.value) })}
                      placeholder="(00) 00000-0000"
                      className="w-full bg-white border border-[#d2d2d2] rounded-[8px] p-2 font-cera-pro text-[14px] focus:outline-none focus:border-[#254333]"
                    />
                  </div>
                  <div>
                    <label className="font-cera-pro font-light text-[12px] text-[#666] block mb-1">
                      CPF *
                    </label>
                    <input
                      type="text"
                      value={cliente.cpf}
                      onChange={(e) => setCliente({ ...cliente, cpf: maskCPF(e.target.value) })}
                      placeholder="000.000.000-00"
                      className="w-full bg-white border border-[#d2d2d2] rounded-[8px] p-2 font-cera-pro text-[14px] focus:outline-none focus:border-[#254333]"
                    />
                  </div>
                  <div>
                    <label className="font-cera-pro font-light text-[12px] text-[#666] block mb-1">
                      Data de Nascimento *
                    </label>
                    <input
                      type="text"
                      value={cliente.data_nascimento}
                      onChange={(e) => setCliente({ ...cliente, data_nascimento: maskDate(e.target.value) })}
                      placeholder="DD/MM/AAAA"
                      className="w-full bg-white border border-[#d2d2d2] rounded-[8px] p-2 font-cera-pro text-[14px] focus:outline-none focus:border-[#254333]"
                    />
                  </div>
                </div>

                <h3 className="font-cera-pro font-bold text-[16px] text-black mt-6 mb-4">
                  Endereço de Entrega
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="font-cera-pro font-light text-[12px] text-[#666] block mb-1">
                      CEP *
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={cliente.cep}
                        onChange={(e) => setCliente({ ...cliente, cep: maskCEP(e.target.value) })}
                        onBlur={buscarCEP}
                        placeholder="00000-000"
                        className="flex-1 bg-white border border-[#d2d2d2] rounded-[8px] p-2 font-cera-pro text-[14px] focus:outline-none focus:border-[#254333]"
                      />
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="font-cera-pro font-light text-[12px] text-[#666] block mb-1">
                      Endereço *
                    </label>
                    <input
                      type="text"
                      value={cliente.endereco}
                      onChange={(e) => setCliente({ ...cliente, endereco: e.target.value })}
                      className="w-full bg-white border border-[#d2d2d2] rounded-[8px] p-2 font-cera-pro text-[14px] focus:outline-none focus:border-[#254333]"
                    />
                  </div>
                  <div>
                    <label className="font-cera-pro font-light text-[12px] text-[#666] block mb-1">
                      Número *
                    </label>
                    <input
                      type="text"
                      value={cliente.numero}
                      onChange={(e) => setCliente({ ...cliente, numero: e.target.value })}
                      className="w-full bg-white border border-[#d2d2d2] rounded-[8px] p-2 font-cera-pro text-[14px] focus:outline-none focus:border-[#254333]"
                    />
                  </div>
                  <div>
                    <label className="font-cera-pro font-light text-[12px] text-[#666] block mb-1">
                      Complemento
                    </label>
                    <input
                      type="text"
                      value={cliente.complemento}
                      onChange={(e) => setCliente({ ...cliente, complemento: e.target.value })}
                      placeholder="Apto, bloco..."
                      className="w-full bg-white border border-[#d2d2d2] rounded-[8px] p-2 font-cera-pro text-[14px] focus:outline-none focus:border-[#254333]"
                    />
                  </div>
                  <div>
                    <label className="font-cera-pro font-light text-[12px] text-[#666] block mb-1">
                      Bairro *
                    </label>
                    <input
                      type="text"
                      value={cliente.bairro}
                      onChange={(e) => setCliente({ ...cliente, bairro: e.target.value })}
                      className="w-full bg-white border border-[#d2d2d2] rounded-[8px] p-2 font-cera-pro text-[14px] focus:outline-none focus:border-[#254333]"
                    />
                  </div>
                  <div>
                    <label className="font-cera-pro font-light text-[12px] text-[#666] block mb-1">
                      Cidade *
                    </label>
                    <input
                      type="text"
                      value={cliente.cidade}
                      onChange={(e) => setCliente({ ...cliente, cidade: e.target.value })}
                      className="w-full bg-white border border-[#d2d2d2] rounded-[8px] p-2 font-cera-pro text-[14px] focus:outline-none focus:border-[#254333]"
                    />
                  </div>
                  <div>
                    <label className="font-cera-pro font-light text-[12px] text-[#666] block mb-1">
                      Estado *
                    </label>
                    <input
                      type="text"
                      value={cliente.estado}
                      onChange={(e) => setCliente({ ...cliente, estado: e.target.value.toUpperCase().slice(0, 2) })}
                      placeholder="UF"
                      maxLength={2}
                      className="w-full bg-white border border-[#d2d2d2] rounded-[8px] p-2 font-cera-pro text-[14px] focus:outline-none focus:border-[#254333]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Coluna Lateral - Resumo */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-[16px] p-6 shadow-[0px_1px_2px_0px_rgba(0,0,0,0.3),0px_1px_3px_1px_rgba(0,0,0,0.15)] sticky top-6">
                <h2 className="font-cera-pro font-bold text-[18px] text-black mb-4">
                  Resumo do Pedido
                </h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="font-cera-pro font-light text-[14px] text-[#666]">
                      Subtotal ({carrinho.reduce((acc, i) => acc + i.quantity, 0)} itens)
                    </span>
                    <span className="font-cera-pro font-medium text-[14px] text-black">
                      {formatPrice(subtotal)}
                    </span>
                  </div>

                  {descontoTotal > 0 && (
                    <div className="flex justify-between">
                      <span className="font-cera-pro font-light text-[14px] text-[#666]">
                        Desconto
                      </span>
                      <span className="font-cera-pro font-medium text-[14px] text-[#009142]">
                        -{formatPrice(descontoTotal)}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span className="font-cera-pro font-light text-[14px] text-[#666]">
                      Frete
                    </span>
                    <span className="font-cera-pro font-medium text-[14px] text-black">
                      {freteValor === 0 ? "Grátis" : formatPrice(freteValor)}
                    </span>
                  </div>

                  <div className="border-t border-[#d2d2d2] pt-3">
                    <div className="flex justify-between">
                      <span className="font-cera-pro font-bold text-[16px] text-black">
                        Total
                      </span>
                      <span className={`font-cera-pro font-bold text-[20px] ${cortesia ? "text-[#009142]" : "text-black"}`}>
                        {cortesia ? "CORTESIA" : formatPrice(total)}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={submitting || carrinho.length === 0}
                  className={`
                    w-full py-3 rounded-[8px] font-cera-pro font-bold text-[16px] transition-colors
                    ${submitting || carrinho.length === 0
                      ? "bg-[#999999] text-white cursor-not-allowed"
                      : "bg-[#254333] hover:bg-[#1a3226] text-white"
                    }
                  `}
                >
                  {submitting
                    ? "Criando..."
                    : cortesia
                    ? "Criar Pedido Cortesia"
                    : "Gerar Link de Pagamento"
                  }
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
