# 04 - Hooks e Contextos

> Como usar e criar hooks customizados e contextos.

---

## Contextos Disponiveis

### Visao Geral

| Contexto | Hook | Responsabilidade |
|----------|------|------------------|
| CartContext | `useCart` | Estado do carrinho |
| CouponContext | `useCoupon` | Cupons de desconto |
| ShippingContext | `useShipping` | Frete e CEP |
| CartTotalsContext | `useCartTotals` | Totais calculados (read-only) |
| AuthContext | `useAuth` | Autenticacao |

### useCart

```typescript
import { useCart } from "@/contexts/cart";

function Component() {
  const {
    items,           // CartItem[]
    isLoading,       // boolean
    addItem,         // (item: CartItem) => void
    removeItem,      // (id: string) => void
    updateQuantity,  // (id: string, qty: number) => void
    clear,           // () => void
  } = useCart();

  // Exemplo
  const handleAdd = (product: Product) => {
    addItem({
      id: product.id,
      slug: product.slug,
      nome: product.nome,
      preco: product.preco,
      quantidade: 1,
      imagem: product.imagem,
    });
  };
}
```

### useCoupon

```typescript
import { useCoupon } from "@/contexts/coupon";

function Component() {
  const {
    coupons,        // Coupon[]
    isValidating,   // boolean
    error,          // string | null
    addCoupon,      // (code: string) => Promise<boolean>
    removeCoupon,   // (code: string) => void
    clearCoupons,   // () => void
  } = useCoupon();

  // Exemplo
  const handleApply = async (code: string) => {
    const success = await addCoupon(code);
    if (!success) {
      alert("Cupom invalido");
    }
  };
}
```

### useShipping

```typescript
import { useShipping } from "@/contexts/shipping";

function Component() {
  const {
    cep,            // string
    options,        // ShippingOption[]
    selected,       // ShippingOption | null
    isCalculating,  // boolean
    error,          // string | null
    setCep,         // (cep: string) => void
    calculate,      // (cep: string) => Promise<void>
    select,         // (option: ShippingOption) => void
    clear,          // () => void
  } = useShipping();

  // Exemplo
  const handleCalculate = async () => {
    await calculate(cep);
  };
}
```

### useCartTotals

```typescript
import { useCartTotals } from "@/contexts/cart-totals";

function Component() {
  const {
    subtotal,   // number - soma dos itens
    discount,   // number - desconto dos cupons
    shipping,   // number - valor do frete
    total,      // number - subtotal - discount + shipping
    itemCount,  // number - quantidade total de itens
  } = useCartTotals();

  // Este contexto e READ-ONLY
  // Os valores sao calculados automaticamente
}
```

### useAuth

```typescript
import { useAuth } from "@/contexts/AuthContext";

function Component() {
  const {
    user,           // User | null
    isLogged,       // boolean
    isLoading,      // boolean
    login,          // (email, password) => Promise<void>
    logout,         // () => Promise<void>
    register,       // (data) => Promise<void>
  } = useAuth();

  // Exemplo
  if (!isLogged) {
    return <LoginPrompt />;
  }
}
```

---

## Hooks de Checkout

### Visao Geral

| Hook | Arquivo | Responsabilidade |
|------|---------|------------------|
| `useViaCep` | `useViaCep.ts` | Busca endereco por CEP |
| `usePagBankPayment` | `usePagBankPayment.ts` | Pagamentos PagBank |
| `useCreateOrder` | `useCreateOrder.ts` | Criacao de pedido |
| `useIdentificacaoForm` | `useIdentificacaoForm.ts` | Formulario de identificacao |

### useViaCep

```typescript
import { useViaCep } from "@/hooks/checkout";

function EntregaForm() {
  const {
    buscarCep,       // (cep: string) => Promise<void>
    loading,         // boolean
    error,           // string | null
    endereco,        // Endereco | null
    limparEndereco,  // () => void
  } = useViaCep();

  const handleCepBlur = async (cep: string) => {
    await buscarCep(cep);
    if (endereco) {
      setFormData(prev => ({
        ...prev,
        rua: endereco.logradouro,
        bairro: endereco.bairro,
        cidade: endereco.localidade,
        estado: endereco.uf,
      }));
    }
  };
}
```

### usePagBankPayment

```typescript
import { usePagBankPayment } from "@/hooks/checkout";

function PagamentoForm() {
  const {
    loading,              // boolean
    checkingPayment,      // boolean
    error,                // string | null
    publicKey,            // string | null
    qrCodeData,           // QRCodeData | null
    encryptCard,          // (card: CardData) => Promise<string>
    createPixPayment,     // (orderId, amount) => Promise<PixResult>
    createCardPayment,    // (orderId, token, installments) => Promise<CardResult>
    startPaymentPolling,  // (orderId, onSuccess) => void
    stopPolling,          // () => void
    checkOrderStatus,     // (orderId) => Promise<OrderStatus>
    clearError,           // () => void
  } = usePagBankPayment();
}
```

### useCreateOrder

```typescript
import { useCreateOrder } from "@/hooks/checkout";

function Checkout() {
  const {
    loading,      // boolean
    error,        // string | null
    errorCode,    // string | null
    createOrder,  // () => Promise<CreateOrderResult>
    clearError,   // () => void
  } = useCreateOrder();

  const handleFinalize = async () => {
    const result = await createOrder();
    if (result.success) {
      router.push(`/checkout/confirmacao?pedido=${result.orderId}`);
    }
  };
}
```

### useIdentificacaoForm

```typescript
import { useIdentificacaoForm } from "@/hooks/checkout";

function IdentificacaoPage() {
  const {
    formData,       // IdentificacaoFormData
    errors,         // Record<string, string>
    isLoading,      // boolean
    handleChange,   // (field, value) => void
    validateForm,   // () => boolean
    saveToStorage,  // () => void
    clearStorage,   // () => void
  } = useIdentificacaoForm();

  const handleSubmit = () => {
    if (validateForm()) {
      saveToStorage();
      router.push("/checkout/entrega");
    }
  };
}
```

---

## Criando Novos Hooks

### Estrutura Basica

```typescript
// src/hooks/useNovoHook.ts
import { useState, useCallback, useEffect } from "react";

interface UseNovoHookOptions {
  initialValue?: string;
  onSuccess?: () => void;
}

interface UseNovoHookReturn {
  value: string;
  isLoading: boolean;
  error: string | null;
  setValue: (v: string) => void;
  reset: () => void;
}

export function useNovoHook(options: UseNovoHookOptions = {}): UseNovoHookReturn {
  const { initialValue = "", onSuccess } = options;

  // Estados
  const [value, setValue] = useState(initialValue);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Callbacks estabilizados
  const reset = useCallback(() => {
    setValue(initialValue);
    setError(null);
  }, [initialValue]);

  // Efeitos
  useEffect(() => {
    if (value && !error) {
      onSuccess?.();
    }
  }, [value, error, onSuccess]);

  return {
    value,
    isLoading,
    error,
    setValue,
    reset,
  };
}
```

### Regras para Hooks

1. **Prefixo "use"** - Sempre comecar com "use"
2. **Retornar objeto** - Facilita destructuring seletivo
3. **Callbacks estabilizados** - Usar `useCallback` para funcoes
4. **Estados derivados** - Usar `useMemo` para calculos
5. **Tipagem completa** - Interface para retorno

### Padrao de Formulario

```typescript
// src/hooks/checkout/useNovoForm.ts
import { useState, useCallback } from "react";

interface FormData {
  campo1: string;
  campo2: string;
}

interface FormErrors {
  campo1?: string;
  campo2?: string;
}

export function useNovoForm() {
  const [formData, setFormData] = useState<FormData>({
    campo1: "",
    campo2: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = useCallback((field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: undefined }));
  }, []);

  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.campo1) {
      newErrors.campo1 = "Campo obrigatorio";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  return {
    formData,
    errors,
    isLoading,
    handleChange,
    validateForm,
  };
}
```

---

## Criando Novos Contextos

### Estrutura Padrao

```typescript
// src/contexts/novo/types.ts
export interface NovoContextType {
  data: string[];
  isLoading: boolean;
  addData: (item: string) => void;
  removeData: (item: string) => void;
}

// src/contexts/novo/NovoContext.tsx
"use client";

import { createContext, useContext, useState, useCallback, useMemo, ReactNode } from "react";
import type { NovoContextType } from "./types";

const NovoContext = createContext<NovoContextType | null>(null);

interface NovoProviderProps {
  children: ReactNode;
}

export function NovoProvider({ children }: NovoProviderProps) {
  const [data, setData] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addData = useCallback((item: string) => {
    setData(prev => [...prev, item]);
  }, []);

  const removeData = useCallback((item: string) => {
    setData(prev => prev.filter(i => i !== item));
  }, []);

  const value = useMemo(
    () => ({ data, isLoading, addData, removeData }),
    [data, isLoading, addData, removeData]
  );

  return (
    <NovoContext.Provider value={value}>
      {children}
    </NovoContext.Provider>
  );
}

export function useNovo(): NovoContextType {
  const context = useContext(NovoContext);
  if (!context) {
    throw new Error("useNovo must be used within NovoProvider");
  }
  return context;
}

// src/contexts/novo/index.ts
export { NovoProvider, useNovo } from "./NovoContext";
export type { NovoContextType } from "./types";
```

### Regras para Contextos

1. **Single Responsibility** - Cada contexto com uma responsabilidade
2. **Valores memorizados** - Usar `useMemo` no value
3. **Callbacks estabilizados** - Usar `useCallback`
4. **Verificacao de Provider** - Hook deve verificar se esta dentro do Provider
5. **Types separados** - Interface em arquivo `types.ts`

---

## Composicao de Providers

### FigmaProvider

```typescript
// src/contexts/FigmaProvider.tsx
import { ShippingProvider } from "./shipping";
import { CartProvider } from "./cart";
import { CouponProvider } from "./coupon";
import { CartTotalsProvider } from "./cart-totals";

export function FigmaProvider({ children }: { children: React.ReactNode }) {
  return (
    <ShippingProvider>
      <CartProvider>
        <CouponProvider>
          <CartTotalsProvider>
            {children}
          </CartTotalsProvider>
        </CouponProvider>
      </CartProvider>
    </ShippingProvider>
  );
}
```

### Ordem dos Providers

A ordem importa! Providers internos podem usar contextos externos.

```
ShippingProvider     # Nao depende de outros
  CartProvider       # Pode usar Shipping
    CouponProvider   # Pode usar Cart
      CartTotals     # Depende de Cart, Coupon, Shipping
```

---

## Anti-Patterns

### 1. Context Monolitico

```typescript
// ERRADO - Muitas responsabilidades
const MeuContexto = {
  cart, cupons, frete, total,
  addToCart, removeFromCart,
  addCupom, removeCupom,
  calcularFrete, selecionarFrete,
  // ... 20+ funcoes
};

// CERTO - Contextos separados
const CartContext = { items, addItem, removeItem };
const CouponContext = { coupons, addCoupon };
const ShippingContext = { options, selected, calculate };
```

### 2. useEffect para Estado Derivado

```typescript
// ERRADO
const [total, setTotal] = useState(0);
useEffect(() => {
  setTotal(items.reduce((sum, i) => sum + i.price, 0));
}, [items]);

// CERTO
const total = useMemo(
  () => items.reduce((sum, i) => sum + i.price, 0),
  [items]
);
```

### 3. Callbacks Nao Estabilizados

```typescript
// ERRADO - Nova funcao a cada render
const handleClick = () => { ... };

// CERTO - Funcao estabilizada
const handleClick = useCallback(() => { ... }, [deps]);
```

### 4. Value Nao Memorizado

```typescript
// ERRADO - Novo objeto a cada render
return (
  <Context.Provider value={{ data, setData }}>
    {children}
  </Context.Provider>
);

// CERTO - Objeto memorizado
const value = useMemo(() => ({ data, setData }), [data, setData]);
return (
  <Context.Provider value={value}>
    {children}
  </Context.Provider>
);
```

---

## Proximos Passos

Leia [05-checklist.md](./05-checklist.md) para o checklist antes de finalizar.
