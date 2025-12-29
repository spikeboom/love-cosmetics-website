# Etapa 05 - Unificar Route Groups Figma

**Status:** CONCLUIDO
**Data:** 29/12/2024

---

## Problema

Os 3 route groups Figma eram independentes, cada um com seu proprio `FigmaProvider`:

```
(figma-main)/figma/layout.tsx         -> FigmaProvider
(figma-checkout)/figma/checkout/layout.tsx -> FigmaProvider
(figma-landing)/layout.tsx            -> FigmaProvider
```

Isso causava:
- Duplicacao de Provider em 3 lugares
- Dificuldade de manutencao
- Inconsistencia potencial entre grupos

---

## Solucao

Unificar todos em um unico route group pai `(figma)` com sub-grupos para UI:

```
(figma)/
  layout.tsx                 -> FigmaProvider (UNICO)
  (main)/
    layout.tsx               -> Header + Footer (so UI)
    figma/...
  (checkout)/
    layout.tsx               -> CheckoutHeader + CheckoutFooter (so UI)
    figma/checkout/...
  (landing)/
    layout.tsx               -> Sem header/footer (so UI)
    vip/...
```

---

## Arquivos Criados

### 1. (figma)/layout.tsx
```tsx
import { fontClasses } from "@/lib/fonts";
import { FigmaProvider } from "@/contexts";

export default function FigmaRootLayout({ children }) {
  return (
    <FigmaProvider>
      <div className={`${fontClasses}`}>
        {children}
      </div>
    </FigmaProvider>
  );
}
```

### 2. (figma)/(main)/layout.tsx
```tsx
import { Header } from "./figma/components/Header";
import { Footer } from "./figma/components/Footer";

export default function FigmaMainLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
```

### 3. (figma)/(checkout)/layout.tsx
```tsx
import Script from "next/script";
import { CheckoutHeader } from "./figma/checkout/CheckoutHeader";
import { CheckoutFooter } from "./figma/checkout/CheckoutFooter";

export default function FigmaCheckoutLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Script src="https://assets.pagseguro.com.br/..." strategy="beforeInteractive" />
      <CheckoutHeader />
      <main className="flex-1 flex flex-col">{children}</main>
      <CheckoutFooter />
    </div>
  );
}
```

### 4. (figma)/(landing)/layout.tsx
```tsx
export default function FigmaLandingLayout({ children }) {
  return (
    <div className="min-h-screen">{children}</div>
  );
}
```

---

## Arquivos Removidos

- `src/app/(figma-main)/` - todo o diretorio
- `src/app/(figma-checkout)/` - todo o diretorio
- `src/app/(figma-landing)/` - todo o diretorio

---

## Arquivos Migrados para Novos Hooks

Os arquivos Figma foram atualizados de `useMeuContexto` para hooks especificos:

| Arquivo | Antes | Depois |
|---------|-------|--------|
| Header.tsx | `useMeuContexto` | `useCart`, `useAuth` |
| ShippingCalculator.tsx | `useMeuContexto` | `useCart`, `useShipping` |
| ProductPageClient.tsx | `useMeuContexto` | `useCart` |
| CartPageClient.tsx | `useMeuContexto` | `useCart`, `useCoupon`, `useShipping`, `useCartTotals` |

---

## Verificacao

```bash
# Limpar cache
rm -rf .next

# Verificar TypeScript
npx tsc --noEmit
# Resultado: Sem erros

# Verificar FigmaProvider unico
grep -r "FigmaProvider" src/app/(figma)
# Resultado: Apenas em (figma)/layout.tsx
```

---

## Beneficios

1. **Um unico FigmaProvider** - Contextos compartilhados entre todas as rotas
2. **Sub-layouts so UI** - Cada grupo tem seu header/footer especifico
3. **Manutencao simplificada** - Mudanca no provider afeta todas as rotas
4. **Hierarquia clara** - Next.js herda providers automaticamente
5. **Preparado para deprecar (global)** - Estrutura limpa quando remover legado
