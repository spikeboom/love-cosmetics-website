# Plano Conservador - Reorganização SEM Perda de Código

## 🎯 Objetivo
Reorganizar código em grupos por responsabilidade **mantendo 100% da lógica existente** - apenas mover código, não alterar.

## 📋 Estratégia: Extração Pura (Move Only)

### **FASE 1: Extrair Utilities (Sem Alterar Originais)**

#### 1.1 `src/utils/cart-calculations.ts`
```typescript
// MOVER EXATAMENTE estas funções do context.jsx:
// - linhas 267-325 (useEffect de cálculos)
// - linhas 47-59 (processProdutosComOuSemCupom)
// - linhas 143-155 (processProdutosRevert)

export const calculateCartTotals = (cart, cupons) => {
  // CÓDIGO EXATO das linhas 267-325 do context.jsx
}

export const processProdutosComOuSemCupom = (data, cupom) => {
  // CÓDIGO EXATO das linhas 47-59 do context.jsx
}

export const processProdutosRevert = (rawData) => {
  // CÓDIGO EXATO das linhas 143-155 do context.jsx
}
```

#### 1.2 `src/utils/coupon-operations.ts`
```typescript
// MOVER EXATAMENTE estas funções do context.jsx:
// - linhas 157-181 (handleCupom)
// - linhas 203-262 (handleAddCupom)

export const handleCupom = (cupom, cupons, setCupons, cart, setCart) => {
  // CÓDIGO EXATO das linhas 157-181 do context.jsx
}

export const handleAddCupom = async (codigo, cupons, setCupons, notify, closeSnackbar, handleCupom) => {
  // CÓDIGO EXATO das linhas 203-262 do context.jsx
}
```

#### 1.3 `src/utils/cart-operations.ts`
```typescript
// MOVER EXATAMENTE estas funções do context.jsx:
// - linhas 61-85 (addProductToCart)
// - linhas 87-95 (addQuantityProductToCart)
// - linhas 97-106 (subtractQuantityProductToCart)
// - linhas 108-114 (removeProductFromCart)
// - linhas 116-121 (clearCart)

export const addProductToCart = (product, cart, setCart, setLoadingAddItem, cupons, addProductEvent) => {
  // CÓDIGO EXATO das linhas 61-85 do context.jsx
}

export const addQuantityProductToCart = ({ product }, cart, setCart, addProductEvent) => {
  // CÓDIGO EXATO das linhas 87-95 do context.jsx
}

export const subtractQuantityProductToCart = ({ product }, cart, setCart, removeProductFromCart) => {
  // CÓDIGO EXATO das linhas 97-106 do context.jsx
}

export const removeProductFromCart = ({ product }, cart, setCart) => {
  // CÓDIGO EXATO das linhas 108-114 do context.jsx
}

export const clearCart = (setCart, setCupons) => {
  // CÓDIGO EXATO das linhas 116-121 do context.jsx
}
```

### **FASE 2: Extrair Componentes UI (Sem Alterar CartSummary)**

#### 2.1 `src/components/cart/CartSummary/FreightSection.tsx`
```typescript
// MOVER EXATAMENTE linhas 28-37 do CartSummary.tsx
export function FreightSection({ freteValue }) {
  return (
    <div className="my-[14px] flex flex-wrap items-center justify-between gap-x-[12px] gap-y-[8px]">
      {/* CÓDIGO EXATO das linhas 28-37 */}
    </div>
  );
}
```

#### 2.2 `src/components/cart/CartSummary/CouponInputSection.tsx`
```typescript
// MOVER EXATAMENTE linhas 38-90 do CartSummary.tsx
export function CouponInputSection({ 
  openCupom, setOpenCupom, cupom, setCupom, 
  handleAddCupomLocal, loadingCupom 
}) {
  return (
    <div className="my-[14px] flex flex-wrap items-center justify-between gap-x-[12px] gap-y-[8px]">
      {/* CÓDIGO EXATO das linhas 38-90 */}
    </div>
  );
}
```

#### 2.3 `src/components/cart/CartSummary/AppliedCouponsSection.tsx`
```typescript
// MOVER EXATAMENTE linhas 91-115 do CartSummary.tsx
export function AppliedCouponsSection({ cupons, removeCoupon }) {
  return (
    <>
      {cupons.length > 0 && (
        <div className="my-[14px] flex flex-wrap items-center justify-between gap-x-[12px] gap-y-[8px]">
          {/* CÓDIGO EXATO das linhas 91-115 */}
        </div>
      )}
    </>
  );
}
```

#### 2.4 `src/components/cart/CartSummary/TotalsSection.tsx`
```typescript
// MOVER EXATAMENTE linhas 116-129 do CartSummary.tsx
export function TotalsSection({ descontos, total }) {
  return (
    <>
      {descontos ? (
        <div className="my-[14px] flex items-center justify-between font-semibold">
          {/* CÓDIGO EXATO das linhas 116-125 */}
        </div>
      ) : null}
      <div className="my-[14px] flex items-center justify-between font-semibold">
        {/* CÓDIGO EXATO das linhas 126-129 */}
      </div>
    </>
  );
}
```

#### 2.5 `src/components/cart/CartSummary/CheckoutActions.tsx`
```typescript
// MOVER EXATAMENTE linhas 130-161 do CartSummary.tsx
export function CheckoutActions({ 
  setOpenCart, cart, setSidebarMounted 
}) {
  return (
    <div className="flex items-center justify-end gap-[8px]">
      {/* CÓDIGO EXATO das linhas 130-161 */}
    </div>
  );
}
```

### **FASE 3: Reorganizar useModalCart (Sem Perder Lógica)**

#### 3.1 `src/hooks/useModalCart/core.ts`
```typescript
// MOVER EXATAMENTE linhas 31-46 do useModalCart.ts (importações do contexto)
export function useCartCore() {
  const {
    sidebarMounted,
    setSidebarMounted,
    cart,
    // ... EXATA importação das linhas 32-46
  } = useMeuContexto();
  
  return { /* retornar exatamente as mesmas propriedades */ };
}
```

#### 3.2 `src/hooks/useModalCart/suggested-products.ts`
```typescript
// MOVER EXATAMENTE linhas 48-49 e 136-172 do useModalCart.ts
export function useSuggestedProducts(cart) {
  const [suggestedProductsRaw, setSuggestedProductsRaw] = useState<any[]>([]);
  const [loadingSuggested, setLoadingSuggested] = useState(false);
  
  // CÓDIGO EXATO das linhas 136-172
  
  return {
    suggestedProductsRaw,
    setSuggestedProductsRaw,
    loadingSuggested,
    setLoadingSuggested,
    suggestedProducts
  };
}
```

#### 3.3 `src/hooks/useModalCart/modal-state.ts`
```typescript
// MOVER EXATAMENTE linhas 53-77 do useModalCart.ts
export function useModalState() {
  const animationDuration = 700;
  const [openCart, setOpenCart] = useState(false);
  const [forRefreshPage, setForRefreshPage] = useState(false);
  
  // CÓDIGO EXATO dos useEffect das linhas 57-73
  
  return {
    animationDuration,
    openCart,
    setOpenCart,
    forRefreshPage,
    setForRefreshPage
  };
}
```

#### 3.4 `src/hooks/useModalCart/coupon-local.ts`
```typescript
// MOVER EXATAMENTE linhas 75-134 do useModalCart.ts
export function useCouponLocal(cupons, handleAddCupom, handleCupom) {
  const [cupom, setCupom] = useState("");
  const [loadingCupom, setLoadingCupom] = useState(false);
  const [openCupom, setOpenCupom] = useState(false);
  
  // CÓDIGO EXATO das funções handleAddCupomLocal e removeCoupon
  
  return {
    cupom,
    setCupom,
    loadingCupom,
    setLoadingCupom,
    openCupom,
    setOpenCupom,
    handleAddCupomLocal,
    removeCoupon
  };
}
```

### **FASE 4: Atualizar Arquivos Originais (Apenas Import/Export)**

#### 4.1 Atualizar `context.jsx`
```typescript
// MANTER: todas as importações originais
// MANTER: todas as interfaces e tipos originais
// MANTER: MeuContexto e MeuContextoProvider estrutura

// SUBSTITUIR: implementações das funções por imports dos utils
import { 
  addProductToCart,
  addQuantityProductToCart,
  subtractQuantityProductToCart,
  removeProductFromCart,
  clearCart
} from '@/utils/cart-operations';

import { handleCupom, handleAddCupom } from '@/utils/coupon-operations';
import { calculateCartTotals } from '@/utils/cart-calculations';

// DENTRO do Provider: usar as funções importadas ao invés das locais
// MANTER: exatamente a mesma interface do Provider (mesmos props, mesmos nomes)
```

#### 4.2 Atualizar `useModalCart.ts`
```typescript
// MANTER: todas as importações originais
// MANTER: todas as interfaces e tipos originais

// SUBSTITUIR: implementações por imports dos hooks separados
import { useCartCore } from '@/hooks/useModalCart/core';
import { useSuggestedProducts } from '@/hooks/useModalCart/suggested-products';
import { useModalState } from '@/hooks/useModalCart/modal-state';
import { useCouponLocal } from '@/hooks/useModalCart/coupon-local';

export function useModalCart() {
  const coreData = useCartCore();
  const suggestedData = useSuggestedProducts(coreData.cart);
  const modalData = useModalState();
  const couponData = useCouponLocal(coreData.cupons, coreData.handleAddCupom, coreData.handleCupom);
  
  // RETORNAR: exatamente o mesmo objeto das linhas 176-221
  return {
    // MANTER: exatamente a mesma estrutura de retorno
  };
}
```

#### 4.3 Atualizar `CartSummary.tsx`
```typescript
// MANTER: todas as importações originais
// ADICIONAR: imports dos novos componentes

import { FreightSection } from './FreightSection';
import { CouponInputSection } from './CouponInputSection';
import { AppliedCouponsSection } from './AppliedCouponsSection';
import { TotalsSection } from './TotalsSection';
import { CheckoutActions } from './CheckoutActions';

export function CartSummary(props) {
  // MANTER: exatamente as mesmas props
  return (
    <div className="px-[12px] pb-[12px] pt-[4px]">
      <FreightSection freteValue={props.freteValue} />
      <CouponInputSection {...props} />
      <AppliedCouponsSection cupons={props.cupons} removeCoupon={props.removeCoupon} />
      <TotalsSection descontos={props.descontos} total={props.total} />
      <CheckoutActions 
        setOpenCart={props.setOpenCart} 
        cart={props.cart} 
        setSidebarMounted={props.setSidebarMounted} 
      />
    </div>
  );
}
```

## ✅ Garantias do Plano Conservador

### **1. Zero Perda de Lógica**
- Cada linha de código é movida exatamente como está
- Nenhuma funcionalidade é alterada ou removida
- Mesmas props, mesmos nomes, mesmas interfaces

### **2. Zero Breaking Changes**
- Componentes que usam esses arquivos continuam funcionando
- Mesmas assinaturas de função
- Mesmos comportamentos

### **3. Reversibilidade 100%**
- Qualquer arquivo pode ser revertido ao original
- Git diff mostrará apenas movimentações
- Nenhuma lógica modificada

### **4. Testabilidade Preservada**
- Todos os testes existentes continuam passando
- Mesmos test-ids, mesmos comportamentos
- Mesma cobertura de testes

## 📊 Benefícios Mesmo Sendo Conservador

1. **Organização** - Código separado por responsabilidade
2. **Legibilidade** - Arquivos menores e mais focados  
3. **Manutenção** - Mais fácil encontrar código específico
4. **Reutilização** - Utils podem ser importados isoladamente
5. **Performance** - Imports mais específicos (tree-shaking)

## 🔄 Ordem de Execução Segura

1. Criar todos os novos arquivos utils/components
2. Testar imports funcionam
3. Atualizar um arquivo por vez
4. Testar após cada mudança
5. Commit após cada arquivo migrado
6. Possibilidade de reverter qualquer etapa

**Resumo: Este plano move 100% do código sem alterar nenhuma lógica - apenas reorganiza em arquivos menores por responsabilidade.**