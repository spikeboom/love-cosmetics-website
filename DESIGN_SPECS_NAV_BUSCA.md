# Especificações de Design - Nav Busca (Página de Busca e Categorias)

## Estrutura Geral da Página
- **Viewport**: 1440px (máximo)
- **Altura total**: 2303px
- **Background**: Branco (#FFFFFF)

---

## 1. HEADER (Reutilizando componente Header.tsx existente)
- **Altura**: 221px
- **Componente**: Header.tsx (já existe em /design)

---

## 2. BREADCRUMBS
- **Altura**: 40px
- **Padding**: 16px (todos os lados)
- **Background**: Transparente
- **Gap entre itens**: 8px
- **Alinhamento**: items-end (bottom alignment)

### Itens do Breadcrumb:
1. "lovecosmetics.com.br"
   - Font: Cera Pro Light, 12px
   - Cor: #000000
   - Underline: sim
   - Width: 122px
   - Height: 8px

2. Chevron Right Icon
   - Width: 8px
   - Height: 8px

3. "todos produtos"
   - Font: Cera Pro Light, 12px
   - Cor: #000000
   - Underline: sim
   - Width: 86px
   - Height: 8px

4. Chevron Right Icon
   - Width: 8px
   - Height: 8px

5. "manteiga" (dinâmico - categoria/produto)
   - Font: Cera Pro Light, 12px
   - Cor: #000000
   - SEM underline
   - Width: 52px
   - Height: 8px

---

## 3. TITLE HEADER (Seção de Título)
- **Altura**: 78px
- **Padding**: 16px
- **Background**: #FFFFFF
- **Gap**: 16px (flex-col)

### Title
- **Font**: Cera Pro Bold, 32px
- **Cor**: #000000
- **Text**: Dinâmica (ex: "Manteiga")
- **Height**: 21px

### Description (Body)
- **Font**: Cera Pro Light, 14px
- **Cor**: #000000
- **Text**: "Hidratação profunda, alívio das inflamações e rachaduras"
- **Height**: 9px
- **Width**: 1408px

---

## 4. MAIN CONTENT AREA
- **Height**: 1600px
- **Padding**: 16px
- **Layout**: flex gap-[16px] items-start

### 4.1 SIDEBAR - FILTROS (SearchFilters)
- **Width**: 220px
- **Height**: 603px
- **Background**: #FFFFFF
- **Layout**: flex-col gap-[10px]

#### Filtro 1: "Ordenar por"
- **Height**: 168px
- **Gap**: 16px

Header:
- **Font**: Cera Pro Bold, 20px
- **Cor**: #000000
- **Text**: "Ordenar por"

Menu Items (3 itens):
- Gap entre items: 47px
- **Font**: Cera Pro Light, 20px
- **Height**: cada item
- **Primeiro item**: Cor #ba7900 (Dourado escuro) - "Relevância" (ativo)
- **Outros items**: Cor #000000 - "Menor preço", "Maior preço"

#### Separador
- **Height**: 1px
- **Background**: #f8f3ed (Creme secundário)
- **Margin**: 10px 0

#### Filtro 2: "Filtrar por"
- **Height**: 414px
- **Gap**: 16px

Header:
- **Font**: Cera Pro Bold, 20px
- **Cor**: #000000
- **Text**: "Filtrar por"

Menu Items (9 itens):
- Gap entre items: 47px
- **Font**: Cera Pro Light, 20px
- **Primeiro item**: Cor #ba7900 (Dourado escuro) - "Filtro" (ativo, com ícone X)
- **Outros items**: Cor #000000 - "Filtro" (placeholder)

---

### 4.2 GRID DE PRODUTOS (ProductGrid)
- **Width**: 1172px
- **Height**: 1568px
- **Layout**: flex-col gap-[16px]

#### Product Cards Container
- **Width**: 1172px
- **Height**: 1504px
- **Gap**: 16px (horizontal e vertical)
- **Grid**: 3 colunas

##### Card de Produto
- **Width**: 380px
- **Height**: 364px
- **Quantidade**: 12 cards (4 linhas x 3 colunas)
- **Componente**: CardProduto.tsx (já existe, usar tipo "produto-completo")

Layout do grid:
```
Row 1: Cards [0,0] [0,1] [0,2]
Row 2: Cards [1,0] [1,1] [1,2]
Row 3: Cards [2,0] [2,1] [2,2]
Row 4: Cards [3,0] [3,1] [3,2]
```

Gaps:
- Horizontal gap: 16px
- Vertical gap: 380px (height do card)

#### Paginação
- **Posição**: abaixo do grid
- **Height**: 32px
- **Componente**: "Component paginação mobile"
- **Centered**: sim
- **Margin-top**: 16px

---

## 5. FOOTER (Reutilizando componente Footer.tsx existente)
- **Altura**: 364px
- **Componente**: Footer.tsx (já existe em /design)

---

## Tokens de Design Utilizados

### Cores
- Verde Principal: #254333
- Dourado Love: #e7a63a
- Dourado Escuro: #ba7900
- Preto: #000000
- Preto Rosé: #333333
- Creme Secundário: #f8f3ed
- Branco: #ffffff
- Verde Claro: #009142
- Vermelho Love: #b3261e

### Tipografia
- **Love Título H1**: Cera Pro Bold, 32px, 700
- **Love Título H3**: Cera Pro Bold, 20px, 700
- **Título H4**: Cera Pro Medium, 16px, 500
- **Love Texto 14**: Cera Pro Light, 14px, 300
- **Love Texto 12**: Cera Pro Light, 12px, 300

### Espaçamento Padrão
- 4px
- 8px
- 10px
- 12px
- 16px
- 32px

---

## Componentes a Criar

### 1. Breadcrumbs.tsx
- Props: items (array), currentPage (string)
- Reutilizável em múltiplas páginas

### 2. SearchFilters.tsx
- Props: categoria (string), filtroAtivo (string), onFiltroChange (function)
- Sidebar com seções de ordenação e filtros

### 3. ProductGrid.tsx
- Props: produtos (array), paginaAtual (number), totalPaginas (number)
- Grid com paginação

### 4. Página: src/app/(figma)/search/page.tsx
- Integra: Header, Breadcrumbs, SearchFilters, ProductGrid, Footer

---

## Nodes do Figma (IDs para referência)
- Frame principal: 81:6015
- Header: 81:6016
- Breadcrumbs: 81:6017
- Title header: 81:6024
- Sidebar filtros: 81:6034
- Product grid: 81:6039
- Footer: 81:6061
