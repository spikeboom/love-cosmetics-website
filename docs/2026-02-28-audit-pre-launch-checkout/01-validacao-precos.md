# 01 — Validacao de Precos e Integridade do Carrinho

## Resumo

O fluxo de validacao de precos e pedidos possui uma arquitetura server-side solida, com `calculateOrderTotals` como fonte de verdade e validacao dupla (pre-checkout via `/api/carrinho/validar` e no momento do pedido via `validateOrder`). Foram identificados 2 achados de severidade media e 3 de severidade baixa, nenhum critico, mas que merecem atencao antes do lancamento com trafego pago.

## Achados

### [MEDIO] Frete nao e revalidado server-side contra a API Frenet no momento do pedido

- **Onde**: `src/lib/pedido/validate-order.ts:28-36` e `src/lib/pedido/create-pedido.ts:35`
- **Problema**: A funcao `validateFrete` apenas verifica se o frete e >= 0 e <= 150. Nao ha recalculo server-side do frete contra a API Frenet no momento da criacao do pedido. O valor do frete vem do client (`body.frete_calculado`) e e salvo diretamente no banco. Embora o `totalSeguro` seja recalculado pelo servidor (e inclui o frete enviado pelo client), um atacante poderia enviar `frete_calculado: 0` e `total_pedido` ajustado correspondentemente. O servidor recalcularia `totalCalculado = subtotal - cupom + 0` e aceitaria desde que `totalEnviado` seja consistente com `frete = 0`.
- **Impacto**: Um usuario malicioso pode manipular o frete para R$0,00 (ou qualquer valor entre R$0 e R$150), economizando o custo real de entrega. Para um e-commerce de cosmeticos com entrega a partir de Manaus, isso pode representar R$20-80 de prejuizo por pedido.
- **Sugestao**: Recalcular o frete no servidor chamando `calculateFreightFrenet` com o CEP do pedido e os items, e validar que o frete enviado esta dentro de uma tolerancia aceitavel do frete calculado. Alternativa minima: manter um mapa de frete minimo por regiao/CEP.

### [MEDIO] PRICE_TOLERANCE de R$0,50 acumulavel por etapa

- **Onde**: `src/lib/strapi/index.ts:5` (`PRICE_TOLERANCE = 0.50`), `src/lib/pedido/validate-order.ts:113,170,180`
- **Problema**: A tolerancia de R$0,50 e aplicada em 3 pontos independentes na validacao do pedido: (1) comparacao de preco por item (linha 113), (2) comparacao do desconto total (linha 170), e (3) comparacao do total (linha 180). Na pratica, o vetor de ataque por item e neutralizado porque o servidor usa `precoOriginal` (buscado do Strapi) e nao `precoEnviado` para recalcular o total (linha 143: `validatedItems.push({ preco: precoOriginal, ... })`). Portanto, a tolerancia real de abuso esta na comparacao final do total (linha 180), limitada a R$0,49 por pedido.
- **Impacto**: Abuso limitado a R$0,49 por pedido no total. Risco financeiro baixo individualmente, mas pode acumular com volume alto de trafego pago.
- **Sugestao**: Reduzir `PRICE_TOLERANCE` para R$0,05 (suficiente para erros de arredondamento de ponto flutuante). R$0,50 e excessivo para esse proposito. Alternativa: usar aritmetica de centavos inteiros end-to-end, eliminando a necessidade de tolerancia.

### [BAIXO] Frete do pedido salvo do body, nao do valor validado

- **Onde**: `src/lib/pedido/create-pedido.ts:35`
- **Problema**: O `frete_calculado` salvo no banco vem de `body.frete_calculado` (valor enviado pelo client), nao de `validationResult.details.freteValidado`. Embora atualmente ambos sejam o mesmo valor (pois `validateOrder` apenas repassa o frete), se no futuro a validacao ajustar o frete, o banco salvaria o valor errado.
- **Sugestao**: Usar `validationResult.details.freteValidado` ao salvar no banco, similar ao que ja e feito com `totalSeguro` e `descontosSeguro`.

### [BAIXO] Race condition entre validacao de carrinho e criacao de pedido (UX, nao seguranca)

- **Onde**: `src/contexts/cart-totals/CartTotalsContext.tsx:113-114`, `src/app/api/pedido/route.ts:20-48`
- **Problema**: Existe uma janela de tempo entre: (1) validacao pre-checkout (`/api/carrinho/validar`) que atualiza precos no client, e (2) criacao efetiva do pedido (`/api/pedido`) que revalida. Se um preco mudar no Strapi nessa janela, o pedido sera rejeitado com `PRICE_MISMATCH` e o usuario vera um erro. Nao e um problema de seguranca (o servidor rejeita corretamente), mas e um problema de UX.
- **Impacto**: Em cenario improvavel (mudanca de preco durante checkout), o usuario receberia erro e precisaria recarregar a pagina. Nao ha risco financeiro pois o servidor rejeita o pedido.
- **Sugestao**: Na resposta de erro `PRICE_MISMATCH`, retornar os precos atualizados para que o frontend possa atualizar o carrinho automaticamente sem exigir reload manual.

### [BAIXO] Cupom de URL nao tem debounce e pode gerar chamadas duplicadas

- **Onde**: `src/utils/cart-calculations.ts:53-65`
- **Problema**: A funcao `calculateCartTotals` e chamada como efeito do React (via `useEffect`) e chama `handleAddCupom(queryCupom)` quando detecta um parametro `?cupom=` na URL. Como o `useEffect` pode re-executar em renders subsequentes (antes do `replaceState` limpar a URL), pode haver chamadas duplicadas para adicionar o cupom.
- **Impacto**: Pode causar requests desnecessarios ao Strapi e flickering na UI. Nao ha risco de seguranca pois cupom duplicado seria ignorado.
- **Sugestao**: Adicionar um `useRef` para controlar se o cupom da URL ja foi processado, evitando chamadas duplicadas.

## Analise das Perguntas Especificas

### 1. O server valida corretamente os precos vindos do client?

**Sim, com ressalvas.** O fluxo e robusto:
- `validateOrder` busca os precos reais no Strapi via `fetchProdutosComFallback` (com `cache: "no-store"`)
- Aplica desconto de kit via `applyKitDiscountFromFinalPrice`
- Compara preco por preco com tolerancia de R$0,50
- Recalcula totais usando `calculateOrderTotals` como fonte de verdade server-side
- Usa os valores recalculados (`totalSeguro`, `descontosSeguro`) para salvar no banco

O ponto forte e que o servidor usa `precoOriginal` (do Strapi) e nao `precoEnviado` (do client) para montar `validatedItems`. Isso significa que mesmo que o client envie precos manipulados, o servidor recalcula com os precos reais.

### 2. E possivel manipular localStorage para pagar menos?

**Nao de forma significativa para precos de produtos.** Manipular `localStorage` alterando `cart`, `cupons`, ou valores de preco nao seria eficaz porque:
- O servidor busca precos reais no Strapi e rejeita divergencias > R$0,50
- O servidor busca e valida cupons no Strapi (ativo, nao expirado, usos restantes)
- O total e recalculado server-side usando `calculateOrderTotals`

**Porem, o frete e o vetor de ataque viavel.** Um atacante pode manipular `freightValue` no localStorage/request para enviar frete R$0 e ajustar o total correspondentemente.

### 3. O que acontece se o preco mudar no Strapi no meio do checkout?

**O pedido e rejeitado com seguranca.** O fluxo:
1. Pre-checkout: `/api/carrinho/validar` detecta divergencia, mostra `OutdatedCartAlert`
2. O usuario clica "Atualizar carrinho" que chama `refreshCartPrices`
3. Na criacao do pedido: `validateOrder` revalida contra Strapi com `cache: "no-store"`
4. Se preco mudou: retorna `PRICE_MISMATCH` com status 400

### 4. A tolerancia de R$0,50 pode ser abusada?

**Abuso limitado a R$0,49 por pedido no total.** O servidor recalcula o total usando precos do Strapi (nao do client), entao a tolerancia por item nao e acumulavel. Recomenda-se reduzir para R$0,05.

### 5. Ha alguma race condition ou edge case perigoso?

**Nenhum perigoso do ponto de vista financeiro.** Detalhamento:
- Race condition preco (Strapi muda entre validacao e pedido): pedido rejeitado (fail-safe)
- Produto removido do Strapi: `validateOrder` retorna `PRODUCT_NOT_FOUND` — seguro
- Cupom expirado entre validacao e pedido: `validateOrder` retorna `INVALID_COUPON` — seguro
- Desconto de cupom clampado: `Math.max(0, Math.min(...))` previne descontos negativos ou maiores que o subtotal
- `multiplacar > 1`: clampado para `itemsSubtotalCents`, portanto desconto = 0 — seguro

## Conclusao

**Status: APROVADO COM RESSALVAS**

A arquitetura de validacao de precos esta bem construida. O padrao de recalculo server-side com `calculateOrderTotals` como fonte de verdade oferece protecao solida contra manipulacao de precos no client.

**Antes do lancamento, recomenda-se (em ordem de prioridade):**

1. **(Prioridade alta)** Implementar validacao server-side do frete contra a API Frenet, ou ao menos manter uma tabela de frete minimo por regiao.
2. **(Prioridade media)** Reduzir `PRICE_TOLERANCE` de R$0,50 para R$0,05.
3. **(Prioridade baixa)** Usar `validationResult.details.freteValidado` ao salvar frete no banco.
