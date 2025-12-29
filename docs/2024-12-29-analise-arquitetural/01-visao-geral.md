# Analise Arquitetural - Foco no Figma

**Data:** 29 de Dezembro de 2024
**Projeto:** love-cosmetics-website
**Stack:** Next.js 15 + React 19 + TypeScript + Prisma + PagBank

---

## Sumario

1. [Escopo do Figma](#1-escopo-do-figma)
2. [Estrutura de Arquivos Figma](#2-estrutura-de-arquivos-figma)
3. [Dependencias Externas do Figma](#3-dependencias-externas-do-figma)
4. [Violacoes de SRP no Figma](#4-violacoes-de-srp-no-figma)
5. [Plano de Refatoracao](#5-plano-de-refatoracao)
6. [Arquivos Nao Usados pelo Figma](#6-arquivos-nao-usados-pelo-figma)

---

## 1. Escopo do Figma

### 1.1 Route Groups

O Figma utiliza 3 route groups no Next.js App Router:

```
src/app/
├── (figma-main)/      # Layout principal - Home, PDP, Carrinho, Conta
├── (figma-checkout)/  # Checkout isolado - Identificacao, Entrega, Pagamento
└── (figma-landing)/   # Landing pages - VIP
```

### 1.2 Total de Arquivos

| Route Group | Arquivos TSX/TS | Descricao |
|-------------|-----------------|-----------|
| **(figma-main)** | 45 | Layout principal com Header/Footer |
| **(figma-checkout)** | 22 | Checkout com stepper isolado |
| **(figma-landing)** | 4 | Landing pages sem layout |
| **Total** | **71** | Arquivos TypeScript |

### 1.3 Paginas Principais

**Figma-Main:**
- `/figma` - Home (index)
- `/figma/design` - Home alternativa
- `/figma/product/[slug]` - PDP (Product Detail Page)
- `/figma/cart` - Carrinho
- `/figma/search` - Busca
- `/figma/entrar` - Login
- `/figma/cadastrar` - Cadastro
- `/figma/esqueci-senha` - Recuperacao de senha
- `/figma/sair` - Logout
- `/figma/minha-conta/pedidos` - Meus Pedidos
- `/figma/minha-conta/pedidos/[id]` - Detalhes do Pedido

**Figma-Checkout:**
- `/figma/checkout` - Redirect para identificacao
- `/figma/checkout/identificacao` - Dados pessoais
- `/figma/checkout/entrega` - Endereco
- `/figma/checkout/pagamento` - PIX ou Cartao
- `/figma/checkout/confirmacao` - Sucesso

**Figma-Landing:**
- `/vip` - Landing VIP

---

## 2. Estrutura de Arquivos Figma

### 2.1 Figma-Main

```
src/app/(figma-main)/figma/
├── layout.tsx                    # Layout com Header + Footer
├── page.tsx                      # Home (index)
├── design/page.tsx               # Home alternativa
│
├── components/                   # Componentes compartilhados
│   ├── Header.tsx               # Cabecalho navegacao
│   ├── Footer.tsx               # Rodape
│   ├── CardProduto.tsx          # Card de produto
│   ├── BannerPrincipal.tsx      # Hero banner
│   ├── CertificadosSection.tsx  # Selos/certificados
│   ├── CategoriasSection.tsx    # Categorias carousel
│   ├── VitrineSection.tsx       # Vitrine de produtos
│   ├── MaisVendidosSection.tsx  # Mais vendidos
│   ├── YouMayLikeSection.tsx    # Recomendados
│   ├── Breadcrumbs.tsx          # Navegacao
│   ├── SearchFilters.tsx        # Filtros de busca
│   ├── ProductGrid.tsx          # Grid de produtos
│   ├── ProductFilters.tsx       # Filtros lateral
│   ├── ProductGallery.tsx       # Galeria imagens PDP
│   ├── ProductInfo.tsx          # Info do produto
│   ├── ProductActionButtons.tsx # Botoes adicionar
│   ├── FloatingProductCTA.tsx   # CTA flutuante
│   ├── ExpandableSection.tsx    # Acordeon
│   ├── NavigationArrows.tsx     # Setas navegacao
│   ├── ShippingCalculator.tsx   # Calculadora frete
│   └── FreightOptions.tsx       # Opcoes de frete
│
├── product/[slug]/               # PDP
│   ├── page.tsx                 # Server component
│   └── ProductPageClient.tsx    # Client component
│
├── cart/                         # Carrinho
│   ├── page.tsx                 # Server component
│   ├── CartPageClient.tsx       # Client component
│   ├── CartHeader.tsx           # Cabecalho carrinho
│   ├── CartProductsList.tsx     # Lista produtos
│   ├── CartProductCard.tsx      # Card produto
│   ├── CartCouponInput.tsx      # Input cupom
│   └── CartSummary.tsx          # Resumo valores
│
├── search/page.tsx               # Busca
├── entrar/page.tsx               # Login
├── cadastrar/page.tsx            # Cadastro
├── esqueci-senha/page.tsx        # Recuperar senha
├── sair/page.tsx                 # Logout
│
└── minha-conta/pedidos/          # Area logada
    ├── page.tsx                 # Lista pedidos
    ├── MeusPedidosClient.tsx    # Client component
    └── [id]/
        ├── page.tsx             # Detalhes pedido
        └── DetalhesPedidoClient.tsx
```

### 2.2 Figma-Checkout

```
src/app/(figma-checkout)/figma/checkout/
├── layout.tsx                    # Layout checkout (sem Header/Footer)
├── page.tsx                      # Redirect para identificacao
├── CheckoutHeader.tsx            # Header minimo
├── CheckoutFooter.tsx            # Footer minimo
├── CheckoutStepper.tsx           # Progresso visual
│
├── identificacao/
│   ├── page.tsx                 # Server component
│   └── IdentificacaoPageClient.tsx
│
├── entrega/
│   ├── page.tsx                 # Server component
│   └── EntregaPageClient.tsx
│
├── pagamento/
│   ├── page.tsx                 # Server component
│   ├── PagamentoPageClient.tsx  # Client principal
│   └── components/
│       ├── index.ts             # Re-exports
│       ├── types.ts             # Tipos locais
│       ├── BotaoVoltar.tsx
│       ├── QRCodePlaceholder.tsx
│       ├── PagamentoPix.tsx     # UI Pix
│       ├── PagamentoPixReal.tsx # Logica Pix
│       ├── PagamentoCartao.tsx  # UI Cartao
│       ├── PagamentoCartaoReal.tsx # Logica Cartao
│       ├── PagamentoSelecao.tsx # Seletor metodo
│       └── PagamentoResumo.tsx  # Resumo pedido
│
└── confirmacao/
    ├── page.tsx                 # Pagina sucesso
    └── ConfirmacaoStepper.tsx
```

### 2.3 Figma-Landing

```
src/app/(figma-landing)/
├── layout.tsx                    # Layout limpo (apenas fonts)
└── vip/
    ├── page.tsx                 # Server component
    └── VIPLandingClient.tsx     # Client component
```

---

## 3. Dependencias Externas do Figma

### 3.1 Resumo de Dependencias

O Figma depende de **poucos arquivos externos**. Aqui esta o mapeamento completo:

| Categoria | Arquivos Usados | Nao Usados |
|-----------|-----------------|------------|
| **Components** | 3 | 115+ |
| **Hooks** | 3 | 7 |
| **Libs** | 2 | 12 |
| **Utils** | 3 | - |
| **Modules** | 1 | - |
| **Contexts** | 2 | - |

### 3.2 Components Usados pelo Figma

```typescript
// Apenas 3 componentes de src/components/ sao usados:

// 1. Context principal (CRITICO)
import { useMeuContexto } from '@/components/common/Context/context';
// Usado em: Header, ShippingCalculator, ProductPageClient, CartPageClient,
//           entrar, cadastrar, sair, checkout/confirmacao, checkout/entrega,
//           checkout/pagamento, checkout/nova-senha

// 2. Skeleton de carregamento
import { CartLoadingSkeleton } from '@/components/cart/CartLoadingSkeleton';
// Usado em: CartPageClient

// 3. Alerta de carrinho desatualizado
import { OutdatedCartAlert } from '@/components/cart/OutdatedCartAlert';
// Usado em: CartSummary
```

### 3.3 Hooks Usados pelo Figma

```typescript
// Apenas 3 hooks de src/hooks/ sao usados:

// 1. Busca de CEP
import { useViaCep } from '@/hooks/checkout';
// Usado em: EntregaPageClient

// 2. Integracao PagBank
import { usePagBankPayment } from '@/hooks/checkout';
// Usado em: PagamentoPixReal, PagamentoCartaoReal

// 3. Criacao de pedido
import { useCreateOrder } from '@/hooks/checkout';
// Usado em: PagamentoPageClient
```

### 3.4 Libs Usadas pelo Figma

```typescript
// Apenas 2 libs de src/lib/ sao usadas:

// 1. Fontes (em todos os layouts)
import { fontClasses } from '@/lib/fonts';
// Usado em: figma-main/layout, figma-checkout/layout, figma-landing/layout

// 2. Validacao de checkout
import { identificacaoSchema, validacoes } from '@/lib/checkout/validation';
// Usado em: IdentificacaoPageClient
```

### 3.5 Utils Usados pelo Figma

```typescript
// 3 utils de src/utils/ sao usados:

// 1. Transformacao de produtos Strapi
import { transformProdutosStrapi } from '@/utils/transform-produtos-strapi';
// Usado em: VitrineSection, YouMayLikeSection, VIPLandingClient

// 2. Calculo de precos
import { calculateProductPrices } from '@/utils/calculate-prices';
// Usado em: ProductPageClient

// 3. Calculos de carrinho
import { getTipoDesconto } from '@/utils/cart-calculations';
// Usado em: CartSummary, checkout/entrega
```

### 3.6 Modules Usados pelo Figma

```typescript
// 1 module de src/modules/ e usado:

import { fetchProdutosForDesign, fetchProdutoBySlug } from '@/modules/produto/domain';
// Usado em: page.tsx (home), design/page.tsx, product/[slug]/page.tsx,
//           cart/page.tsx, minha-conta/pedidos/page.tsx, vip/page.tsx
```

### 3.7 Contexts Usados pelo Figma

```typescript
// 2 contexts sao usados:

// 1. Context principal (de components)
import { useMeuContexto } from '@/components/common/Context/context';
// Uso massivo em todo o Figma

// 2. Notificacoes
import { useNotifications } from '@/core/notifications/NotificationContext';
// Usado em: ProductPageClient
```

### 3.8 Cross-Figma Imports

Ha **1 import entre pastas Figma**:

```typescript
// De figma-checkout importando de figma-main:
import { FreightOptions } from '@/app/(figma-main)/figma/components/FreightOptions';
// Usado em: EntregaPageClient
```

**Recomendacao:** Mover `FreightOptions` para pasta compartilhada ou duplicar.

---

## 4. Violacoes de SRP no Figma

### 4.1 Violacao Critica: context.jsx

**Arquivo:** `src/components/common/Context/context.jsx`

Este e o arquivo mais critico pois e usado por **11 arquivos Figma** e possui **9 responsabilidades** misturadas:

| # | Responsabilidade | Deveria Estar Em |
|---|-----------------|------------------|
| 1 | Estado do carrinho | CartContext |
| 2 | Operacoes de carrinho | CartService |
| 3 | Estado de cupons | CouponContext |
| 4 | Validacao de cupons | CouponService |
| 5 | Calculo de totais | CartCalculationService |
| 6 | Estado de frete | ShippingContext |
| 7 | Calculo de frete | ShippingService |
| 8 | Persistencia localStorage | CartRepository |
| 9 | Tracking GTM | TrackingService |

**Plano de Divisao:**
```
context.jsx (monolitico)
    │
    ├── CartContext.tsx (estado puro)
    │   ├── items: CartItem[]
    │   ├── addItem()
    │   ├── removeItem()
    │   └── updateQuantity()
    │
    ├── CouponContext.tsx
    │   ├── coupons: Coupon[]
    │   ├── addCoupon()
    │   └── removeCoupon()
    │
    ├── ShippingContext.tsx
    │   ├── selectedOption: ShippingOption
    │   ├── cep: string
    │   └── options: ShippingOption[]
    │
    └── CartTotalsContext.tsx (derivado)
        ├── subtotal
        ├── discount
        ├── shipping
        └── total
```

### 4.2 Violacao Media: Hooks de Checkout

Os hooks `useCreateOrder`, `usePagBankPayment` e `useViaCep` estao bem isolados, mas:

**usePagBankPayment** faz muita coisa:
- Criptografia de cartao
- Criacao de pagamento PIX
- Criacao de pagamento Cartao
- Polling de status
- Geracao de QR Code

**Recomendacao:** Manter por enquanto, mas considerar dividir em:
- `useCardEncryption`
- `usePixPayment`
- `useCardPayment`
- `usePaymentPolling`

### 4.3 Componentes com Multiplas Responsabilidades

| Componente | Responsabilidades | Recomendacao |
|------------|-------------------|--------------|
| `ProductPageClient.tsx` | UI + Carrinho + Notificacoes | Extrair hook `useProductActions` |
| `CartPageClient.tsx` | UI + Validacao + Navegacao | Extrair hook `useCartPage` |
| `PagamentoPageClient.tsx` | UI + Pedido + Redirecionamento | Manter (fluxo linear) |

---

## 5. Plano de Refatoracao

### Fase 1: Preparacao (Baixo Risco)

| # | Tarefa | Impacto |
|---|--------|---------|
| 1.1 | Mover `FreightOptions` para pasta compartilhada | Elimina cross-import |
| 1.2 | Criar types centralizados para Figma | Organização |
| 1.3 | Documentar interfaces de dependencias | Clareza |

### Fase 2: Extracao de Contextos (Medio Risco)

| # | Tarefa | Impacto |
|---|--------|---------|
| 2.1 | Criar CartContext puro | Separa estado |
| 2.2 | Criar CouponContext | Isola cupons |
| 2.3 | Criar ShippingContext | Isola frete |
| 2.4 | Criar CartTotalsContext (derivado) | Calculos puros |
| 2.5 | Migrar Figma para novos contextos | Grande |

### Fase 3: Limpeza (Baixo Risco)

| # | Tarefa | Impacto |
|---|--------|---------|
| 3.1 | Mover arquivos nao usados para `/deprecated` | Organizacao |
| 3.2 | Remover codigo morto | Limpeza |
| 3.3 | Atualizar imports | Finalizacao |

---

## 6. Arquivos Nao Usados pelo Figma

### 6.1 Resumo

**Total de arquivos nao usados pelo Figma:** 150+

Estes arquivos podem ser movidos para uma pasta `/deprecated` ou `/legacy`:

### 6.2 Route Groups Inteiros

```
src/app/(global)/     # 33 arquivos - Layout antigo completo
src/app/(admin)/      # 6 arquivos - Painel administrativo
```

### 6.3 Components Nao Usados

```
src/components/
├── cart/
│   ├── AddToCart/
│   ├── CleanCart/
│   ├── FixedBuyButton/
│   └── ModalCart/          # 15 arquivos (modal antigo)
├── cliente/
│   ├── EnderecoForm.tsx
│   └── EnderecosList.tsx
├── common/
│   ├── Breadcrumbs/
│   ├── EventViewContent/
│   ├── FAQ/
│   ├── FloatingWhatsApp/
│   ├── HomeProduct/
│   ├── LogErrorFront/
│   ├── MoreLinks/
│   ├── SocialMedia/
│   └── snack-provider.tsx
├── forms/
│   ├── AcceptedCards/
│   ├── AvailablePoints/
│   ├── EmailSignup/
│   ├── PaymentIcons/
│   └── PaymentMethods/
├── gallery/              # 10 arquivos
├── layout/
│   ├── Footer/
│   ├── FooterAlt/
│   ├── Header/
│   ├── HeaderIcons/
│   └── Menu/
├── product/
│   ├── ActiveIngredients/
│   ├── CustomerReviews/
│   ├── HowToUse/
│   ├── ProductCarousel/
│   ├── ProductDescription/
│   ├── ProductImageCarousel/
│   ├── ProductInfoTop/
│   ├── Reviews/
│   └── Stickers/
└── ui/
    ├── Badges/
    ├── Icons/
    └── Tabs/
```

### 6.4 Hooks Nao Usados

```
src/hooks/
├── useCarousel.ts
├── useModalCart.ts
├── useModalCartSimplified.ts
├── useFreight.ts
├── useCartValidation.ts
└── useModalCart/           # 4 sub-hooks
    ├── core.ts
    ├── modal-state.ts
    ├── suggested-products.ts
    └── coupon-local.ts
```

### 6.5 Libs Nao Usadas

```
src/lib/
├── prisma.ts               # Backend only
├── bling/                  # 3 arquivos
├── cliente/                # 4 arquivos
├── strapi/                 # 3 arquivos
├── pedido/
│   └── validate-order.ts
└── pagbank/
    └── create-checkout-link.ts
```

### 6.6 Recomendacao de Estrutura Deprecated

```
src/deprecated/
├── README.md               # Explicacao do que esta aqui
├── app-global/            # Todo (global)
├── app-admin/             # Todo (admin)
├── components/            # Components nao usados
├── hooks/                 # Hooks nao usados
└── lib/                   # Libs nao usadas pelo Figma frontend
```

**Nota:** Alguns arquivos em `lib/` sao usados pelo backend (API routes), nao pelo Figma. Verificar antes de mover.

---

## Anexos

- [02-violacoes-srp.md](./02-violacoes-srp.md) - Detalhes das violacoes de SRP
- [03-interfaces-contratos.md](./03-interfaces-contratos.md) - Interfaces propostas
- [04-migracao-contextos.md](./04-migracao-contextos.md) - Plano de migracao de contextos

---

*Documento atualizado em 29/12/2024 - Foco no Figma*
