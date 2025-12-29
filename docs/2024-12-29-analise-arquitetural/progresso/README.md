# Progresso da Refatoracao

**Inicio:** 29/12/2024

---

## Etapas Concluidas

| # | Etapa | Status | Arquivo |
|---|-------|--------|---------|
| 01 | Resolver import cruzado FreightOptions | CONCLUIDO | [01-import-cruzado-freight-options.md](./01-import-cruzado-freight-options.md) |
| 02 | Mover arquivos para deprecated | CONCLUIDO | [02-mover-arquivos-deprecated.md](./02-mover-arquivos-deprecated.md) |
| 03 | Criar contextos especializados | CONCLUIDO | [03-criar-contextos-especializados.md](./03-criar-contextos-especializados.md) |
| 04 | Migrar Figma para novos contextos | CONCLUIDO | [04-migrar-figma-para-novos-contextos.md](./04-migrar-figma-para-novos-contextos.md) |

---

## Etapas Pendentes

| # | Etapa | Status | Arquivo |
|---|-------|--------|---------|
| 05 | Trocar Provider nos layouts | PENDENTE | - |
| 06 | Remover context.jsx legado | PENDENTE | - |

---

## Resumo das Mudancas

### Etapa 01 - FreightOptions
- Criado `src/components/figma-shared/` para componentes compartilhados
- Movido `FreightOptions.tsx` para pasta compartilhada
- Eliminado import cruzado entre route groups Figma

### Etapa 02 - Deprecated
- Criado `src/deprecated/` com 85 arquivos movidos
- Atualizado todos os imports em `(global)` e `deprecated`
- Build passando com sucesso

### Etapa 03 - Contextos Especializados
- Criado `src/contexts/` com 5 contextos segmentados
- CartContext, CouponContext, ShippingContext, AuthContext, CartTotalsContext
- Adapter de compatibilidade `useMeuContextoAdapter`
- TypeScript compilando sem erros

### Etapa 04 - Migrar Figma
- Migrados 11 arquivos de `useMeuContexto` para hooks especificos
- 7 arquivos em figma-main, 4 arquivos em figma-checkout
- TypeScript compilando sem erros

---

## Estrutura Atual

```
src/
├── app/
│   ├── (figma-main)/      # Novo design - FOCO
│   ├── (figma-checkout)/  # Checkout novo - FOCO
│   ├── (figma-landing)/   # Landing pages - FOCO
│   ├── (global)/          # Layout antigo (usa deprecated)
│   ├── (admin)/           # Admin (separado)
│   └── api/               # API Routes (inalterado)
├── components/
│   ├── cart/              # 2 arquivos usados pelo Figma
│   ├── common/Context/    # Context principal (sera substituido)
│   └── figma-shared/      # Componentes compartilhados Figma
├── contexts/              # NOVO - Contextos segmentados
│   ├── cart/              # useCart
│   ├── coupon/            # useCoupon
│   ├── shipping/          # useShipping
│   ├── auth/              # useAuth
│   ├── cart-totals/       # useCartTotals
│   └── compat/            # useMeuContextoAdapter
├── deprecated/            # 85 arquivos movidos
│   ├── components/
│   └── hooks/
└── hooks/
    └── checkout/          # 3 hooks usados pelo Figma
```
