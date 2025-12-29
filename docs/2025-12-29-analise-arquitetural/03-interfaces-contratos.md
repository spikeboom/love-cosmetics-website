# Interfaces e Contratos - Foco no Figma

**Data:** 29 de Dezembro de 2024

---

## Resumo

Este documento define as interfaces necessarias para desacoplar as dependencias do Figma.

O Figma depende de poucos arquivos externos. As interfaces propostas focam em:

1. **CartContext** - Substituir `useMeuContexto` monolitico
2. **ICartRepository** - Abstrair localStorage
3. **IShippingCalculator** - Abstrair calculo de frete
4. **ICouponService** - Abstrair validacao de cupons

---

## 1. Interfaces de Context

### 1.1 CartContext Interface

```typescript
// src/contexts/cart/types.ts

export interface CartItem {
  id: string;
  slug: string;
  nome: string;
  preco: number;
  precoOriginal?: number;
  quantidade: number;
  imagem: string;
  sku?: string;
}

export interface CartContextType {
  // Estado
  items: CartItem[];
  isLoading: boolean;

  // Operacoes
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clear: () => void;
}
```

### 1.2 CouponContext Interface

```typescript
// src/contexts/coupon/types.ts

export interface Coupon {
  codigo: string;
  tipo: 'percentual' | 'valor_fixo' | 'frete_gratis';
  valor: number;
  minimo?: number;
  descricao?: string;
}

export interface CouponContextType {
  // Estado
  coupons: Coupon[];
  isValidating: boolean;
  error: string | null;

  // Operacoes
  addCoupon: (code: string) => Promise<boolean>;
  removeCoupon: (code: string) => void;
  clearCoupons: () => void;
}
```

### 1.3 ShippingContext Interface

```typescript
// src/contexts/shipping/types.ts

export interface ShippingOption {
  id: string;
  nome: string;
  preco: number;
  prazo: number; // dias
  transportadora: string;
}

export interface ShippingContextType {
  // Estado
  cep: string;
  options: ShippingOption[];
  selected: ShippingOption | null;
  isCalculating: boolean;
  error: string | null;

  // Operacoes
  setCep: (cep: string) => void;
  calculate: (cep: string) => Promise<void>;
  select: (option: ShippingOption) => void;
  clear: () => void;
}
```

### 1.4 CartTotalsContext Interface (Derivado)

```typescript
// src/contexts/cart-totals/types.ts

export interface CartTotalsContextType {
  // Valores calculados (read-only)
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  itemCount: number;
}
```

---

## 2. Interfaces de Repository

### 2.1 ICartRepository

```typescript
// src/domain/repositories/ICartRepository.ts

import { CartItem } from '../entities/Cart';

export interface ICartRepository {
  load(): CartItem[];
  save(items: CartItem[]): void;
  clear(): void;
  exists(): boolean;
}

// Implementacao: localStorage
// src/infrastructure/persistence/LocalStorageCartRepository.ts
export class LocalStorageCartRepository implements ICartRepository {
  private readonly KEY = 'cart';

  load(): CartItem[] {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(this.KEY);
    return data ? JSON.parse(data) : [];
  }

  save(items: CartItem[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.KEY, JSON.stringify(items));
  }

  clear(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.KEY);
  }

  exists(): boolean {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(this.KEY) !== null;
  }
}
```

---

## 3. Interfaces de Service

### 3.1 ICouponService

```typescript
// src/domain/services/ICouponService.ts

import { Coupon, CartItem } from '../entities';

export interface CouponValidationResult {
  isValid: boolean;
  coupon?: Coupon;
  error?: string;
}

export interface ICouponService {
  validate(code: string): Promise<CouponValidationResult>;
  calculateDiscount(items: CartItem[], coupons: Coupon[]): number;
}

// Implementacao: Strapi
// src/infrastructure/external/strapi/StrapiCouponService.ts
```

### 3.2 IShippingCalculator

```typescript
// src/domain/services/IShippingCalculator.ts

import { ShippingOption, CartItem } from '../entities';

export interface ShippingCalculationResult {
  success: boolean;
  options: ShippingOption[];
  error?: string;
}

export interface IShippingCalculator {
  calculate(cep: string, items: CartItem[]): Promise<ShippingCalculationResult>;
}

// Implementacao: Frenet
// src/infrastructure/external/frenet/FrenetShippingCalculator.ts
```

### 3.3 IProductCatalog

```typescript
// src/domain/services/IProductCatalog.ts

import { Product } from '../entities';

export interface IProductCatalog {
  getBySlug(slug: string): Promise<Product | null>;
  getByIds(ids: string[]): Promise<Product[]>;
  search(query: string, filters?: ProductFilters): Promise<Product[]>;
  getForDesign(): Promise<Product[]>;
}

// Implementacao atual: src/modules/produto/domain.ts
// fetchProdutoBySlug, fetchProdutosForDesign
```

---

## 4. Contratos de Hook

### 4.1 useCheckout Hooks

Os hooks de checkout ja estao bem definidos e devem ser mantidos:

```typescript
// src/hooks/checkout/index.ts

// 1. useViaCep - Busca endereco por CEP
export interface UseViaCepReturn {
  buscarCep: (cep: string) => Promise<void>;
  loading: boolean;
  error: string | null;
  endereco: Endereco | null;
  limparEndereco: () => void;
}

// 2. usePagBankPayment - Pagamentos
export interface UsePagBankPaymentReturn {
  loading: boolean;
  checkingPayment: boolean;
  error: string | null;
  publicKey: string | null;
  qrCodeData: QRCodeData | null;
  encryptCard: (card: CardData) => Promise<string>;
  createPixPayment: (orderId: string, amount: number) => Promise<PixResult>;
  createCardPayment: (orderId: string, cardToken: string, installments: number) => Promise<CardResult>;
  startPaymentPolling: (orderId: string, onSuccess: () => void) => void;
  stopPolling: () => void;
  checkOrderStatus: (orderId: string) => Promise<OrderStatus>;
  clearError: () => void;
}

// 3. useCreateOrder - Criacao de pedido
export interface UseCreateOrderReturn {
  loading: boolean;
  error: string | null;
  errorCode: string | null;
  createOrder: () => Promise<CreateOrderResult>;
  clearError: () => void;
}
```

---

## 5. Mapeamento: Interface -> Implementacao

| Interface | Implementacao Atual | Localizacao |
|-----------|---------------------|-------------|
| `CartContextType` | `useMeuContexto` | `components/common/Context/context.jsx` |
| `ICartRepository` | localStorage direto | Embutido em `context.jsx` |
| `ICouponService` | `fetchAndValidateCupom` | `lib/strapi/cupons.ts` |
| `IShippingCalculator` | `calculateFreightFrenet` | `services/freight-service.ts` |
| `IProductCatalog` | `fetchProdutos*` | `modules/produto/domain.ts` |

---

## 6. Plano de Implementacao

### Fase 1: Criar Interfaces (Sem Breaking Changes)

```
src/
├── domain/
│   ├── entities/
│   │   ├── Cart.ts
│   │   ├── Coupon.ts
│   │   └── Shipping.ts
│   ├── repositories/
│   │   └── ICartRepository.ts
│   └── services/
│       ├── ICouponService.ts
│       └── IShippingCalculator.ts
└── contexts/
    ├── cart/
    │   └── types.ts
    ├── coupon/
    │   └── types.ts
    └── shipping/
        └── types.ts
```

### Fase 2: Implementar Contexts Novos

```typescript
// src/contexts/cart/CartContext.tsx
export const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const repository = useMemo(() => new LocalStorageCartRepository(), []);

  // Carregar do localStorage
  useEffect(() => {
    setItems(repository.load());
  }, []);

  // Persistir mudancas
  useEffect(() => {
    repository.save(items);
  }, [items]);

  const addItem = useCallback((item: CartItem) => {
    setItems(prev => [...prev, item]);
  }, []);

  // ... resto das operacoes

  return (
    <CartContext.Provider value={{ items, addItem, ... }}>
      {children}
    </CartContext.Provider>
  );
}
```

### Fase 3: Migrar Figma para Novos Contexts

1. Criar adapter que expoe mesma API do `useMeuContexto`
2. Migrar componente por componente
3. Remover adapter quando todos migrados

---

## 7. Exemplo de Uso no Figma

### Antes (Atual)

```typescript
// ProductPageClient.tsx
import { useMeuContexto } from '@/components/common/Context/context';

export function ProductPageClient({ product }) {
  const { addProductToCart, cart } = useMeuContexto();

  const handleAddToCart = () => {
    addProductToCart(product);
  };

  return <button onClick={handleAddToCart}>Adicionar</button>;
}
```

### Depois (Proposto)

```typescript
// ProductPageClient.tsx
import { useCart } from '@/contexts/cart';
import { useCartTracking } from '@/hooks/useCartTracking';

export function ProductPageClient({ product }) {
  const { addItem } = useCart();
  const { trackAddToCart } = useCartTracking();

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      slug: product.slug,
      nome: product.nome,
      preco: product.preco,
      quantidade: 1,
      imagem: product.imagem
    });
    trackAddToCart(product);
  };

  return <button onClick={handleAddToCart}>Adicionar</button>;
}
```

---

*Documento atualizado em 29/12/2024 - Foco no Figma*
