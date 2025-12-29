# Violacoes de SRP - Foco no Figma

**Data:** 29 de Dezembro de 2024

---

## Resumo

Este documento detalha as violacoes do Single Responsibility Principle (SRP) encontradas nos arquivos que **impactam diretamente o Figma**.

| Severidade | Quantidade | Arquivos |
|------------|------------|----------|
| **Critica** | 1 | context.jsx |
| **Media** | 3 | usePagBankPayment, ProductPageClient, CartPageClient |
| **Baixa** | 2 | cart-calculations, EntregaPageClient |

---

## 1. Violacao Critica

### 1.1 context.jsx - MeuContextoProvider

**Arquivo:** `src/components/common/Context/context.jsx`
**Linhas:** ~800+
**Usado por:** 11 arquivos Figma

#### Arquivos Figma que Dependem

```
figma-main:
├── figma/components/Header.tsx
├── figma/components/ShippingCalculator.tsx
├── figma/product/[slug]/ProductPageClient.tsx
├── figma/cart/CartPageClient.tsx
├── figma/entrar/page.tsx
├── figma/cadastrar/page.tsx
└── figma/sair/page.tsx

figma-checkout:
├── figma/checkout/confirmacao/page.tsx
├── figma/checkout/entrega/EntregaPageClient.tsx
├── figma/checkout/pagamento/PagamentoPageClient.tsx
└── figma/checkout/nova-senha/page.tsx
```

#### 9 Responsabilidades Identificadas

| # | Responsabilidade | Codigo | Deveria Estar Em |
|---|-----------------|--------|------------------|
| 1 | Estado do carrinho | `cart`, `setCart` | `CartContext` |
| 2 | Operacoes CRUD carrinho | `addProductToCart`, `removeProductFromCart`, etc | `useCartOperations` |
| 3 | Estado de cupons | `cupons`, `setCupons` | `CouponContext` |
| 4 | Operacoes de cupons | `handleCupom`, `handleAddCupom` | `useCouponOperations` |
| 5 | Calculo de totais | `total`, `descontos` | `CartCalculationService` |
| 6 | Estado de frete | `freight`, `setFreight` | `ShippingContext` |
| 7 | Calculo de frete | `freteValue`, etc | `ShippingService` |
| 8 | Persistencia | `localStorage` | `CartRepository` |
| 9 | Tracking | `window.dataLayer` | `TrackingService` |

#### Exemplo de Codigo Problematico

```javascript
// context.jsx - Uma unica funcao faz:
// 1. Adiciona produto
// 2. Atualiza localStorage
// 3. Dispara tracking GTM
// 4. Mostra notificacao
const addProductToCart = async (product) => {
  // 1. Logica de adicao
  const updatedCart = [...cart, product];
  setCart(updatedCart);

  // 2. Persistencia
  localStorage.setItem('cart', JSON.stringify(updatedCart));

  // 3. Tracking
  window.dataLayer?.push({
    event: 'add_to_cart',
    ecommerce: { items: [product] }
  });

  // 4. Notificacao
  enqueueSnackbar('Produto adicionado!');
};
```

#### Proposta de Refatoracao

```typescript
// 1. CartContext.tsx - Apenas estado
export const CartContext = createContext<CartState>(null);

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
  clear: () => void;
}

// 2. CouponContext.tsx - Apenas cupons
export const CouponContext = createContext<CouponState>(null);

interface CouponState {
  coupons: Coupon[];
  add: (code: string) => Promise<void>;
  remove: (code: string) => void;
}

// 3. ShippingContext.tsx - Apenas frete
export const ShippingContext = createContext<ShippingState>(null);

interface ShippingState {
  cep: string;
  options: ShippingOption[];
  selected: ShippingOption | null;
  calculate: (cep: string) => Promise<void>;
  select: (option: ShippingOption) => void;
}

// 4. CartTotalsContext.tsx - Derivado (read-only)
export const CartTotalsContext = createContext<CartTotals>(null);

interface CartTotals {
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
}

// 5. useCartPersistence.ts - Hook de persistencia
export function useCartPersistence(cart: Cart) {
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);
}

// 6. useCartTracking.ts - Hook de tracking
export function useCartTracking() {
  const trackAddToCart = (item: CartItem) => {
    window.dataLayer?.push({ event: 'add_to_cart', ... });
  };
  return { trackAddToCart, trackRemoveFromCart, ... };
}
```

---

## 2. Violacoes de Media Severidade

### 2.1 usePagBankPayment

**Arquivo:** `src/hooks/checkout/usePagBankPayment.ts`
**Usado em:** PagamentoPixReal.tsx, PagamentoCartaoReal.tsx

#### 6 Responsabilidades

| # | Responsabilidade | Funcoes |
|---|-----------------|---------|
| 1 | Gerenciar public key | `publicKey`, `fetchPublicKey` |
| 2 | Criptografar cartao | `encryptCard` |
| 3 | Criar pagamento PIX | `createPixPayment` |
| 4 | Criar pagamento Cartao | `createCardPayment` |
| 5 | Polling de status | `startPaymentPolling`, `stopPolling` |
| 6 | Gerenciar QR Code | `qrCodeData` |

#### Proposta de Divisao

```typescript
// Manter agrupado por ser um fluxo coeso de pagamento
// Mas considerar dividir em hooks menores:

// useCardEncryption.ts
export function useCardEncryption() {
  const { publicKey } = usePagBankPublicKey();
  const encryptCard = (cardData: CardData) => { ... };
  return { encryptCard };
}

// usePixPayment.ts
export function usePixPayment() {
  const { createPayment, qrCode, loading } = ...;
  return { createPayment, qrCode, loading };
}

// useCardPayment.ts
export function useCardPayment() {
  const { encryptCard } = useCardEncryption();
  const { createPayment, loading } = ...;
  return { createPayment, loading };
}

// usePaymentPolling.ts
export function usePaymentPolling(orderId: string) {
  const { status, startPolling, stopPolling } = ...;
  return { status, startPolling, stopPolling };
}
```

**Recomendacao:** Baixa prioridade. O hook atual funciona bem e o agrupamento faz sentido para o fluxo de checkout.

---

### 2.2 ProductPageClient.tsx

**Arquivo:** `src/app/(figma-main)/figma/product/[slug]/ProductPageClient.tsx`
**Linhas:** ~400+

#### 4 Responsabilidades

| # | Responsabilidade | Codigo |
|---|-----------------|--------|
| 1 | Renderizacao UI | JSX complexo |
| 2 | Estado de UI | `selectedImage`, `quantity`, `expandedSections` |
| 3 | Operacoes de carrinho | `addToCart`, `buyNow` |
| 4 | Notificacoes | `useNotifications` |

#### Proposta de Refatoracao

```typescript
// useProductActions.ts - Extrair logica de acoes
export function useProductActions(product: Product) {
  const { addProductToCart } = useMeuContexto();
  const { showNotification } = useNotifications();
  const router = useRouter();

  const addToCart = async (quantity: number) => {
    await addProductToCart({ ...product, quantity });
    showNotification('Produto adicionado ao carrinho!');
  };

  const buyNow = async (quantity: number) => {
    await addToCart(quantity);
    router.push('/figma/checkout/identificacao');
  };

  return { addToCart, buyNow };
}

// ProductPageClient.tsx - Apenas UI
export function ProductPageClient({ product, relatedProducts }) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const { addToCart, buyNow } = useProductActions(product);

  return (
    // JSX limpo, focado em renderizacao
  );
}
```

---

### 2.3 CartPageClient.tsx

**Arquivo:** `src/app/(figma-main)/figma/cart/CartPageClient.tsx`
**Linhas:** ~300+

#### 4 Responsabilidades

| # | Responsabilidade | Codigo |
|---|-----------------|--------|
| 1 | Renderizacao UI | JSX do carrinho |
| 2 | Validacao de carrinho | `validateCart`, `isValidating` |
| 3 | Navegacao | `router.push` para checkout |
| 4 | Loading states | `isLoading`, `CartLoadingSkeleton` |

#### Proposta de Refatoracao

```typescript
// useCartPage.ts - Extrair logica
export function useCartPage() {
  const { cart, isValidating, validateCart } = useMeuContexto();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Logica de inicializacao
  }, []);

  const proceedToCheckout = () => {
    router.push('/figma/checkout/identificacao');
  };

  return {
    cart,
    isLoading,
    isValidating,
    proceedToCheckout
  };
}

// CartPageClient.tsx - Apenas UI
export function CartPageClient({ suggestedProducts }) {
  const { cart, isLoading, proceedToCheckout } = useCartPage();

  if (isLoading) return <CartLoadingSkeleton />;

  return (
    // JSX limpo
  );
}
```

---

## 3. Violacoes de Baixa Severidade

### 3.1 cart-calculations.ts

**Arquivo:** `src/utils/cart-calculations.ts`
**Usado em:** CartSummary.tsx, EntregaPageClient.tsx

#### Problema

Funcoes que deveriam ser puras fazem leitura de URL params:

```typescript
// Funcao impura - le estado global
export function getTipoDesconto() {
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    return params.get('tipo') || 'default';
  }
  return 'default';
}
```

#### Proposta

```typescript
// Funcao pura - recebe parametro
export function getTipoDesconto(tipoParam?: string): TipoDesconto {
  return tipoParam || 'default';
}

// Uso no componente
const searchParams = useSearchParams();
const tipo = getTipoDesconto(searchParams.get('tipo'));
```

---

### 3.2 EntregaPageClient.tsx

**Arquivo:** `src/app/(figma-checkout)/figma/checkout/entrega/EntregaPageClient.tsx`

#### Problema

Import cruzado entre pastas Figma:

```typescript
// Import de outra pasta Figma
import { FreightOptions } from '@/app/(figma-main)/figma/components/FreightOptions';
```

#### Proposta

```typescript
// Opcao 1: Mover para pasta compartilhada
import { FreightOptions } from '@/components/shared/FreightOptions';

// Opcao 2: Criar pasta compartilhada dentro de Figma
import { FreightOptions } from '@/app/(figma-shared)/components/FreightOptions';

// Opcao 3: Duplicar componente (se divergirem)
// figma-checkout/figma/checkout/components/FreightOptions.tsx
```

---

## Priorizacao de Refatoracao

| Prioridade | Arquivo | Motivo | Esforco |
|------------|---------|--------|---------|
| **1** | context.jsx | Impacta 11 arquivos, alta complexidade | Alto |
| **2** | FreightOptions import | Fix rapido, elimina dependencia cruzada | Baixo |
| **3** | cart-calculations.ts | Torna funcoes puras | Baixo |
| **4** | ProductPageClient | Melhora legibilidade | Medio |
| **5** | CartPageClient | Melhora legibilidade | Medio |
| **6** | usePagBankPayment | Opcional, baixa prioridade | Medio |

---

## Proximos Passos

1. **Imediato:** Resolver import cruzado de FreightOptions
2. **Sprint 1:** Iniciar divisao de context.jsx
3. **Sprint 2:** Extrair hooks de ProductPageClient e CartPageClient
4. **Backlog:** Considerar divisao de usePagBankPayment

---

*Documento atualizado em 29/12/2024 - Foco no Figma*
