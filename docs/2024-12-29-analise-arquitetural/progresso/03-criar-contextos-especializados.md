# Etapa 03: Criar Contextos Especializados

**Status:** CONCLUIDO
**Data:** 29/12/2024
**Risco:** Baixo (codigo em paralelo, sem quebrar existente)

---

## Resumo

Criados **5 contextos especializados** + **1 adapter de compatibilidade** para substituir o `context.jsx` monolitico.

---

## Estrutura Criada

```
src/contexts/
├── index.ts                      # Re-exports
├── ComposedProvider.tsx          # Provider composto
│
├── cart/
│   ├── index.ts
│   ├── types.ts                  # CartProduct, CartContextType
│   └── CartContext.tsx           # useCart
│
├── coupon/
│   ├── index.ts
│   ├── types.ts                  # Coupon, CouponContextType
│   └── CouponContext.tsx         # useCoupon
│
├── shipping/
│   ├── index.ts
│   ├── types.ts                  # FreightService, ShippingContextType
│   └── ShippingContext.tsx       # useShipping
│
├── auth/
│   ├── index.ts
│   ├── types.ts                  # AuthContextType
│   └── AuthContext.tsx           # useAuth
│
├── cart-totals/
│   ├── index.ts
│   ├── types.ts                  # CartTotalsContextType
│   └── CartTotalsContext.tsx     # useCartTotals
│
└── compat/
    ├── index.ts
    └── useMeuContextoAdapter.ts  # Compatibilidade com useMeuContexto
```

---

## Mapeamento: context.jsx -> Novos Contextos

| Responsabilidade Original | Novo Contexto | Hook |
|---------------------------|---------------|------|
| cart, setCart, addProductToCart, etc | CartContext | `useCart()` |
| cupons, handleCupom, handleAddCupom | CouponContext | `useCoupon()` |
| freight (cep, calcular, etc) | ShippingContext | `useShipping()` |
| isLoggedIn, userName, refreshAuth | AuthContext | `useAuth()` |
| total, descontos, cartValidation | CartTotalsContext | `useCartTotals()` |

---

## Como Usar

### Opcao 1: Usar Adapter de Compatibilidade (migracao gradual)

```typescript
// Troca apenas o import, codigo funciona igual
// ANTES:
import { useMeuContexto } from '@/components/common/Context/context';

// DEPOIS:
import { useMeuContextoAdapter as useMeuContexto } from '@/contexts/compat';

// Uso permanece identico
const { cart, addProductToCart, total } = useMeuContexto();
```

### Opcao 2: Usar Hooks Especificos (recomendado)

```typescript
import { useCart, useCoupon, useShipping, useAuth, useCartTotals } from '@/contexts';

function MeuComponente() {
  // Usa apenas o que precisa
  const { cart, addProductToCart } = useCart();
  const { cupons, handleAddCupom } = useCoupon();
  const { total, descontos } = useCartTotals();

  // Re-renders apenas quando o contexto especifico muda
}
```

### Opcao 3: Usar ComposedProvider no Layout

```typescript
// src/app/(figma-main)/figma/layout.tsx
import { ComposedProvider } from '@/contexts';

export default function FigmaLayout({ children }) {
  return (
    <ComposedProvider>
      <Header />
      {children}
      <Footer />
    </ComposedProvider>
  );
}
```

---

## Beneficios

| Aspecto | context.jsx (antes) | Novos Contextos (depois) |
|---------|---------------------|--------------------------|
| Responsabilidades | 9 misturadas | 1 por contexto |
| Re-renders | Qualquer mudanca re-renderiza tudo | Apenas o contexto afetado |
| Testabilidade | Dificil | Facil (isolado) |
| Manutencao | "Onde esta o bug?" | "Esta no CartContext" |
| Linhas por arquivo | ~800 | ~50-100 |

---

## Verificacao

```bash
npx tsc --noEmit
# Sem erros de TypeScript
```

---

## Proximos Passos

1. **Migrar Figma gradualmente:**
   - Trocar `useMeuContexto` por `useMeuContextoAdapter` (1 linha)
   - Ou migrar para hooks especificos (melhor performance)

2. **Trocar o Provider no layout:**
   - Substituir `MeuContextoProvider` por `ComposedProvider`

3. **Eventualmente remover:**
   - `src/components/common/Context/context.jsx`
   - `src/contexts/compat/useMeuContextoAdapter.ts`

---

## Arquivos que Precisam Migrar

Os 11 arquivos Figma que usam `useMeuContexto`:

```
figma-main (7):
├── figma/components/Header.tsx
├── figma/components/ShippingCalculator.tsx
├── figma/product/[slug]/ProductPageClient.tsx
├── figma/cart/CartPageClient.tsx
├── figma/entrar/page.tsx
├── figma/cadastrar/page.tsx
└── figma/sair/page.tsx

figma-checkout (4):
├── figma/checkout/confirmacao/page.tsx
├── figma/checkout/entrega/EntregaPageClient.tsx
├── figma/checkout/pagamento/PagamentoPageClient.tsx
└── figma/checkout/nova-senha/page.tsx (se existir)
```

---

*Documento criado em 29/12/2024*
