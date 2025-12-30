# 05 - Checklist de Implementacao

> Checklist obrigatorio antes de finalizar qualquer implementacao.

---

## Antes de Comecar

### Leitura Obrigatoria

- [ ] Li o [README.md](./README.md) dos guidelines
- [ ] Entendi a [arquitetura](./01-arquitetura.md) do projeto
- [ ] Conheco os [padroes de codigo](./02-padroes-codigo.md)

### Verificacoes Iniciais

- [ ] A feature vai no grupo `(figma)`? (NAO usar `(global)`)
- [ ] Ja existe algo similar que posso reutilizar?
- [ ] Preciso criar novo contexto ou hook existente resolve?

---

## Durante o Desenvolvimento

### Arquivos Novos

- [ ] Arquivo TypeScript (`.tsx` ou `.ts`, NUNCA `.js` ou `.jsx`)
- [ ] Nome em PascalCase para componentes: `ProductCard.tsx`
- [ ] Nome em camelCase para hooks: `useCart.ts`
- [ ] Arquivo no local correto na estrutura de pastas

### Componentes

- [ ] Menos de **200 linhas** (extrair se maior)
- [ ] Props tipadas com **interface**
- [ ] **Sem componentes inline** (definidos dentro de outros)
- [ ] **Sem dados hardcoded** (extrair para arquivo)
- [ ] **Sem logica complexa** no componente (extrair para hook)
- [ ] Usa `"use client"` apenas se necessario

### Hooks

- [ ] Nome comeca com **"use"**
- [ ] Menos de **150 linhas**
- [ ] Callbacks com **useCallback**
- [ ] Valores derivados com **useMemo**
- [ ] Interface de retorno definida

### Imports

- [ ] Usando **path aliases** (`@/contexts`, `@/lib`, etc)
- [ ] **NAO** importando de `useMeuContexto` (usar hooks especificos)
- [ ] Usando **formatters** de `@/lib/formatters`
- [ ] Usando **icones** de `@/components/figma-shared/icons`
- [ ] Ordem de imports correta (React > Next > Contexts > Hooks > Utils > Components > Types)

### Estilizacao

- [ ] Usando **Tailwind CSS** (nao CSS modules)
- [ ] Classes em ordem (layout > spacing > sizing > typography > colors > effects)
- [ ] Cores do design system (pink, amber, gray)

---

## Antes de Finalizar

### Qualidade de Codigo

- [ ] Sem `any` no TypeScript
- [ ] Sem `console.log` esquecidos
- [ ] Sem codigo comentado
- [ ] Sem TODO sem contexto

### Verificacao de Build

```bash
# Rodar antes de finalizar
npx tsc --noEmit
```

- [ ] TypeScript compila sem erros
- [ ] Sem warnings criticos

### Verificacao de Lint

```bash
# Se configurado
npm run lint
```

- [ ] Sem erros de lint

---

## Checklist por Tipo de Tarefa

### Nova Pagina

- [ ] Server component em `page.tsx`
- [ ] Client component separado se precisar de interatividade
- [ ] Pasta `components/` se tiver subcomponentes
- [ ] Arquivo `types.ts` se tiver interfaces locais

### Novo Componente Compartilhado

- [ ] Pasta correta (`figma-shared/` ou componente local)
- [ ] Export no `index.ts` da pasta
- [ ] Props tipadas com interface exportada

### Novo Hook

- [ ] Arquivo em `src/hooks/` ou subpasta
- [ ] Export no `index.ts` da pasta
- [ ] Interface de retorno definida e exportada

### Novo Contexto

- [ ] Pasta propria em `src/contexts/`
- [ ] Arquivos: `types.ts`, `[Nome]Context.tsx`, `index.ts`
- [ ] Provider com verificacao de null
- [ ] Hook com erro se fora do Provider
- [ ] Adicionado ao `FigmaProvider` se necessario

### Nova Funcao de Formatacao

- [ ] Verificar se ja existe em `src/lib/formatters/`
- [ ] Adicionar no arquivo correto (currency, date, document, contact, payment)
- [ ] Funcao pura (sem side effects)
- [ ] Export no `index.ts`

### Novo Icone

- [ ] Verificar se ja existe em `src/components/figma-shared/icons/`
- [ ] SVG otimizado (sem metadados desnecessarios)
- [ ] Props `className` e `variant` se aplicavel
- [ ] Export no `index.ts`

---

## Red Flags - NAO Fazer

### Estrutura

- [ ] **NAO** criar arquivos em `(global)` - usar `(figma)`
- [ ] **NAO** criar arquivos `.js` ou `.jsx` - usar TypeScript
- [ ] **NAO** usar imports relativos longos - usar aliases

### Codigo

- [ ] **NAO** usar `any` - tipar corretamente
- [ ] **NAO** usar `useMeuContexto` - usar hooks especificos
- [ ] **NAO** criar componentes com 300+ linhas - extrair
- [ ] **NAO** duplicar funcoes de formatacao - usar `@/lib/formatters`
- [ ] **NAO** duplicar icones SVG - usar `@/components/figma-shared/icons`

### Contextos

- [ ] **NAO** criar contexto monolitico - separar responsabilidades
- [ ] **NAO** esquecer `useMemo` no value do Provider
- [ ] **NAO** esquecer `useCallback` nos handlers

---

## Metricas de Qualidade

### Limites de Linhas

| Tipo | Maximo | Acao |
|------|--------|------|
| Componente | 200 | Extrair subcomponentes |
| Hook | 150 | Dividir em hooks menores |
| Utils | 100 | Agrupar por dominio |
| Page | 150 | Extrair para Client component |

### Indicadores de Problema

| Sinal | Significado |
|-------|-------------|
| >5 useState | Extrair para hook |
| >3 useEffect | Revisar necessidade |
| >10 props | Considerar composicao |
| Imports de 3+ contextos | Verificar SRP |

---

## Template de PR/Commit

### Commit Message

```
tipo(escopo): descricao curta

- Detalhe 1
- Detalhe 2

Refs: #issue
```

Tipos: `feat`, `fix`, `refactor`, `docs`, `style`, `test`, `chore`

### Exemplo

```
feat(checkout): adicionar validacao de CPF

- Extrair funcao formatCPF para lib/formatters
- Adicionar validacao de checksum
- Criar hook useIdentificacaoForm

Refs: #123
```

---

## Links Rapidos

| Recurso | Localizacao |
|---------|-------------|
| Formatters | `src/lib/formatters/` |
| Icones | `src/components/figma-shared/icons/` |
| Contextos | `src/contexts/` |
| Hooks checkout | `src/hooks/checkout/` |
| Guidelines | `docs/claude-code-guidelines/` |
| Analise arquitetural | `docs/2025-12-29-analise-arquitetural/` |

---

*Ultima atualizacao: 29/12/2025*
