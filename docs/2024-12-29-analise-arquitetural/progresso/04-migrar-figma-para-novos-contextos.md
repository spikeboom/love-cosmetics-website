# Etapa 04: Migrar Figma para Novos Contextos

**Status:** CONCLUIDO
**Data:** 29/12/2024
**Risco:** Baixo (troca de imports apenas)

---

## Resumo

Migrados **11 arquivos** de `useMeuContexto` para os novos hooks especificos.

---

## Arquivos Migrados

### figma-main (7 arquivos)

| Arquivo | Antes | Depois |
|---------|-------|--------|
| `Header.tsx` | `useMeuContexto` | `useCart`, `useAuth` |
| `ShippingCalculator.tsx` | `useMeuContexto` | `useCart`, `useShipping` |
| `ProductPageClient.tsx` | `useMeuContexto` | `useCart` |
| `CartPageClient.tsx` | `useMeuContexto` | `useCart`, `useCoupon`, `useShipping`, `useCartTotals` |
| `entrar/page.tsx` | `useMeuContexto` | `useAuth` |
| `cadastrar/page.tsx` | `useMeuContexto` | `useAuth` |
| `sair/page.tsx` | `useMeuContexto` | `useAuth` |

### figma-checkout (4 arquivos)

| Arquivo | Antes | Depois |
|---------|-------|--------|
| `confirmacao/page.tsx` | `useMeuContexto` | `useAuth` |
| `nova-senha/page.tsx` | `useMeuContexto` | `useAuth` |
| `entrega/EntregaPageClient.tsx` | `useMeuContexto` | `useShipping` |
| `pagamento/PagamentoPageClient.tsx` | `useMeuContexto` | `useCart`, `useCoupon`, `useShipping`, `useCartTotals` |

---

## Padrao de Migracao

### Antes (monolitico)
```typescript
import { useMeuContexto } from "@/components/common/Context/context";

const { cart, cupons, freight, total, refreshAuth } = useMeuContexto();
```

### Depois (segmentado)
```typescript
import { useCart, useCoupon, useShipping, useCartTotals, useAuth } from "@/contexts";

const { cart } = useCart();
const { cupons } = useCoupon();
const { freightValue, hasCalculated } = useShipping();
const { total, descontos } = useCartTotals();
const { refreshAuth } = useAuth();
```

---

## Beneficios Imediatos

1. **Imports mais claros** - Cada componente importa apenas o que precisa
2. **Codigo mais legivel** - Fica obvio quais dependencias cada componente tem
3. **Preparacao para melhorias** - Re-renders otimizados quando trocar Provider

---

## Verificacao

```bash
npx tsc --noEmit
# Sem erros de TypeScript
```

---

## Proximos Passos

1. Trocar `MeuContextoProvider` por `ComposedProvider` nos layouts Figma
2. Testar funcionamento completo (carrinho, frete, cupom, checkout)
3. Eventualmente remover `context.jsx` legado

---

*Documento criado em 29/12/2024*
