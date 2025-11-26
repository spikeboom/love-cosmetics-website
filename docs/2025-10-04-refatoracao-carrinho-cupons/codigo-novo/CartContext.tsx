// docs/refatoracao-carrinho-cupons/codigo-novo/CartContext.tsx
// NOVO CONTEXT SIMPLIFICADO - Proposta de implementação

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useSnackbar } from 'notistack';

// ============= TIPOS =============
interface Product {
  id: string;
  name: string;
  originalPrice: number;
  currentPrice: number;
  quantity: number;
  image?: string;
  slug?: string;
}

interface Coupon {
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minimumValue?: number;
}

interface CartTotals {
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
}

interface CartContextType {
  // Estado
  items: Record<string, Product>;
  coupon: Coupon | null;
  totals: CartTotals;
  isLoading: boolean;
  
  // Ações do carrinho
  addToCart: (product: any) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  
  // Ações de cupom
  applyCoupon: (code: string) => Promise<void>;
  removeCoupon: () => void;
  
  // Utilidades
  getItemCount: () => number;
  prepareCheckout: () => any;
}

// ============= CONSTANTES =============
const SHIPPING_COST = 15;
const STORAGE_VERSION = 'v2';

// ============= CONTEXT =============
const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Record<string, Product>>({});
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  // ============= CÁLCULO DE TOTAIS =============
  const calculateTotals = useCallback((): CartTotals => {
    const itemsArray = Object.values(items);
    
    // Subtotal com preços originais
    const subtotal = itemsArray.reduce(
      (sum, item) => sum + (item.originalPrice * item.quantity),
      0
    );
    
    // Total com preços atuais (pode ter desconto)
    const totalWithCurrentPrices = itemsArray.reduce(
      (sum, item) => sum + (item.currentPrice * item.quantity),
      0
    );
    
    // Desconto é a diferença
    const discount = subtotal - totalWithCurrentPrices;
    
    return {
      subtotal,
      discount,
      shipping: itemsArray.length > 0 ? SHIPPING_COST : 0,
      total: totalWithCurrentPrices + (itemsArray.length > 0 ? SHIPPING_COST : 0)
    };
  }, [items]);

  // ============= APLICAR DESCONTO NOS ITEMS =============
  const applyDiscountToItems = useCallback((
    currentItems: Record<string, Product>,
    couponData: Coupon
  ): Record<string, Product> => {
    const updatedItems: Record<string, Product> = {};
    const itemsArray = Object.values(currentItems);
    const subtotal = itemsArray.reduce(
      (sum, item) => sum + (item.originalPrice * item.quantity),
      0
    );
    
    Object.entries(currentItems).forEach(([id, item]) => {
      let discountedPrice = item.originalPrice;
      
      if (couponData.type === 'percentage') {
        // Desconto percentual direto
        discountedPrice = item.originalPrice * (1 - couponData.value / 100);
      } else {
        // Desconto fixo distribuído proporcionalmente
        const itemSubtotal = item.originalPrice * item.quantity;
        const proportion = itemSubtotal / subtotal;
        const itemDiscount = (couponData.value * proportion) / item.quantity;
        discountedPrice = Math.max(0, item.originalPrice - itemDiscount);
      }
      
      updatedItems[id] = {
        ...item,
        currentPrice: Number(discountedPrice.toFixed(2))
      };
    });
    
    return updatedItems;
  }, []);

  // ============= RESTAURAR PREÇOS ORIGINAIS =============
  const restoreOriginalPrices = useCallback((
    currentItems: Record<string, Product>
  ): Record<string, Product> => {
    const restoredItems: Record<string, Product> = {};
    
    Object.entries(currentItems).forEach(([id, item]) => {
      restoredItems[id] = {
        ...item,
        currentPrice: item.originalPrice
      };
    });
    
    return restoredItems;
  }, []);

  // ============= ADICIONAR AO CARRINHO =============
  const addToCart = useCallback((product: any) => {
    setItems(currentItems => {
      const existingItem = currentItems[product.id];
      
      if (existingItem) {
        // Incrementa quantidade
        const updatedItems = {
          ...currentItems,
          [product.id]: {
            ...existingItem,
            quantity: existingItem.quantity + 1
          }
        };
        
        // Reaplica cupom se existir
        return coupon 
          ? applyDiscountToItems(updatedItems, coupon)
          : updatedItems;
      } else {
        // Adiciona novo produto
        const price = product.preco || product.price;
        const newItem: Product = {
          id: product.id,
          name: product.nome || product.name,
          originalPrice: price,
          currentPrice: price,
          quantity: 1,
          image: product.image,
          slug: product.slug
        };
        
        const updatedItems = {
          ...currentItems,
          [product.id]: newItem
        };
        
        // Aplica cupom se existir
        return coupon 
          ? applyDiscountToItems(updatedItems, coupon)
          : updatedItems;
      }
    });
    
    enqueueSnackbar('Produto adicionado ao carrinho', { variant: 'success' });
    
    // Tracking
    if (typeof window !== 'undefined') {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: 'add_to_cart',
        ecommerce: {
          items: [{
            item_id: product.id,
            item_name: product.nome || product.name,
            price: product.preco || product.price,
            quantity: 1
          }]
        }
      });
    }
  }, [coupon, applyDiscountToItems, enqueueSnackbar]);

  // ============= REMOVER DO CARRINHO =============
  const removeFromCart = useCallback((productId: string) => {
    setItems(currentItems => {
      const { [productId]: removed, ...remaining } = currentItems;
      return remaining;
    });
    
    enqueueSnackbar('Produto removido do carrinho', { variant: 'info' });
  }, [enqueueSnackbar]);

  // ============= ATUALIZAR QUANTIDADE =============
  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setItems(currentItems => {
      if (!currentItems[productId]) return currentItems;
      
      const updatedItems = {
        ...currentItems,
        [productId]: {
          ...currentItems[productId],
          quantity
        }
      };
      
      // Reaplica cupom se existir
      return coupon 
        ? applyDiscountToItems(updatedItems, coupon)
        : updatedItems;
    });
  }, [coupon, applyDiscountToItems, removeFromCart]);

  // ============= LIMPAR CARRINHO =============
  const clearCart = useCallback(() => {
    setItems({});
    setCoupon(null);
    localStorage.removeItem(`cart_${STORAGE_VERSION}`);
    localStorage.removeItem(`coupon_${STORAGE_VERSION}`);
    enqueueSnackbar('Carrinho limpo', { variant: 'info' });
  }, [enqueueSnackbar]);

  // ============= APLICAR CUPOM =============
  const applyCoupon = useCallback(async (code: string) => {
    if (!code) return;
    
    setIsLoading(true);
    try {
      // Valida cupom na API
      const response = await fetch('/api/validate-coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.toUpperCase() })
      });
      
      const data = await response.json();
      
      if (!data.valid) {
        enqueueSnackbar(data.message || 'Cupom inválido', { variant: 'error' });
        return;
      }
      
      // Verifica valor mínimo
      const subtotal = Object.values(items).reduce(
        (sum, item) => sum + (item.originalPrice * item.quantity),
        0
      );
      
      if (data.coupon.minimumValue && subtotal < data.coupon.minimumValue) {
        enqueueSnackbar(
          `Valor mínimo para este cupom: R$ ${data.coupon.minimumValue}`,
          { variant: 'warning' }
        );
        return;
      }
      
      // Aplica cupom
      setCoupon(data.coupon);
      setItems(currentItems => applyDiscountToItems(currentItems, data.coupon));
      
      enqueueSnackbar(`Cupom ${code} aplicado com sucesso!`, { variant: 'success' });
      
      // Tracking
      if (typeof window !== 'undefined') {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
          event: 'apply_coupon',
          coupon_code: code,
          coupon_value: data.coupon.value,
          coupon_type: data.coupon.type
        });
      }
    } catch (error) {
      console.error('Erro ao aplicar cupom:', error);
      enqueueSnackbar('Erro ao validar cupom', { variant: 'error' });
    } finally {
      setIsLoading(false);
    }
  }, [items, applyDiscountToItems, enqueueSnackbar]);

  // ============= REMOVER CUPOM =============
  const removeCoupon = useCallback(() => {
    setCoupon(null);
    setItems(currentItems => restoreOriginalPrices(currentItems));
    localStorage.removeItem(`coupon_${STORAGE_VERSION}`);
    
    enqueueSnackbar('Cupom removido', { variant: 'info' });
    
    // Tracking
    if (typeof window !== 'undefined' && coupon) {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: 'remove_coupon',
        coupon_code: coupon.code
      });
    }
  }, [coupon, restoreOriginalPrices, enqueueSnackbar]);

  // ============= PREPARAR CHECKOUT =============
  const prepareCheckout = useCallback(() => {
    const itemsArray = Object.values(items);
    
    return {
      items: itemsArray.map(item => ({
        id: item.id,
        quantity: item.quantity
        // NÃO envia preços - backend busca do banco
      })),
      couponCode: coupon?.code || null,
      // Apenas para logging/analytics - não usado para cálculo
      clientTotals: calculateTotals()
    };
  }, [items, coupon, calculateTotals]);

  // ============= CONTAR ITEMS =============
  const getItemCount = useCallback(() => {
    return Object.values(items).reduce(
      (count, item) => count + item.quantity,
      0
    );
  }, [items]);

  // ============= PERSISTÊNCIA =============
  
  // Salvar no localStorage
  useEffect(() => {
    if (Object.keys(items).length > 0) {
      localStorage.setItem(`cart_${STORAGE_VERSION}`, JSON.stringify(items));
    } else {
      localStorage.removeItem(`cart_${STORAGE_VERSION}`);
    }
  }, [items]);
  
  useEffect(() => {
    if (coupon) {
      localStorage.setItem(`coupon_${STORAGE_VERSION}`, JSON.stringify(coupon));
    } else {
      localStorage.removeItem(`coupon_${STORAGE_VERSION}`);
    }
  }, [coupon]);
  
  // Carregar do localStorage na montagem
  useEffect(() => {
    const savedCart = localStorage.getItem(`cart_${STORAGE_VERSION}`);
    const savedCoupon = localStorage.getItem(`coupon_${STORAGE_VERSION}`);
    
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (e) {
        console.error('Erro ao carregar carrinho:', e);
      }
    }
    
    if (savedCoupon) {
      try {
        setCoupon(JSON.parse(savedCoupon));
      } catch (e) {
        console.error('Erro ao carregar cupom:', e);
      }
    }
    
    // Verifica cupom na URL
    const urlParams = new URLSearchParams(window.location.search);
    const urlCoupon = urlParams.get('cupom');
    if (urlCoupon && !savedCoupon) {
      applyCoupon(urlCoupon);
      // Remove da URL
      urlParams.delete('cupom');
      const newUrl = urlParams.toString() 
        ? `${window.location.pathname}?${urlParams}`
        : window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, []); // Só executa na montagem
  
  // ============= PROVIDER =============
  const value: CartContextType = {
    items,
    coupon,
    totals: calculateTotals(),
    isLoading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    applyCoupon,
    removeCoupon,
    getItemCount,
    prepareCheckout
  };
  
  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

// ============= HOOK =============
export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart deve ser usado dentro de CartProvider');
  }
  return context;
}