## 01) Mapeamento atual (onde está “% OFF”, onde muda `preco_de`, onde aparece riscado)

> Nota: não existe uma pasta `/figma/` na raiz; o “Figma” está principalmente em `src/app/(figma)/...`.

### A. “% OFF” hard-coded (strings fixas)
**Dentro do fluxo Figma:**
- `src/app/(figma)/(main)/figma/components/BannerPrincipal.tsx` (mock `discount: "40% OFF"`)
- `src/app/(figma)/(main)/figma/components/VitrineSection.tsx` (mocks `"40% OFF"` e `"15% OFF"`)
- `src/app/(figma)/(main)/figma/components/MaisVendidosSection.tsx` (mocks `"40% OFF"` e `"15% OFF"`)
- `src/app/(figma)/(main)/figma/components/YouMayLikeSection.tsx` (mocks `"40% OFF"`)
- `src/app/(figma)/(main)/figma/product/[slug]/ProductPageClient.tsx` (texto `"40% OFF"` e fallback `priceInfo.desconto || "40% OFF"`)
- `src/app/(figma)/(main)/figma/experimento/components/*` (mocks `"40% OFF"` e `"15% OFF"`)
- `src/app/(figma)/(main)/figma/cart/CartProductsList.tsx` (mock de desconto `40%` e “preço antigo” como `preco * 1.4`)

**Fora do fluxo Figma (ainda relevante para limpeza/consistência):**
- `src/styles/design-system/examples/card.example.tsx` (`-30% OFF`)
- `src/deprecated/components/cart/FixedBuyButton/botao-fixo-comprar.tsx` (texto “até 15% OFF”)
- `src/app/amazon/page.tsx` (“Extra 15% OFF”)

### B. “% OFF” dinâmico (calculado)
- `src/utils/calculate-prices.ts` calcula `desconto = "${percent}% OFF"` a partir de `preco` e `precoOriginal`.
- `src/utils/transform-produtos-strapi.ts` calcula `desconto = "${percent}% OFF"` a partir de `produto.preco` e `produto.preco_de`.
- `src/app/(figma)/(main)/figma/search/page.tsx` calcula `desconto = "${percent}% OFF"` quando não existe `tag_desconto_1`.

### C. Onde desconto/cupom é aplicado (muda preço efetivo)
- `src/utils/coupon-operations.ts` aplica/remover cupom chamando:
  - `src/modules/produto/domain.ts` `processProdutos(...)` (aplica cupom; altera `preco`, marca `cupom_applied_codigo`, cria `backup`)
  - `src/modules/produto/domain.ts` `processProdutosRevert(...)` (reverte a partir de `backup`)
- `src/utils/cart-operations.ts` ao adicionar item chama `src/core/processing/product-processing.ts` (`processProdutosComOuSemCupom`) para aplicar cupom em “novos itens”.

### D. Onde `preco_de` é setado / sobrescrito
**Vindo do Strapi / transformações:**
- `src/utils/transform-produtos-strapi.ts` coloca `preco_de` no produto transformado (para carrinho) e também expõe `precoOriginal`.
- `src/app/(figma)/(main)/figma/search/page.tsx` passa `preco_de: precoOriginal`.

**Durante aplicação de cupom:**
- `src/modules/produto/domain.ts` `processProdutos(...)` define:
  - `const preco_de = dataLog?.preco_de || dataLog?.preco || 0;`
  - e sempre retorna `preco_de` no item (mesmo quando antes não existia).
  - isso mistura “preço riscado” com “preço-base para cupom”.

**Durante refresh/validação de carrinho:**
- `src/contexts/cart-totals/CartTotalsContext.tsx` em `refreshCartPrices()` sobrescreve `preco_de: produtoAtualizado.precoAtual`.
  - isso torna `preco_de` dependente de “preço atual”, não necessariamente de “preço riscado real”.

### E. Onde o preço riscado aparece (ou deveria aparecer)
**Risco (line-through) no Figma:**
- `src/app/(figma)/(main)/figma/components/CardProduto.tsx` risca `precoOriginal` (não usa diretamente `preco_de`).
- `src/app/(figma)/(main)/figma/components/FloatingProductCTA.tsx` risca `precoDe`.
- `src/app/(figma)/(main)/figma/components/ProductInfo.tsx` (tem `line-through`).
- `src/app/(figma)/(main)/figma/product/[slug]/ProductPageClient.tsx` (tem `line-through`, porém o bloco atual contém texto hard-coded de exemplo).
- `src/app/(figma)/(main)/figma/cart/CartProductCard.tsx` risca `precoAntigo` (que hoje vem mockado em `CartProductsList.tsx`, e por isso fica errado).

### F. Resumos (carrinho/checkout) e PagBank
- `src/utils/cart-calculations.ts` calcula `descontos` apenas como **desconto de cupom**, via `backup.preco - preco`.
- `src/app/(figma)/(main)/figma/cart/CartSummary.tsx` exibe “Produtos / Frete / Cupom / Total” usando `subtotal` e `cupom=descontos`.
- `src/app/(figma)/(checkout)/figma/checkout/pagamento/PagamentoPageClient.tsx` usa `subtotal = total - frete + descontos` (assume que `descontos` é “desconto nos produtos”).
- `src/app/api/pedido/route.ts` valida e salva no Prisma `Pedido.descontos` e `Pedido.total_pedido`, e depois `src/app/api/pagbank/create-order/route.ts` envia `items` e `total` ao PagBank.

**Ponto crítico:** hoje o sistema trata “desconto” principalmente como **cupom**, e o “preço riscado”/promoção (`preco_de`) não entra no total (só na UI) — mas `preco_de` acaba sendo sobrescrito por fluxo de cupom/refresh, gerando inconsistência visual.

