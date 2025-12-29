# Plano de Migracao de Contextos - Foco no Figma

**Data:** 29 de Dezembro de 2024

---

## Resumo

Este documento detalha o plano para migrar o `MeuContextoProvider` monolitico usado pelo Figma para contextos especializados.

**Objetivo:** Dividir `context.jsx` (9 responsabilidades) em 4 contextos focados.

---

## 1. Estado Atual

### 1.1 O Problema: context.jsx

```
┌─────────────────────────────────────────────────────────────────┐
│                    MeuContextoProvider                           │
│                    (context.jsx ~800 linhas)                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ESTADO:                                                         │
│  ├── cart: Record<string, CartProduct>                          │
│  ├── cupons: Coupon[]                                           │
│  ├── total: number                                              │
│  ├── descontos: number                                          │
│  ├── freight: ShippingData                                      │
│  └── ... mais 5+ estados                                        │
│                                                                  │
│  OPERACOES: 15+ funcoes misturadas                              │
│  EFEITOS: 8+ useEffect                                          │
│                                                                  │
│  USADO POR: 11 arquivos Figma                                   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 Arquivos Figma Dependentes

```
figma-main (7 arquivos):
├── figma/components/Header.tsx
├── figma/components/ShippingCalculator.tsx
├── figma/product/[slug]/ProductPageClient.tsx
├── figma/cart/CartPageClient.tsx
├── figma/entrar/page.tsx
├── figma/cadastrar/page.tsx
└── figma/sair/page.tsx

figma-checkout (4 arquivos):
├── figma/checkout/confirmacao/page.tsx
├── figma/checkout/entrega/EntregaPageClient.tsx
├── figma/checkout/pagamento/PagamentoPageClient.tsx
└── figma/checkout/nova-senha/page.tsx
```

---

## 2. Arquitetura Proposta

### 2.1 Novos Contextos

```
┌─────────────────────────────────────────────────────────────────┐
│                    CONTEXTOS ESPECIALIZADOS                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────┐   ┌─────────────────┐                      │
│  │  CartContext    │   │  CouponContext  │                      │
│  │                 │   │                 │                      │
│  │  items[]        │   │  coupons[]      │                      │
│  │  addItem()      │   │  addCoupon()    │                      │
│  │  removeItem()   │   │  removeCoupon() │                      │
│  │  updateQty()    │   │                 │                      │
│  └────────┬────────┘   └────────┬────────┘                      │
│           │                     │                                │
│           └──────────┬──────────┘                                │
│                      │                                           │
│           ┌──────────▼──────────┐                               │
│           │  CartTotalsContext  │  (derivado, read-only)        │
│           │                     │                                │
│           │  subtotal           │                                │
│           │  discount           │                                │
│           │  shipping           │                                │
│           │  total              │                                │
│           └─────────────────────┘                                │
│                                                                  │
│  ┌─────────────────┐                                            │
│  │ ShippingContext │                                            │
│  │                 │                                            │
│  │  cep            │                                            │
│  │  options[]      │                                            │
│  │  selected       │                                            │
│  │  calculate()    │                                            │
│  └─────────────────┘                                            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Hierarquia de Providers

```typescript
// src/app/(figma-main)/figma/layout.tsx

export default function FigmaLayout({ children }) {
  return (
    <CartProvider>
      <CouponProvider>
        <ShippingProvider>
          <CartTotalsProvider>
            <Header />
            {children}
            <Footer />
          </CartTotalsProvider>
        </ShippingProvider>
      </CouponProvider>
    </CartProvider>
  );
}
```

---

## 3. Plano de Migracao

### Fase 1: Criar Contextos (Sem Quebrar Nada)

**Objetivo:** Criar novos contextos em paralelo ao existente.

```
src/contexts/
├── cart/
│   ├── CartContext.tsx
│   ├── CartProvider.tsx
│   ├── useCart.ts
│   └── types.ts
├── coupon/
│   ├── CouponContext.tsx
│   ├── CouponProvider.tsx
│   ├── useCoupon.ts
│   └── types.ts
├── shipping/
│   ├── ShippingContext.tsx
│   ├── ShippingProvider.tsx
│   ├── useShipping.ts
│   └── types.ts
└── cart-totals/
    ├── CartTotalsContext.tsx
    ├── CartTotalsProvider.tsx
    ├── useCartTotals.ts
    └── types.ts
```

**Codigo: CartContext**

```typescript
// src/contexts/cart/CartContext.tsx
import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { CartItem, CartContextType } from './types';

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar do localStorage
  useEffect(() => {
    const stored = localStorage.getItem('cart');
    if (stored) {
      setItems(JSON.parse(stored));
    }
    setIsLoading(false);
  }, []);

  // Persistir mudancas
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('cart', JSON.stringify(items));
    }
  }, [items, isLoading]);

  const addItem = useCallback((item: CartItem) => {
    setItems(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i =>
          i.id === item.id
            ? { ...i, quantidade: i.quantidade + item.quantidade }
            : i
        );
      }
      return [...prev, item];
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    setItems(prev =>
      prev.map(i => (i.id === id ? { ...i, quantidade: quantity } : i))
    );
  }, [removeItem]);

  const clear = useCallback(() => {
    setItems([]);
  }, []);

  const value = useMemo(
    () => ({ items, isLoading, addItem, removeItem, updateQuantity, clear }),
    [items, isLoading, addItem, removeItem, updateQuantity, clear]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}
```

---

### Fase 2: Criar Adapter de Compatibilidade

**Objetivo:** Manter mesma API do `useMeuContexto` usando novos contextos.

```typescript
// src/contexts/compat/useMeuContextoAdapter.ts

import { useCart } from '../cart';
import { useCoupon } from '../coupon';
import { useShipping } from '../shipping';
import { useCartTotals } from '../cart-totals';

/**
 * Adapter de compatibilidade para migracao gradual.
 * Expoe mesma API do useMeuContexto original.
 *
 * @deprecated Use hooks especificos: useCart, useCoupon, useShipping, useCartTotals
 */
export function useMeuContextoAdapter() {
  const { items, addItem, removeItem, updateQuantity, clear } = useCart();
  const { coupons, addCoupon, removeCoupon } = useCoupon();
  const { selected: freight, calculate: calculateFreight } = useShipping();
  const { subtotal, discount, shipping, total } = useCartTotals();

  // Converter para formato antigo
  const cart = items.reduce((acc, item) => {
    acc[item.id] = item;
    return acc;
  }, {} as Record<string, CartItem>);

  return {
    // Estado (formato antigo)
    cart,
    cupons: coupons,
    total,
    descontos: discount,
    freight,
    qtdItemsCart: items.length,

    // Operacoes (nomes antigos mapeando para novos)
    addProductToCart: addItem,
    removeProductFromCart: removeItem,
    addQuantityProductToCart: (id: string) => {
      const item = items.find(i => i.id === id);
      if (item) updateQuantity(id, item.quantidade + 1);
    },
    subtractQuantityProductToCart: (id: string) => {
      const item = items.find(i => i.id === id);
      if (item) updateQuantity(id, item.quantidade - 1);
    },
    clearCart: clear,
    handleCupom: removeCoupon,
    handleAddCupom: addCoupon,
  };
}
```

---

### Fase 3: Migrar Componentes Figma

**Ordem de Migracao (menor risco primeiro):**

| # | Componente | Contextos Usados | Risco |
|---|------------|------------------|-------|
| 1 | sair/page.tsx | Apenas auth (nao migrar) | Baixo |
| 2 | Header.tsx | cart (qtd items) | Baixo |
| 3 | ShippingCalculator.tsx | shipping | Baixo |
| 4 | CartSummary.tsx | cart-totals | Baixo |
| 5 | ProductPageClient.tsx | cart | Medio |
| 6 | CartPageClient.tsx | cart, coupon, shipping | Medio |
| 7 | EntregaPageClient.tsx | shipping | Medio |
| 8 | PagamentoPageClient.tsx | cart, coupon, totals | Alto |

**Exemplo de Migracao: Header.tsx**

```typescript
// ANTES
import { useMeuContexto } from '@/components/common/Context/context';

export function Header() {
  const { qtdItemsCart, cart } = useMeuContexto();
  return <div>Carrinho ({qtdItemsCart})</div>;
}

// DEPOIS
import { useCart } from '@/contexts/cart';

export function Header() {
  const { items } = useCart();
  const itemCount = items.reduce((sum, item) => sum + item.quantidade, 0);
  return <div>Carrinho ({itemCount})</div>;
}
```

**Exemplo de Migracao: CartPageClient.tsx**

```typescript
// ANTES
import { useMeuContexto } from '@/components/common/Context/context';

export function CartPageClient() {
  const {
    cart,
    cupons,
    total,
    descontos,
    freight,
    addQuantityProductToCart,
    subtractQuantityProductToCart,
    removeProductFromCart,
    handleAddCupom,
    handleCupom,
  } = useMeuContexto();
  // ...
}

// DEPOIS
import { useCart } from '@/contexts/cart';
import { useCoupon } from '@/contexts/coupon';
import { useCartTotals } from '@/contexts/cart-totals';
import { useShipping } from '@/contexts/shipping';

export function CartPageClient() {
  const { items, updateQuantity, removeItem } = useCart();
  const { coupons, addCoupon, removeCoupon } = useCoupon();
  const { total, subtotal, discount, shipping } = useCartTotals();
  const { selected: freight } = useShipping();

  const incrementItem = (id: string) => {
    const item = items.find(i => i.id === id);
    if (item) updateQuantity(id, item.quantidade + 1);
  };

  const decrementItem = (id: string) => {
    const item = items.find(i => i.id === id);
    if (item) updateQuantity(id, item.quantidade - 1);
  };

  // ...
}
```

---

### Fase 4: Remover Codigo Legado

Apos todos componentes migrados:

1. Remover `src/components/common/Context/context.jsx`
2. Remover adapter de compatibilidade
3. Atualizar imports em toda aplicacao

---

## 4. Testes de Regressao

### 4.1 Cenarios Criticos

| Cenario | Validacao |
|---------|-----------|
| Adicionar produto ao carrinho | Item aparece no header e pagina de carrinho |
| Remover produto | Item removido, totais atualizados |
| Aplicar cupom | Desconto calculado corretamente |
| Remover cupom | Desconto removido |
| Calcular frete | Opcoes exibidas, preco atualizado |
| Refresh da pagina | Carrinho persistido |
| Checkout completo | Pedido criado com dados corretos |

### 4.2 Checklist Pre-Merge

- [ ] Todos os testes E2E passando
- [ ] Carrinho persiste apos refresh
- [ ] Cupons funcionando corretamente
- [ ] Frete calculando sem erros
- [ ] Checkout completando com sucesso
- [ ] Tracking GTM disparando eventos corretos

---

## 5. Rollback Plan

Se algo der errado durante a migracao:

1. **Fase 1-2:** Simplesmente nao usar novos contextos (codigo em paralelo)
2. **Fase 3:** Reverter componente especifico para usar `useMeuContexto`
3. **Fase 4:** Nao executar ate 100% de confianca

---

## 6. Cronograma Sugerido

| Fase | Descricao | Estimativa |
|------|-----------|------------|
| 1 | Criar contextos | 2-3 dias |
| 2 | Criar adapter | 1 dia |
| 3a | Migrar componentes baixo risco | 2-3 dias |
| 3b | Migrar componentes medio risco | 3-4 dias |
| 3c | Migrar componentes alto risco | 2-3 dias |
| 4 | Remover legado | 1 dia |
| **Total** | | **11-15 dias** |

---

## 7. Beneficios Esperados

| Metrica | Antes | Depois |
|---------|-------|--------|
| Linhas em context.jsx | ~800 | 0 (removido) |
| Responsabilidades por arquivo | 9 | 1 |
| Re-renders desnecessarios | Frequentes | Minimizados |
| Testabilidade | Baixa | Alta |
| Manutenibilidade | Dificil | Facil |

---

*Documento atualizado em 29/12/2024 - Foco no Figma*
