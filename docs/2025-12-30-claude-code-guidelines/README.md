# Claude Code Guidelines - Love Cosmetics

> Guia de referencia para o Claude Code antes de implementar qualquer novidade no projeto.

## Leia Antes de Comecar

Este documento estabelece as **regras obrigatorias** para manter consistencia, qualidade e manutencao do codigo.

**IMPORTANTE:** Sempre consulte estes guias antes de criar novos arquivos ou modificar a arquitetura.

---

## Indice

| Arquivo | Descricao |
|---------|-----------|
| [01-arquitetura.md](./01-arquitetura.md) | Estrutura de pastas, route groups, providers |
| [02-padroes-codigo.md](./02-padroes-codigo.md) | TypeScript, React, naming conventions |
| [03-componentes.md](./03-componentes.md) | Como criar e organizar componentes |
| [04-hooks-contextos.md](./04-hooks-contextos.md) | Hooks customizados e contextos |
| [05-checklist.md](./05-checklist.md) | Checklist obrigatorio antes de finalizar |

---

## Principios Fundamentais

### 1. Single Responsibility Principle (SRP)

**NUNCA** crie arquivos com multiplas responsabilidades.

```
ERRADO: Componente com 400+ linhas fazendo UI + logica + fetch + formatacao
CERTO:  Componente de UI + hook separado + utils separados
```

### 2. Limite de Linhas por Arquivo

| Tipo | Maximo | Acao se Exceder |
|------|--------|-----------------|
| Componente UI | 200 linhas | Extrair subcomponentes |
| Hook | 150 linhas | Dividir em hooks menores |
| Utils | 100 linhas | Agrupar por dominio |
| Page | 150 linhas | Extrair para Client component |

### 3. DRY (Don't Repeat Yourself)

Antes de criar uma funcao, verifique:

1. `src/lib/formatters/` - Funcoes de formatacao
2. `src/components/figma-shared/icons/` - Icones compartilhados
3. `src/hooks/checkout/` - Hooks de checkout
4. `src/contexts/` - Contextos de estado

### 4. Preferencias de Importacao

```typescript
// 1. PREFERIR hooks especificos
import { useCart } from "@/contexts/cart";
import { useCoupon } from "@/contexts/coupon";

// 2. NAO usar o context legado
// import { useMeuContexto } from "@/components/common/Context/context";
```

---

## Stack Tecnologica

| Tecnologia | Versao | Uso |
|------------|--------|-----|
| Next.js | 15 | Framework React com App Router |
| React | 19 | UI Library |
| TypeScript | 5.x | Tipagem estatica |
| Prisma | 5.x | ORM para banco de dados |
| PagBank | API | Pagamentos PIX e Cartao |
| Tailwind CSS | 3.x | Estilizacao |

---

## Estrutura de Pastas Resumida

```
src/
  app/
    (figma)/           # Design principal (USAR ESTE)
      (main)/          # Paginas com Header/Footer
      (checkout)/      # Fluxo de checkout
      (landing)/       # Landing pages
    (global)/          # LEGADO - NAO USAR
    (admin)/           # Admin (separado)
    api/               # API Routes

  components/
    figma-shared/      # Componentes compartilhados Figma
      icons/           # Icones SVG
    cart/              # CartLoadingSkeleton, OutdatedCartAlert

  contexts/            # Contextos de estado
    cart/              # useCart
    coupon/            # useCoupon
    shipping/          # useShipping
    cart-totals/       # useCartTotals

  hooks/
    checkout/          # Hooks de checkout

  lib/
    formatters/        # Funcoes de formatacao

  deprecated/          # Codigo legado (NAO USAR)
```

---

## Regras de Ouro

1. **Sempre use TypeScript** - Nunca crie arquivos `.js` ou `.jsx`
2. **Sempre defina interfaces** - Nunca use `any`
3. **Sempre extraia logica** - Componentes sao para UI
4. **Sempre reutilize** - Verifique se ja existe antes de criar
5. **Sempre documente** - Funcoes complexas precisam de JSDoc

---

## Links Uteis

- [Analise Arquitetural](../2025-12-29-analise-arquitetural/01-visao-geral.md)
- [Plano de Segmentacao UI](../2025-12-29-analise-arquitetural/06-plano-segmentacao-ui-figma.md)
- [Progresso da Refatoracao](../2025-12-29-analise-arquitetural/progresso/README.md)

---

*Ultima atualizacao: 29/12/2025*
