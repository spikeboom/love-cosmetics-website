# Plano de Organização por Responsabilidades
## CartSummary.tsx, context.jsx e useModalCart.ts

Após análise dos arquivos, identifiquei sobreposição de responsabilidades e oportunidades de organização. Aqui está o plano de refatoração:

## 🎯 Problemas Identificados

### 1. **Mistura de Responsabilidades**
- `context.jsx` tem lógica de negócio, estado global, tracking e persistência
- `useModalCart.ts` duplica funcionalidades do contexto
- `CartSummary.tsx` recebe muitas props e mistura UI com lógica

### 2. **Dependências Circulares**
- `useModalCart.ts` usa `context.jsx` mas reimplementa funcionalidades
- Duplicação de lógica de cupons entre arquivos

### 3. **Estado Fragmentado**
- Estado do carrinho espalhado entre contexto e hook
- Lógica de cupons duplicada

## 📋 Plano de Refatoração Agrupada por Responsabilidade

### **GRUPO 1: Estado e Persistência**
```
📁 src/store/
├── cart-store.ts          # Estado global do carrinho
├── coupon-store.ts        # Estado global dos cupons  
└── ui-store.ts            # Estado da UI (modals, sidebars)
```

**Responsabilidades:**
- Gerenciar estado do carrinho
- Persistir dados no localStorage
- Sincronizar estado entre componentes

### **GRUPO 2: Lógica de Negócio**
```
📁 src/services/
├── cart-service.ts        # Operações do carrinho
├── coupon-service.ts      # Validação e aplicação de cupons
├── price-service.ts       # Cálculos de preços e descontos
└── tracking-service.ts    # Analytics e tracking
```

**Responsabilidades:**
- Regras de negócio do carrinho
- Validação de cupons
- Cálculos de preços
- Eventos de tracking

### **GRUPO 3: Hooks Especializados**
```
📁 src/hooks/
├── useCart.ts             # Hook para operações do carrinho
├── useCoupons.ts          # Hook para cupons
├── useCartModal.ts        # Hook para UI do modal
└── useCartSummary.ts      # Hook para resumo e totais
```

**Responsabilidades:**
- Interface entre componentes e services
- Estado local específico dos componentes
- Lógica de apresentação

### **GRUPO 4: Componentes de UI**
```
📁 src/components/cart/
├── CartSummary/
│   ├── CartSummary.tsx      # Componente principal
│   ├── FreightInfo.tsx      # Informações de frete
│   ├── CouponSection.tsx    # Seção de cupons
│   ├── DiscountDisplay.tsx  # Exibição de descontos
│   └── TotalDisplay.tsx     # Exibição do total
└── ModalCart/
    └── ...outros componentes
```

**Responsabilidades:**
- Apenas apresentação
- Receber dados via props
- Eventos de usuário

## 🔄 Detalhamento da Refatoração

### **ETAPA 1: Extrair Services**

#### `cart-service.ts`
```typescript
export class CartService {
  static addProduct(cart: Cart, product: Product): Cart
  static removeProduct(cart: Cart, productId: string): Cart
  static updateQuantity(cart: Cart, productId: string, quantity: number): Cart
  static clearCart(): Cart
  static calculateSubtotal(cart: Cart): number
}
```

#### `coupon-service.ts`
```typescript
export class CouponService {
  static async validateCoupon(code: string): Promise<Coupon>
  static applyCoupon(cart: Cart, coupon: Coupon): Cart
  static removeCoupon(cart: Cart, couponId: string): Cart
  static calculateDiscount(cart: Cart, coupons: Coupon[]): number
}
```

#### `price-service.ts`
```typescript
export class PriceService {
  static calculateTotal(cart: Cart, coupons: Coupon[], freight: number): number
  static calculateDiscounts(cart: Cart, coupons: Coupon[]): number
  static formatPrice(value: number): string
}
```

### **ETAPA 2: Criar Stores Especializadas**

#### `cart-store.ts` (usando Zustand ou Context API)
```typescript
interface CartStore {
  cart: Cart
  addProduct: (product: Product) => void
  removeProduct: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
}
```

#### `coupon-store.ts`
```typescript
interface CouponStore {
  coupons: Coupon[]
  loading: boolean
  addCoupon: (code: string) => Promise<void>
  removeCoupon: (couponId: string) => void
}
```

### **ETAPA 3: Refatorar Hooks**

#### `useCart.ts`
```typescript
export function useCart() {
  const { cart, addProduct, removeProduct, updateQuantity } = useCartStore()
  const { trackAddToCart, trackRemoveFromCart } = useTracking()
  
  return {
    cart,
    addProduct: (product) => {
      addProduct(product)
      trackAddToCart(product)
    },
    removeProduct,
    updateQuantity,
    itemCount: CartService.getItemCount(cart)
  }
}
```

#### `useCoupons.ts`
```typescript
export function useCoupons() {
  const { coupons, loading, addCoupon, removeCoupon } = useCouponStore()
  const { trackApplyCoupon, trackRemoveCoupon } = useTracking()
  
  return {
    coupons,
    loading,
    addCoupon: async (code) => {
      await addCoupon(code)
      trackApplyCoupon(code)
    },
    removeCoupon: (couponId) => {
      removeCoupon(couponId)
      trackRemoveCoupon(couponId)
    }
  }
}
```

### **ETAPA 4: Simplificar CartSummary**

#### `CartSummary.tsx` refatorado
```typescript
export function CartSummary() {
  const { cart } = useCart()
  const { coupons } = useCoupons()
  const { total, subtotal, discounts } = useCartSummary()
  
  return (
    <div className="cart-summary">
      <FreightInfo />
      <CouponSection />
      {discounts > 0 && <DiscountDisplay amount={discounts} />}
      <TotalDisplay amount={total} />
      <CheckoutActions />
    </div>
  )
}
```

## 🎯 Benefícios da Refatoração

### **1. Separação Clara de Responsabilidades**
- **Services**: Lógica de negócio pura
- **Stores**: Gerenciamento de estado
- **Hooks**: Interface entre UI e lógica
- **Components**: Apenas apresentação

### **2. Testabilidade**
- Services podem ser testados isoladamente
- Hooks podem ser testados com mocks
- Componentes podem ser testados com dados mock

### **3. Reutilização**
- Services podem ser usados em qualquer parte da aplicação
- Hooks podem ser combinados conforme necessário
- Componentes são mais focados e reutilizáveis

### **4. Manutenibilidade**
- Mudanças em lógica de negócio ficam isoladas nos services
- Mudanças de UI ficam isoladas nos componentes
- Estado é previsível e centralizado

### **5. Performance**
- Renders desnecessários podem ser evitados
- Estado pode ser otimizado com seletores
- Lazy loading de funcionalidades

## 📝 Ordem de Implementação

1. **Criar services** (sem breaking changes)
2. **Migrar lógica do context para services**
3. **Criar hooks especializados**
4. **Refatorar componentes para usar novos hooks**
5. **Remover código duplicado**
6. **Testes e validação**

## 🔍 Considerações Especiais

### **Migração Gradual**
- Manter compatibilidade durante a transição
- Implementar feature flags se necessário
- Testes em cada etapa

### **Performance**
- Considerar memoização onde apropriado
- Otimizar re-renders com React.memo
- Lazy loading de componentes pesados

### **Tipos TypeScript**
- Definir interfaces claras para cada camada
- Usar tipos para documentar contratos
- Validação em runtime onde necessário