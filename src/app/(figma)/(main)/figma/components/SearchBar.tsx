"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, History, ArrowUpRight } from "lucide-react";

interface Produto {
  id: number;
  slug: string;
  nome: string;
  imagem: string;
}

interface SearchBarProps {
  produtos: Produto[];
  className?: string;
  mobile?: boolean;
}

const HISTORY_KEY = "love-search-history";
const MAX_HISTORY = 5;

export function SearchBar({ produtos, className = "", mobile = false }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Carrega histórico do localStorage
  useEffect(() => {
    const saved = localStorage.getItem(HISTORY_KEY);
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch {
        setHistory([]);
      }
    }
  }, []);

  // Fecha dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filtra produtos baseado na query
  const filteredProdutos = query.trim()
    ? produtos.filter(p =>
        p.nome.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 5)
    : [];

  // Filtra histórico baseado na query
  const filteredHistory = query.trim()
    ? history.filter(h => h.toLowerCase().includes(query.toLowerCase())).slice(0, 3)
    : history.slice(0, 3);

  // Salva no histórico
  const saveToHistory = (term: string) => {
    if (!term.trim()) return;
    const newHistory = [term, ...history.filter(h => h !== term)].slice(0, MAX_HISTORY);
    setHistory(newHistory);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
  };

  // Handler para submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      saveToHistory(query.trim());
      window.location.href = `/figma/search?q=${encodeURIComponent(query.trim())}`;
    }
  };

  // Handler para selecionar produto
  const handleSelectProduct = (produto: Produto) => {
    saveToHistory(produto.nome);
    setIsOpen(false);
    setQuery("");
  };

  // Handler para selecionar do histórico
  const handleSelectHistory = (term: string) => {
    setQuery(term);
    saveToHistory(term);
    window.location.href = `/figma/search?q=${encodeURIComponent(term)}`;
  };

  const showDropdown = isOpen && (filteredHistory.length > 0 || filteredProdutos.length > 0);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Input de busca */}
      <form onSubmit={handleSubmit}>
        <div className={`bg-white flex gap-[5px] items-center p-[8px] rounded-[16px] ${mobile ? "w-full" : "w-[550px]"}`}>
          <Search size={16} className="shrink-0 text-black" />
          {/* <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsOpen(true)}
            placeholder="Buscar produtos..."
            className="flex-1 font-cera-pro font-light text-[12px] text-black outline-none bg-transparent"
          /> */}
        </div>
      </form>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-[16px] shadow-lg z-50 overflow-hidden">
          <div className="flex flex-col gap-[4px] p-[8px]">
            {/* Histórico */}
            {filteredHistory.map((term, index) => (
              <button
                key={`history-${index}`}
                onClick={() => handleSelectHistory(term)}
                className="flex gap-[8px] items-center p-[8px] hover:bg-[#f8f3ed] rounded-[8px] transition-colors text-left"
              >
                <History size={16} className="shrink-0 text-gray-400" />
                <span className="font-cera-pro font-light text-[12px] text-black">
                  {term}
                </span>
              </button>
            ))}

            {/* Separador se tem histórico e produtos */}
            {filteredHistory.length > 0 && filteredProdutos.length > 0 && (
              <div className="border-t border-gray-100 my-1" />
            )}

            {/* Produtos sugeridos */}
            {filteredProdutos.map((produto) => (
              <Link
                key={produto.id}
                href={`/figma/product/${produto.slug}`}
                onClick={() => handleSelectProduct(produto)}
                className="flex gap-[8px] items-center p-[8px] hover:bg-[#f8f3ed] rounded-[8px] transition-colors"
              >
                <ArrowUpRight size={16} className="shrink-0 text-gray-400" />
                <div className="relative w-[32px] h-[32px] rounded-[4px] overflow-hidden shrink-0">
                  <Image
                    src={produto.imagem}
                    alt={produto.nome}
                    fill
                    className="object-cover"
                  />
                </div>
                <span className="font-cera-pro font-light text-[12px] text-black flex-1">
                  {produto.nome}
                </span>
              </Link>
            ))}

            {/* Opção para ver todos os resultados */}
            {query.trim() && (
              <>
                <div className="border-t border-gray-100 my-1" />
                <Link
                  href={`/figma/search?q=${encodeURIComponent(query.trim())}`}
                  onClick={() => saveToHistory(query.trim())}
                  className="flex gap-[8px] items-center p-[8px] hover:bg-[#f8f3ed] rounded-[8px] transition-colors"
                >
                  <Search size={16} className="shrink-0 text-[#254333]" />
                  <span className="font-cera-pro font-medium text-[12px] text-[#254333]">
                    Ver todos os resultados para "{query}"
                  </span>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
