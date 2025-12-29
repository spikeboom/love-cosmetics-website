# Deprecated - Codigo Legado

Este diretorio contem codigo que **NAO e mais usado** pelo Figma (novo design).

## Por que estes arquivos estao aqui?

O projeto passou por uma refatoracao em 29/12/2024 onde:

1. O novo design (Figma) foi implementado em route groups separados
2. Componentes antigos foram substituidos por novos
3. Hooks foram consolidados

## Posso deletar estes arquivos?

**SIM**, mas verifique primeiro:

1. Se nao ha imports restantes: `grep -r "from.*deprecated" src/`
2. Se o admin ainda precisa de algum componente
3. Se ha testes que dependem destes arquivos

## Estrutura

```
deprecated/
├── components/
│   ├── cart/          # Modal de carrinho antigo
│   ├── cliente/       # Forms de cliente antigos
│   ├── common/        # Componentes comuns nao usados
│   ├── forms/         # Forms antigos
│   ├── gallery/       # Galeria antiga
│   ├── layout/        # Header/Footer antigos
│   ├── product/       # Componentes de produto antigos
│   └── ui/            # UI components nao usados
└── hooks/             # Hooks substituidos
```

## Data de Deprecacao

29 de Dezembro de 2024

## Componentes que PERMANECERAM em uso

Os seguintes arquivos NAO foram movidos pois sao usados pelo Figma:

- `src/components/common/Context/context.jsx` - Context principal (sera refatorado)
- `src/components/cart/CartLoadingSkeleton.tsx` - Usado no carrinho Figma
- `src/components/cart/OutdatedCartAlert.tsx` - Usado no resumo do carrinho
