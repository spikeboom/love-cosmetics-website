"use client";

import { useState, useCallback, useRef } from "react";

interface ProdutoDesatualizado {
  id: string;
  nome: string;
  precoCarrinho: number;
  precoAtual: number;
  precoAtualComCupom: number;
}

interface CupomDesatualizado {
  codigo: string;
  valido: boolean;
  multiplacar: number;
  diminuir: number;
  erro?: string;
}

interface ProdutoAtualizado {
  id: string;
  documentId: string;
  nome: string;
  precoAtual: number;
  precoComCupom: number;
}

interface ValidationResult {
  atualizado: boolean;
  produtosDesatualizados: ProdutoDesatualizado[];
  cuponsDesatualizados: CupomDesatualizado[];
  produtosAtualizados: ProdutoAtualizado[];
}

interface CartValidationState {
  isValidating: boolean;
  isValid: boolean | null;
  produtosDesatualizados: ProdutoDesatualizado[];
  cuponsDesatualizados: CupomDesatualizado[];
  produtosAtualizados: ProdutoAtualizado[];
  lastValidation: Date | null;
  error: string | null;
}

export function useCartValidation() {
  const [state, setState] = useState<CartValidationState>({
    isValidating: false,
    isValid: null,
    produtosDesatualizados: [],
    cuponsDesatualizados: [],
    produtosAtualizados: [],
    lastValidation: null,
    error: null,
  });

  // Ref para evitar chamadas duplicadas
  const isValidatingRef = useRef(false);

  const validateCart = useCallback(async (
    cart: Record<string, any>,
    cupons: any[]
  ): Promise<ValidationResult | null> => {
    // Evitar chamadas duplicadas
    if (isValidatingRef.current) {
      return null;
    }

    const cartItems = Object.values(cart);
    if (cartItems.length === 0) {
      setState(prev => ({
        ...prev,
        isValid: true,
        produtosDesatualizados: [],
        cuponsDesatualizados: [],
        produtosAtualizados: [],
        lastValidation: new Date(),
      }));
      return {
        atualizado: true,
        produtosDesatualizados: [],
        cuponsDesatualizados: [],
        produtosAtualizados: [],
      };
    }

    isValidatingRef.current = true;
    setState(prev => ({ ...prev, isValidating: true, error: null }));

    try {
      const items = cartItems.map((item: any) => ({
        id: String(item.id),
        documentId: item.documentId,
        nome: item.nome,
        preco: item.preco,
        quantity: item.quantity,
      }));

      const cuponsInfo = (cupons || []).map((c: any) => ({
        codigo: c.codigo,
        multiplacar: c.multiplacar,
        diminuir: c.diminuir,
      }));

      const response = await fetch("/api/carrinho/validar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, cupons: cuponsInfo }),
      });

      if (!response.ok) {
        throw new Error("Erro ao validar carrinho");
      }

      const result: ValidationResult = await response.json();

      setState({
        isValidating: false,
        isValid: result.atualizado,
        produtosDesatualizados: result.produtosDesatualizados,
        cuponsDesatualizados: result.cuponsDesatualizados,
        produtosAtualizados: result.produtosAtualizados,
        lastValidation: new Date(),
        error: null,
      });

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      setState(prev => ({
        ...prev,
        isValidating: false,
        error: errorMessage,
      }));
      return null;
    } finally {
      isValidatingRef.current = false;
    }
  }, []);

  const clearValidation = useCallback(() => {
    setState({
      isValidating: false,
      isValid: null,
      produtosDesatualizados: [],
      cuponsDesatualizados: [],
      produtosAtualizados: [],
      lastValidation: null,
      error: null,
    });
  }, []);

  return {
    ...state,
    validateCart,
    clearValidation,
  };
}
