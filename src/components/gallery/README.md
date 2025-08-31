# Galeria de Produtos Hierárquica

Esta galeria foi criada usando os dados dos arquivos de cache do Amazon scraping, integrados com as URLs do Strapi para exibir uma galeria completa de produtos cosméticos **organizados em uma estrutura hierárquica de categorias e subcategorias**.

## Funcionalidades

### 🎯 Principais recursos
- **Navegação hierárquica**: Navegue por categorias e subcategorias em uma árvore expansível
- **Filtros inteligentes**: Filtre produtos por categoria principal, subcategoria ou ambos
- **Breadcrumb navigation**: Visualize e navegue pela hierarquia atual
- **Busca inteligente**: Busque por nome do produto, categoria ou subcategoria
- **Ordenação**: Ordene por nome (A-Z) ou data de adição
- **Visualização**: Alterne entre vista em grid e lista
- **Modal interativo**: Visualize todas as imagens do produto em tela cheia
- **Estatísticas hierárquicas**: Veja estatísticas organizadas por categoria/subcategoria
- **URLs dinâmicas**: Acesse categorias e subcategorias via URLs amigáveis

### 📊 Dados utilizados
- **upload_urls_cache.json**: Contém produtos com URLs do Strapi já processadas
- **processing_cache.json**: Dados originais com URLs da Amazon (backup)

### 🏗️ Componentes

#### ProductGallery.tsx
Componente principal da galeria com:
- Grid responsivo de produtos
- Filtros hierárquicos
- Integração com modal de detalhes

#### CategoryNavigation.tsx
Navegação hierárquica lateral com:
- Árvore expansível de categorias
- Contadores de produtos por categoria/subcategoria
- Seleção de categoria e subcategoria

#### CategoryBreadcrumb.tsx
Breadcrumb de navegação mostrando:
- Caminho hierárquico atual
- Links clicáveis para navegar
- Contador de produtos filtrados

#### ProductModal.tsx
Modal para visualização detalhada:
- Carrossel de imagens
- Navegação por miniaturas
- Detalhes do produto

#### GalleryNavigation.tsx
Navegação superior da página

#### GalleryStats.tsx
Componente de estatísticas hierárquicas mostrando:
- Total de categorias, subcategorias, produtos e imagens
- Top 10 subcategorias por número de produtos

### 🎨 Categorias disponíveis

A galeria suporta 30 categorias organizadas em:

**Maquiagem:**
- Maquiagem Rosto
- Maquiagem Olhos  
- Maquiagem Lábios
- Maquiagem Kits e Paletas

**Skincare:**
- Skincare Limpeza
- Skincare Hidratação
- Skincare Proteção Solar
- Skincare Anti-idade e Tratamentos

**Cabelos:**
- Cabelos Shampoos e Condicionadores
- Cabelos Máscaras e Tratamentos
- Cabelos Finalizadores
- Cabelos Coloração

**Perfumaria:**
- Perfumaria Perfumes Femininos
- Perfumaria Perfumes Masculinos
- Perfumaria Unissex
- Perfumaria Body Splash e Colônias

**Corpo & Banho:**
- Corpo & Banho Hidratantes
- Corpo & Banho Esfoliantes
- Corpo & Banho Óleos Corporais
- Corpo & Banho Sabonetes

**Cuidados Específicos:**
- Cuidados Específicos Antissinais
- Cuidados Específicos Acne e Oleosidade
- Cuidados Específicos Manchas e Uniformização
- Cuidados Específicos Unhas e Cutículas

**Produtos Naturais:**
- Maquiagem e Skincare Natural Veganos
- Maquiagem e Skincare Natural Cruelty-Free
- Maquiagem e Skincare Natural Orgânicos

**Kits e Combos:**
- Kits e Combos Skincare Completo
- Kits e Combos Maquiagem Completa
- Kits e Combos Presentes

### 🔧 Configuração

O componente utiliza o utilitário `strapi-config.ts` para:
- Configurar URLs base do Strapi
- Gerenciar tokens de API
- Processar URLs de imagens

### 📱 Responsividade

A galeria é totalmente responsiva com:
- Grid adaptável (1-4 colunas)
- Modal otimizado para mobile
- Controles touch-friendly
- Navegação intuitiva

### 🚀 Como usar

#### Navegação básica:
1. **Galeria completa**: Acesse `/galeria` para ver todos os produtos
2. **Por categoria**: Acesse `/galeria/[categoria-slug]` (ex: `/galeria/maquiagem`)
3. **Por subcategoria**: Acesse `/galeria/[categoria-slug]/[subcategoria-slug]` (ex: `/galeria/maquiagem/rosto`)

#### Interface:
1. **Navegação lateral**: Use a árvore de categorias para filtrar produtos
2. **Breadcrumb**: Clique no breadcrumb para navegar na hierarquia
3. **Busca**: Digite para buscar em produtos, categorias e subcategorias
4. **Detalhes**: Clique em qualquer produto para ver todas as imagens
5. **Estatísticas**: Visualize métricas organizadas hierarquicamente

#### URLs disponíveis:
- `/galeria` - Galeria completa
- `/galeria/maquiagem` - Todos os produtos de maquiagem
- `/galeria/maquiagem/rosto` - Produtos específicos de maquiagem para rosto
- `/galeria/skincare/limpeza` - Produtos de limpeza facial
- E muitas outras combinações...

### 🔗 Integração com Strapi

As imagens são servidas diretamente do Strapi utilizando:
- URLs otimizadas por formato (thumbnail, small, original)
- Cache automático do Next.js
- Fallback para URLs originais quando necessário

A galeria está pronta para produção e integrada com o sistema de autenticação e configurações do projeto.