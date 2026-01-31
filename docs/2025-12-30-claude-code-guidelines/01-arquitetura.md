# 01 - Arquitetura do Projeto

> Entenda a estrutura do projeto antes de fazer qualquer alteracao.

---

## Route Groups (App Router)

O Next.js 15 usa App Router com route groups. O projeto tem a seguinte organizacao:

### Grupo Principal: `(figma)`

**ESTE E O GRUPO ATIVO. Todas as novas features devem ser criadas aqui.**

```
src/app/(figma)/
  layout.tsx              # FigmaProvider (contextos)

  (main)/                 # Paginas com Header + Footer
    layout.tsx            # Layout com Header/Footer
    figma/
      page.tsx            # Home
      product/[slug]/     # PDP
      cart/               # Carrinho
      search/             # Busca
      entrar/             # Login
      cadastrar/          # Cadastro
      minha-conta/        # Area logada

  (checkout)/             # Checkout isolado
    layout.tsx            # CheckoutHeader/Footer
    figma/checkout/
      identificacao/      # Dados pessoais
      entrega/            # Endereco
      pagamento/          # PIX ou Cartao
      confirmacao/        # Sucesso

  (landing)/              # Landing pages sem layout
    layout.tsx            # Minimo (apenas fonts)
    vip/                  # Landing VIP
```

### Grupos Legados (NAO USAR)

```
src/app/(global)/         # Layout antigo - NAO CRIAR NADA AQUI
src/deprecated/           # Codigo morto - NAO USAR
```

---

## Hierarquia de Providers

```
app/layout.tsx
  AuthProvider (global para toda app)
    |
    +-- (figma)/layout.tsx
    |     FigmaProvider
    |       ShippingProvider
    |         CartProvider
    |           CouponProvider
    |             CartTotalsProvider
    |               |
    |               +-- (main)/    -> Header/Footer
    |               +-- (checkout)/ -> Checkout UI
    |               +-- (landing)/  -> Landing UI
    |
    +-- (global)/layout.tsx
          MeuContextoProvider (LEGADO)
```

### Usando os Contextos

```typescript
// CERTO - Usar hooks especificos
import { useCart } from "@/contexts/cart";
import { useCoupon } from "@/contexts/coupon";
import { useShipping } from "@/contexts/shipping";
import { useCartTotals } from "@/contexts/cart-totals";
import { useAuth } from "@/contexts/AuthContext";

function MeuComponente() {
  const { items, addItem, removeItem } = useCart();
  const { coupons, addCoupon } = useCoupon();
  const { selected: frete } = useShipping();
  const { total, discount } = useCartTotals();
  const { user, isLogged } = useAuth();
}

// ERRADO - NAO usar o context legado
// import { useMeuContexto } from "@/components/common/Context/context";
```

---

## Estrutura de Pastas por Dominio

### Componentes

```
src/components/
  figma-shared/           # Componentes compartilhados entre route groups
    icons/                # Icones SVG (VerifiedIcon, ChevronRightIcon, etc)
    FreightOptions.tsx    # Opcoes de frete
  cart/
    CartLoadingSkeleton.tsx
    OutdatedCartAlert.tsx
```

### Contextos

```
src/contexts/
  cart/
    CartContext.tsx       # Provider + Context
    types.ts              # Interfaces
    index.ts              # Exports
  coupon/
    CouponContext.tsx
    types.ts
    index.ts
  shipping/
    ShippingContext.tsx
    types.ts
    index.ts
  cart-totals/
    CartTotalsContext.tsx
    types.ts
    index.ts
  AuthContext.tsx         # Autenticacao (separado)
  FigmaProvider.tsx       # Provider composto
  index.ts                # Re-exports
```

### Hooks

```
src/hooks/
  checkout/
    index.ts              # Re-exports
    useViaCep.ts          # Busca CEP
    usePagBankPayment.ts  # Pagamentos PagBank
    useCreateOrder.ts     # Criacao de pedido
    useIdentificacaoForm.ts # Formulario identificacao
```

### Libs (Utilitarios)

```
src/lib/
  formatters/
    index.ts              # Re-exports
    currency.ts           # formatPrice, formatCurrency
    date.ts               # formatDate, formatDateTime
    document.ts           # formatCPF, formatCNPJ
    contact.ts            # formatTelefone, formatCEP
    payment.ts            # formatCardNumber, formatValidade
  fonts.ts                # Configuracao de fontes
  checkout/
    validation.ts         # Schemas Zod
```

---

## Organizacao de Componentes por Pagina

### Regra Geral

Cada pagina complexa deve ter sua pasta `components/`:

```
pagina/
  page.tsx               # Server Component (fetch de dados)
  PaginaClient.tsx       # Client Component (interatividade)
  components/
    index.ts             # Re-exports
    types.ts             # Interfaces locais
    ComponenteA.tsx
    ComponenteB.tsx
```

### Exemplos

```
checkout/confirmacao/
  page.tsx               # Orquestrador (~247 linhas)
  ConfirmacaoStepper.tsx
  components/
    index.ts
    types.ts             # PedidoStatus, PedidoDetalhes
    LoadingState.tsx     # Tela de loading
    ErrorState.tsx       # Tela de erro
    SuccessState.tsx     # Resumo do pedido
    AccountForm.tsx      # Formulario de conta

product/[slug]/
  page.tsx               # Server component
  ProductPageClient.tsx  # Client component
  components/
    ProductGallery.tsx   # Galeria de imagens
    ProductFilters.tsx   # Filtros acordeon
    useShareProduct.ts   # Hook de compartilhamento
```

---

## Fluxo de Dados

### 1. Server Components (Fetch)

```typescript
// page.tsx - Server Component
export default async function ProductPage({ params }) {
  // Fetch no servidor
  const produto = await fetchProdutoBySlug(params.slug);

  // Passa para Client Component
  return <ProductPageClient product={produto} />;
}
```

### 2. Client Components (Interatividade)

```typescript
"use client";

// ProductPageClient.tsx - Client Component
export function ProductPageClient({ product }) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);

  // Interatividade no cliente
  return <div>...</div>;
}
```

### 3. Contextos (Estado Global)

```
Usuario adiciona produto
    |
    v
CartContext.addItem()
    |
    v
CartTotalsContext recalcula automaticamente
    |
    v
Header mostra quantidade atualizada
```

---

## Regras de Importacao

### Ordem de Imports

```typescript
// 1. React/Next
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// 2. Contextos
import { useCart } from "@/contexts/cart";

// 3. Hooks
import { useViaCep } from "@/hooks/checkout";

// 4. Libs/Utils
import { formatPrice, formatCPF } from "@/lib/formatters";

// 5. Componentes compartilhados
import { VerifiedIcon } from "@/components/figma-shared/icons";

// 6. Componentes locais
import { ProductGallery } from "./components";

// 7. Tipos
import type { Product } from "@/types";
```

### Path Aliases

```typescript
// CERTO - Usar aliases
import { useCart } from "@/contexts/cart";
import { formatPrice } from "@/lib/formatters";

// ERRADO - Caminhos relativos longos
import { useCart } from "../../../contexts/cart";
```

---

## Proximos Passos

Leia [02-padroes-codigo.md](./02-padroes-codigo.md) para entender as convencoes de codigo.
