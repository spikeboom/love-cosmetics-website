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
| 05 | Unificar route groups Figma | CONCLUIDO | [05-unificar-route-groups.md](./05-unificar-route-groups.md) |

---

## Etapas Pendentes

| # | Etapa | Status | Notas |
|---|-------|--------|-------|
| 06 | Remover context.jsx legado | PENDENTE | Aguardando deprecacao de (global) |

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
- CartContext, CouponContext, ShippingContext, CartTotalsContext
- Aproveitado AuthContext existente (mais completo)
- Adapter de compatibilidade `useMeuContextoAdapter`
- TypeScript compilando sem erros

### Etapa 04 - Migrar Figma
- Migrados 11 arquivos de `useMeuContexto` para hooks especificos
- 7 arquivos em figma-main, 4 arquivos em figma-checkout
- TypeScript compilando sem erros

### Etapa 05 - Unificar Route Groups
- Consolidado 3 route groups em 1 grupo pai `(figma)`
- FigmaProvider em unico lugar (raiz do grupo)
- Sub-grupos `(main)`, `(checkout)`, `(landing)` so com UI
- Removidos route groups antigos (figma-main, figma-checkout, figma-landing)

---

## Estrutura Final

```
src/
├── app/
│   ├── (figma)/              # UNIFICADO - Novo design
│   │   ├── layout.tsx        # FigmaProvider (UNICO)
│   │   ├── (main)/           # Header + Footer
│   │   │   ├── layout.tsx
│   │   │   └── figma/...
│   │   ├── (checkout)/       # CheckoutHeader + CheckoutFooter
│   │   │   ├── layout.tsx
│   │   │   └── figma/checkout/...
│   │   └── (landing)/        # Sem header/footer
│   │       ├── layout.tsx
│   │       └── vip/...
│   ├── (global)/             # Layout antigo (usa MeuContextoProvider)
│   ├── (admin)/              # Admin (separado)
│   ├── api/                  # API Routes
│   └── layout.tsx            # Root - AuthProvider
├── components/
│   ├── cart/                 # Componentes compartilhados
│   ├── common/Context/       # Context legado (sera removido)
│   └── figma-shared/         # Componentes compartilhados Figma
├── contexts/                 # Contextos segmentados
│   ├── cart/                 # useCart
│   ├── coupon/               # useCoupon
│   ├── shipping/             # useShipping
│   ├── cart-totals/          # useCartTotals
│   ├── compat/               # useMeuContextoAdapter
│   ├── AuthContext.tsx       # useAuth
│   ├── FigmaProvider.tsx     # Provider composto
│   ├── ComposedProvider.tsx  # Provider alternativo
│   └── index.ts              # Exports
├── deprecated/               # 85 arquivos legados
│   ├── components/
│   └── hooks/
└── hooks/
    └── checkout/             # Hooks de checkout
```

---

## Hierarquia de Providers

```
app/layout.tsx
└── AuthProvider (global para toda app)
    │
    ├── (figma)/layout.tsx
    │   └── FigmaProvider
    │       └── ShippingProvider
    │           └── CartProvider
    │               └── CouponProvider
    │                   └── CartTotalsProvider
    │                       │
    │                       ├── (main)/layout.tsx -> Header/Footer UI
    │                       ├── (checkout)/layout.tsx -> Checkout UI
    │                       └── (landing)/layout.tsx -> Landing UI
    │
    └── (global)/layout.tsx
        └── MeuContextoProvider (legado)
```

---

## Proximos Passos

1. **Quando (global) for deprecado:**
   - Remover `src/deprecated/`
   - Remover `src/components/common/Context/context.jsx`
   - Remover `src/contexts/compat/`
   - Limpar imports nao utilizados

2. **Melhorias futuras:**
   - Adicionar testes para os novos contextos
   - Documentar API dos hooks
   - Migrar componentes restantes de deprecated
