# Integração Carrinho Figma

## Objetivo
Integrar o sistema de carrinho do projeto principal com as páginas `/figma`, permitindo que produtos adicionados em `/figma/product/[slug]` apareçam em `/figma/cart` e sincronizem com o resto do projeto.

## Abordagem
- **SEM Modal Cart**: Navegação direta para `/figma/cart`
- **Context Compartilhado**: Usar `MeuContextoProvider` já disponível no root layout
- **Identidade Visual**: Manter design Figma separado, compartilhar apenas lógica

---

## Fase 1: Header com Badge Dinâmico

**Arquivo:** `src/app/figma/components/Header.tsx`

**Mudanças:**
1. Importar `useMeuContexto()`
2. Substituir badge hardcoded "01" por `qtdItemsCart`
3. Garantir que link aponta para `/figma/cart`

**Estado:** ⏳ Pendente

---

## Fase 2: Produto Adicionar ao Carrinho

**Arquivo:** `src/app/figma/product/[slug]/ProductPageClient.tsx`

**Mudanças:**
1. Importar `useMeuContexto()` e `useRouter()`
2. Implementar `handleAddToCart()` usando `addProductToCart()`
3. Implementar `handleBuy()`:
   - Adicionar produto
   - Redirecionar para `/figma/cart`
4. Passar handlers reais para `ProductActionButtons` e `FloatingProductCTA`
5. Adicionar feedback (toast) ao adicionar produto

**Dados do Produto:**
```typescript
{
  id: produto.id.toString(),
  nome: produto.nome,
  preco: produto.preco,
  quantity: 1,
  slug: produto.slug,
  preco_de: produto.preco_de,
  carouselImagensPrincipal: produto.carouselImagensPrincipal,
  // Dados para frete (se disponíveis)
  bling_number: produto.bling_number,
  altura: produto.altura,
  largura: produto.largura,
  comprimento: produto.comprimento,
  peso_gramas: produto.peso_gramas,
}
```

**Estado:** ⏳ Pendente

---

## Fase 3: Página de Carrinho Funcional

**Arquivos:**
- `src/app/figma/cart/page.tsx` (server component)
- `src/app/figma/cart/CartPageClient.tsx` (novo - client component)

**Mudanças:**

### 3.1 Criar CartPageClient
- Importar `useMeuContexto()`
- Acessar: `cart`, `total`, `cupons`, `descontos`, `freight`
- Acessar handlers: `addQuantityProductToCart`, `subtractQuantityProductToCart`, `removeProductFromCart`, `handleAddCupom`

### 3.2 Atualizar Componentes
- **CartProductsList**: Receber `cart` object e converter para array
- **CartProductCard**: Adicionar props para handlers de quantidade/remover
- **CartSummary**: Usar valores reais calculados
- **CartCouponInput**: Conectar com `handleAddCupom`
- **ShippingCalculator**: Integrar com `freight` do context

### 3.3 Estado Vazio
- Verificar se `cart` está vazio
- Mostrar mensagem + link para produtos

### 3.4 Botão Checkout
- Adicionar botão "Finalizar Compra"
- Redirecionar para rota de checkout do projeto

**Estado:** ⏳ Pendente

---

## Fase 4: Testes e Validação

**Fluxo Completo:**
1. ✅ Adicionar produto em `/figma/product/[slug]`
2. ✅ Ver badge atualizar no header
3. ✅ Clicar no carrinho → navegar para `/figma/cart`
4. ✅ Ver produto listado com imagem, nome, preço, quantidade
5. ✅ Aumentar/diminuir quantidade
6. ✅ Remover produto
7. ✅ Adicionar outro produto
8. ✅ Aplicar cupom
9. ✅ Calcular frete
10. ✅ Recarregar página → tudo persistido
11. ✅ Navegar para fora de `/figma` → carrinho mantido
12. ✅ Ver carrinho em outras partes do site (modal cart) → produtos do figma aparecem

**Estado:** ⏳ Pendente

---

## Arquitetura

```
MeuContextoProvider (Root Layout)
    ├─ cart (localStorage)
    ├─ cupons
    ├─ freight
    └─ handlers
         │
         ▼
    /figma/
    ├─ Header [🛒 Badge]
    │   └─ useMeuContexto() → qtdItemsCart
    │
    ├─ /product/[slug]
    │   └─ addProductToCart()
    │       └─ Toast: "Produto adicionado!"
    │
    └─ /cart
        └─ useMeuContexto() → cart, total, handlers
            ├─ Listar produtos
            ├─ Alterar quantidades
            ├─ Aplicar cupons
            ├─ Calcular frete
            └─ Finalizar compra
```

---

## Notas Importantes

1. **Context já disponível**: `MeuContextoProvider` está no root layout, `/figma` já tem acesso
2. **Persistência automática**: `StorageService` já gerencia localStorage
3. **Sem duplicação**: Não criar novo sistema de carrinho, usar o existente
4. **Feedback visual**: Usar `useNotifications()` para toasts ao adicionar produtos
5. **Consistência**: Produtos do Figma aparecem em todo o site, e vice-versa

---

## Checklist de Implementação

- [x] Fase 1: Header com badge dinâmico
- [x] Fase 2: Produto adicionar ao carrinho
- [x] Fase 3: Carrinho funcional
- [ ] Fase 4: Testes completos
- [ ] ✅ Deploy e validação em produção

---

## Resumo das Mudanças Implementadas

### ✅ Header (Fase 1)
- Importado `useMeuContexto()`
- Badge agora mostra `qtdItemsCart` dinâmico
- Badge só aparece se houver itens no carrinho
- Link do carrinho aponta para `/figma/cart`

### ✅ Produto (Fase 2)
- Importado `useMeuContexto()`, `useRouter()`, `useNotifications()`
- Implementado `handleAddToCart()` com feedback via toast
- Implementado `handleBuy()` que adiciona e redireciona
- Implementado `handleShare()` com Web Share API
- Todos os botões conectados (desktop + mobile/floating)

### ✅ Carrinho (Fase 3)
- Criado `CartPageClient.tsx` como client component
- Simplificado `page.tsx` para apenas buscar produtos
- `CartPageClient` consome todos os dados do context:
  - `cart` → lista de produtos
  - `total`, `subtotal`, `descontos`
  - `freight.freightValue`
  - Handlers de quantidade e remoção
- Implementado estado vazio com mensagem e CTA
- Componentes atualizados:
  - **CartProductsList**: Aceita handlers onAdd, onSubtract, onRemove
  - **CartProductCard**: Mostra quantidade real, botões funcionais, botão remover
  - **CartSummary**: Valores reais, botão "Finalizar Compra" funcional
  - **CartCouponInput**: Aplica cupons via API, mostra cupons aplicados
