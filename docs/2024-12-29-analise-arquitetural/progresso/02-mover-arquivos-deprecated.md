# Etapa 02: Mover Arquivos para Deprecated

**Status:** CONCLUIDO
**Data:** 29/12/2024
**Risco:** Baixo

---

## Resumo

Movidos **85 arquivos** para a pasta `src/deprecated/`.

---

## Estrutura Criada

```
src/deprecated/
├── README.md                     # Documentacao
├── components/
│   ├── cart/                     # 17 arquivos
│   │   ├── AddToCart/
│   │   ├── CleanCart/
│   │   ├── FixedBuyButton/
│   │   └── ModalCart/            # Modal antigo completo
│   ├── cliente/                  # 2 arquivos
│   │   ├── EnderecoForm.tsx
│   │   └── EnderecosList.tsx
│   ├── common/                   # 12 arquivos
│   │   ├── Breadcrumbs/
│   │   ├── EventViewContent/
│   │   ├── FAQ/
│   │   ├── FloatingWhatsApp/
│   │   ├── HomeProduct/
│   │   ├── MoreLinks/
│   │   └── SocialMedia/
│   ├── forms/                    # 7 arquivos
│   │   ├── AcceptedCards/
│   │   ├── AvailablePoints/
│   │   ├── EmailSignup/
│   │   ├── PaymentIcons/
│   │   └── PaymentMethods/
│   ├── gallery/                  # 9 arquivos
│   ├── layout/                   # 10 arquivos
│   │   ├── Footer/
│   │   ├── FooterAlt/
│   │   ├── Header/
│   │   ├── HeaderIcons/
│   │   └── Menu/
│   ├── product/                  # 14 arquivos
│   │   ├── ActiveIngredients/
│   │   ├── CustomerReviews/
│   │   ├── HowToUse/
│   │   ├── ProductCarousel/
│   │   ├── ProductDescription/
│   │   ├── ProductImageCarousel/
│   │   ├── ProductInfoTop/
│   │   ├── Reviews/
│   │   └── Stickers/
│   └── ui/                       # 6 arquivos
│       ├── Badges/
│       ├── Icons/
│       └── Tabs/
└── hooks/                        # 9 arquivos
    ├── useCarousel.ts
    ├── useModalCart.ts
    ├── useModalCartSimplified.ts
    ├── useFreight.ts
    ├── useCartValidation.ts
    └── useModalCart/             # 4 sub-hooks
```

---

## Arquivos que PERMANECERAM em src/components/

Apenas arquivos usados pelo Figma ou pelo layout raiz:

```
src/components/
├── cart/
│   ├── CartLoadingSkeleton.tsx   # Usado em CartPageClient
│   └── OutdatedCartAlert.tsx     # Usado em CartSummary
├── common/
│   ├── Context/
│   │   ├── context.jsx           # Context principal (sera refatorado)
│   │   └── snack-provider.tsx    # Usado no layout raiz
│   └── LogErrorFront/
│       └── log-error-front.tsx   # Usado no layout raiz
└── figma-shared/
    ├── FreightOptions.tsx        # Componente compartilhado
    └── index.ts
```

---

## Arquivos que PERMANECERAM em src/hooks/

Apenas hooks usados pelo Figma checkout:

```
src/hooks/
└── checkout/
    ├── index.ts
    ├── useCreateOrder.ts         # Usado em PagamentoPageClient
    ├── usePagBankPayment.ts      # Usado em PagamentoPixReal, PagamentoCartaoReal
    └── useViaCep.ts              # Usado em EntregaPageClient
```

---

## Estatisticas

| Categoria | Antes | Depois | Movidos |
|-----------|-------|--------|---------|
| Components cart | 19 | 2 | 17 |
| Components cliente | 2 | 0 | 2 |
| Components common | 14 | 4 | 10 |
| Components forms | 7 | 0 | 7 |
| Components gallery | 9 | 0 | 9 |
| Components layout | 10 | 0 | 10 |
| Components product | 14 | 0 | 14 |
| Components ui | 6 | 0 | 6 |
| Hooks | 13 | 4 | 9 |
| **Total** | **94** | **10** | **84** |

---

## Verificacao

Build passou com sucesso apos atualizacao de todos os imports.

```bash
npm run build
# Build completado sem erros
```

---

## Imports Atualizados

Alem de mover os arquivos, foi necessario atualizar os imports em:

1. **src/app/(global)/** - Todas as paginas do layout antigo
2. **src/deprecated/** - Imports internos entre componentes deprecated
3. **src/components/common/Context/context.jsx** - Imports de hooks deprecated

**Importante:** O `context.jsx` permanece em `src/components/` pois ainda e usado pelo Figma. Sera refatorado na proxima etapa.

---

## Proximos Passos

1. ~~Rodar build para verificar imports quebrados~~ FEITO
2. ~~Atualizar imports quebrados~~ FEITO
3. Criar novos contextos especializados (Cart, Coupon, Shipping)
4. Migrar Figma para novos contextos
5. Eventualmente deletar pasta deprecated
