## Desconto de cupom no total do pedido (proposta estrutural)

### 1) Principio: 1 fonte de verdade para totais
Criar um calculo unico (pure function) que gere os totais **em centavos** a partir de:
- `items[]` (com `preco` base em reais)
- `cupons[]` (com `multiplacar` e `diminuir`)
- `frete` (reais)

Saida sugerida:
- `itemsSubtotalCents`
- `couponDiscountCents`
- `totalCents`
- `itemsTotalAfterCouponCents` (subtotal - desconto cupom, clamp >= 0)

Regras:
- **Cupom aplica no subtotal do pedido**, nao em cada item:
  - Compor cupons: `multiplicar = produto(multiplacar)`, `diminuir = soma(diminuir)`
  - `afterCoupon = round(itemsSubtotalCents * multiplicar) - diminuirCents`
  - `afterCoupon = clamp(afterCoupon, 0, itemsSubtotalCents)`
  - `couponDiscountCents = itemsSubtotalCents - afterCoupon`
- Arredondamento:
  - converter valores de entrada para centavos com `Math.round(valor * 100)`
  - somar sempre em centavos (inteiros)
  - converter para reais somente na borda (ex: persistencia / exibicao)

Onde colocar:
- `src/core/pricing/order-totals.ts` (ou `src/core/pricing/coupon-totals.ts`)

### 2) Carrinho/Checkout: parar de mutar preco do item
Hoje o cupom muta `item.preco` em:
- `src/modules/produto/domain.ts` (`processProdutos`)
- `src/utils/coupon-operations.ts` (chama `processProdutos` para aplicar)

Mudanca proposta (menos agressiva):
- manter `cupom_applied_codigo` / `cupom_applied` apenas como "estado visual" (badge/indicador)
- **nao** alterar `preco` e **nao** criar/usar `backup.preco` para calculo do cupom
- manter `processProdutosRevert` apenas para limpar flags do cupom (e nao para restaurar preco)

Impacto esperado:
- listas de itens (`CartProductsList`, `OrderSummary`) passam a exibir `item.preco` base (sem cupom)
- resumo do pedido exibe linha "Cupom" com `couponDiscountCents`

Arquivos diretamente afetados:
- `src/modules/produto/domain.ts`
- `src/utils/coupon-operations.ts`
- `src/contexts/coupon/CouponContext.tsx` (se precisar ajustar o fluxo)

### 3) Totais e resumos (UI): padronizar exibicao
Pontos onde aparece "resumo do pedido":
- Checkout (global): `src/app/_global/(main)/checkout/OrderSummary.tsx`
- Resumo (Figma/cart/checkout): `src/components/checkout/ResumoCompraCard.tsx` + `src/core/pricing/resumo-compra.ts`
- Admin pedidos: `src/app/(admin)/pedidos/components/PedidoCard.tsx`
- Minha conta pedidos: `src/app/_global/(cliente-logado)/minha-conta/pedidos/page.tsx`

Mudanca proposta:
- trocar a origem do "desconto do cupom" para o calculo unico em centavos
- exibir:
  - `Produtos` = subtotal de itens sem cupom
  - `Cupom` = valor do desconto (negativo)
  - `Frete` = frete
  - `Total` = subtotal - cupom + frete
- itens individuais mostram `preco` base (sem cupom)

Notas:
- `preco_de` continua sendo **apenas visual** (preco riscado / desconto site/kit)
- `descontoSite` (kit/promo) pode continuar derivado de `preco_de` vs `preco`

Arquivos diretamente afetados:
- `src/core/pricing/resumo-compra.ts` (incluir cupons no calculo do `descontoCupom`, nao via `item.preco` mutado)
- `src/components/checkout/ResumoCompraCard.tsx`
- `src/app/_global/(main)/checkout/OrderSummary.tsx`
- `src/app/(figma)/(main)/figma/cart/CartProductsList.tsx` (ajustar exibicao de preco/badges)

### 4) Criacao/validacao de pedido: item base + desconto no total
Hoje:
- `src/hooks/checkout/useCreateOrder.ts` envia `items[].preco` ja com cupom e `descontos` vindo do client
- `src/lib/pedido/validate-order.ts` valida preco por item com cupom (`precoOriginal * multiplicador - diminuir`)

Mudanca proposta:
- frontend envia:
  - `items[].preco` base (sem cupom)
  - `descontos` = `couponDiscount` (em reais) ou remover e confiar apenas em `cupom_valor`
  - `total_pedido` = `total` (subtotal - cupom + frete) em reais
  - `cupom_valor` = valor do cupom em reais (2 casas) para persistir
- backend (`validate-order.ts`) valida:
  - cada `item.preco` contra preco base do Strapi (com kit aplicado, sem cupom)
  - calcula `couponDiscountCents` e `totalCents` com a mesma funcao unica
  - compara centavos (inteiros) para evitar divergencias

Arquivos diretamente afetados:
- `src/hooks/checkout/useCreateOrder.ts`
- `src/app/api/pedido/route.ts`
- `src/lib/pedido/validate-order.ts`
- `src/lib/pedido/create-pedido.ts` (persistir `cupom_valor` coerente)

### 5) Validacao de carrinho (precos atualizados) sem cupom por item
Hoje o endpoint retorna `precoComCupom` e o cliente atualiza `cartItem.preco` para `precoComCupom`.

Mudanca proposta (transicao suave):
- `/api/carrinho/validar` passa a comparar/retornar `precoAtual` (base)
- cliente (`CartTotalsContext.refreshCartPrices`) atualiza apenas `preco` base
- manter campos antigos (`precoComCupom`) por um tempo como alias de `precoAtual` para evitar quebra imediata

Arquivos diretamente afetados:
- `src/app/api/carrinho/validar/route.ts`
- `src/deprecated/hooks/useCartValidation.ts`
- `src/contexts/cart-totals/CartTotalsContext.tsx`
- `src/components/common/Context/context.jsx` (legacy, se ainda em uso)

### 6) Bling (nota fiscal): desconto no total do documento
O codigo ja suporta desconto no total via `orderData.desconto_total`:
- `src/lib/bling/invoice.ts` (campo `desconto` no corpo da NF)
- `src/app/api/pedidos/[id]/gerar-nota/route.ts` envia `desconto_total` apenas para pedidos `origem === "admin"`

Mudanca proposta:
- passar `desconto_total = pedido.cupom_valor` para **todo pedido** que tenha cupom (checkout e admin)
- garantir que `pedido.items[].preco` esteja sem cupom (base), para nao "duplicar" desconto

Compatibilidade (pedidos antigos):
- como pedidos antigos podem ter cupom embutido em `items[].preco`, usar heuristica antes de enviar ao Bling:
  - se `abs((sumItems + frete) - total_pedido) < tolerancia`, assumir "cupom embutido" e manter `desconto_total = 0`
  - se `abs((sumItems - cupom_valor + frete) - total_pedido) < tolerancia`, assumir "cupom no total" e enviar `desconto_total = cupom_valor`

Arquivos diretamente afetados:
- `src/app/api/pedidos/[id]/gerar-nota/route.ts`

### 6.1) PagBank (Orders/PIX): manter itens base no pedido, mas fechar centavos no request
No checkout transparente (PagBank Orders API) hoje:
- `src/lib/pagbank/create-order.ts` monta `items[]` a partir de `pedido.items[].unit_amount`
- nao existe um campo explicito de desconto no payload do PIX `/orders` (diferente do endpoint `/checkouts`)

Para manter o contrato novo (itens sem cupom no pedido salvo) **sem quebrar o pagamento**:
- persistir no banco:
  - `items[].unit_amount` = preco base (reais)
  - `cupom_valor` = desconto do cupom (reais)
  - `total_pedido` = subtotal - cupom + frete (reais)
- na hora de chamar PagBank (somente no request):
  - calcular `couponDiscountCents`
  - **ratear** esse desconto em centavos entre os itens (proporcional ao valor do item), ajustando 1 centavo no ultimo item para fechar
  - enviar `items[].unit_amount` (centavos) ja com o desconto rateado, de modo que `sum(items)` feche com o total esperado pelo gateway (quando aplicavel)

Onde aplicar:
- `src/lib/pagbank/create-order.ts` (`buildItemsFromPedido`) e/ou no builder do request PIX.

### 7) Checklist de aceitacao (sem diferenca de centavos)
- Com cupom aplicado:
  - carrinho: itens nao mudam preco; resumo mostra linha cupom; total bate
  - checkout: idem
  - pedido salvo: `items[].preco` base; `cupom_valor` preenchido; `total_pedido` bate com formula
  - admin/pedidos e minha-conta: resumos consistentes com o pedido salvo
  - Bling: itens base + desconto_total (quando aplicavel)
- Comparacoes criticas feitas em centavos (inteiros), nao em float.

### 8) Execucao recomendada (ordem)
1. Implementar calculo unico em centavos (core) + testes unitarios (poucos cenarios com arredondamento).
2. Atualizar `validate-order.ts` para novo contrato (item base + desconto no total).
3. Atualizar criacao de pedido no frontend (enviar item base + cupom_valor + total coerente).
4. Atualizar resumos (OrderSummary/ResumoCompraCard/admin/minha-conta) para exibir cupom como linha, nao embutido no item.
5. Atualizar /api/carrinho/validar + refreshCartPrices para nao forcar preco com cupom por item.
6. Atualizar envio ao Bling para sempre usar `cupom_valor` como `desconto_total` (com heuristica para pedidos antigos).
