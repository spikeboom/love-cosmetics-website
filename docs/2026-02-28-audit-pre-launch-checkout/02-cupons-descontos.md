# 02 — Cupons e Descontos

## Resumo

O fluxo de cupons possui validacao server-side robusta no momento da criacao do pedido (`validateOrder` + `fetchAndValidateCupom`), o que impede a maioria dos ataques de manipulacao de preco. Porem, existem falhas criticas na ausencia de decremento de `usos_restantes`, na validacao client-side que nao filtra cupons inativos/expirados, e em vetores de bypass da regra de primeira compra (`BEMVINDOLOVE15`).

## Achados

### [CRITICO] `usos_restantes` nunca e decrementado -- cupons com limite de uso sao infinitos

- **Onde**: `src/lib/strapi/cupons.ts:56`, `src/app/api/pedido/route.ts`, `src/app/api/pagbank/webhook/route.ts`
- **Problema**: O campo `usos_restantes` e verificado em `fetchAndValidateCupom` (linha 56: `cupom.usos_restantes <= 0`), porem **em nenhum lugar do codigo o valor e decrementado** apos uso. Nao ha chamada PUT/PATCH ao Strapi para atualizar `usos_restantes` apos criacao do pedido, nem no webhook de pagamento confirmado (PAID).
- **Impacto**: Qualquer cupom configurado com `usos_restantes: 10` pode ser usado infinitas vezes. Cupons de campanha limitada, influenciadores ou promocoes especiais nunca se esgotam. Perda financeira direta.
- **Sugestao**: Implementar decremento no webhook de pagamento confirmado (status `PAID`), nao na criacao do pedido (para evitar decrementar em pedidos abandonados). Usar operacao atomica no Strapi (custom controller com SQL direto) para evitar race conditions.

### [CRITICO] Race condition no `usos_restantes` -- TOCTOU classico

- **Onde**: `src/lib/strapi/cupons.ts:56`
- **Problema**: Mesmo que o decremento seja implementado, a validacao faz: (1) GET para ler `usos_restantes`, (2) verificar se > 0, (3) criar pedido, (4) eventualmente PUT para decrementar. Entre os passos 1 e 4, multiplas requisicoes concorrentes podem ler o mesmo valor e todas passarem. Strapi REST API nao oferece operacoes atomicas.
- **Impacto**: Com trafego pago e campanhas virais, cupons com `usos_restantes: 1` podem ser usados por N clientes simultaneamente.
- **Sugestao**: (1) Custom controller no Strapi com SQL atomico: `UPDATE cupoms SET usos_restantes = usos_restantes - 1 WHERE codigo = ? AND usos_restantes > 0`. (2) Ou usar tabela de "uso de cupom" no Prisma e contar registros vs. limite. (3) Ou lock via Redis/mutex.

### [CRITICO] Client-side `fetchCupom` nao valida `ativo`, `data_expiracao` nem `usos_restantes`

- **Onde**: `src/modules/cupom/domain.ts:3-21`, `src/utils/coupon-operations.ts:40-48`
- **Problema**: A funcao `fetchCupom` faz apenas um GET ao Strapi filtrando por `codigo`, sem verificar `ativo`, `data_expiracao` ou `usos_restantes`. Cupons inativos ou expirados sao retornados e aplicados visualmente no carrinho. O usuario so descobre que e invalido ao tentar finalizar (quando `validateOrder` bloqueia).
- **Impacto**: UX ruim que gera abandono de carrinho e frustracao. Nao e vulnerabilidade de seguranca (server bloqueia), mas impacta conversao diretamente com trafego pago.
- **Sugestao**: Substituir `fetchCupom` por `fetchAndValidateCupom` no fluxo de aplicacao, ou adicionar `filters[ativo][$eq]=true` na query Strapi.

### [MEDIO] Regra `BEMVINDOLOVE15` pode ser burlada com CPFs de terceiros

- **Onde**: `src/app/api/pedido/route.ts:57-85`
- **Problema**: A verificacao busca pedidos PAID/AUTHORIZED por CPF **OU** email. A logica e solida para CPF unico, mas o vetor real e: usuario com CPF de terceiro (familiar, gerado) e email descartavel pode usar o cupom multiplas vezes.
- **Impacto**: 15% de desconto recorrente em cada compra usando CPFs diferentes.
- **Sugestao**: Adicionar verificacao por device fingerprint, telefone, endereco de entrega (CEP + numero), e rate limiting por IP.

### [MEDIO] Cupons armazenados completos em `localStorage` -- manipulavel

- **Onde**: `src/core/storage/storage-service.ts:14-20`, `src/contexts/coupon/CouponContext.tsx:23-25`
- **Problema**: Objeto completo do cupom (`multiplacar`, `diminuir`, `codigo`) e salvo e restaurado do `localStorage`. Usuario pode alterar valores via DevTools.
- **Impacto**: Impacto apenas visual. Server recalcula tudo a partir do Strapi. Porem, manipulacao pode causar confusao e tickets de suporte.
- **Sugestao**: Armazenar apenas o `codigo` no `localStorage`. Ao restaurar, refazer `fetchAndValidateCupom`.

### [MEDIO] Cupons no `localStorage` sobrevivem a expiracoes

- **Onde**: `src/contexts/coupon/CouponContext.tsx:23-25`
- **Problema**: Ao recarregar pagina, cupons sao restaurados sem re-validacao. Cupom expirado continua visualmente ativo.
- **Impacto**: UX frustrante. Server bloqueia corretamente, mas usuario descobre tarde.
- **Sugestao**: Ao restaurar do `localStorage`, chamar `fetchAndValidateCupom` imediatamente. Remover e notificar se invalido.

### [MEDIO] `PRICE_TOLERANCE` de R$0.50 e generosa

- **Onde**: `src/lib/strapi/index.ts:5`, `src/lib/pedido/validate-order.ts:170,180`
- **Problema**: Tolerancia de R$0.50 para desconto e total. O server usa `totalSeguro` (calculado internamente), entao a tolerancia serve apenas como gate de rejeicao.
- **Impacto**: Perda maxima de R$0.50 por pedido.
- **Sugestao**: Reduzir para R$0.05.

### [BAIXO] Server revalida cupom corretamente -- nao confia no client (PONTO POSITIVO)

- **Onde**: `src/lib/pedido/validate-order.ts:57-78`, `src/app/api/pedido/route.ts:20-48`
- **Problema**: Nenhum. Server recebe apenas codigos de cupom, busca no Strapi, valida `ativo`/`data_expiracao`/`usos_restantes`, recalcula totais com `calculateOrderTotals`, e usa valores calculados para criar pedido.
- **Impacto**: Positivo. Server e fonte de verdade.

### [BAIXO] Impossivel aplicar mais de 1 cupom (PONTO POSITIVO)

- **Onde**: `src/utils/coupon-operations.ts:59-64`, `src/lib/pedido/validate-order.ts:61`
- **Problema**: Nenhum. Client bloqueia (`cupons.length >= 1`). Server usa apenas `cupons[0]`. Porem, server nao rejeita explicitamente `cupons.length > 1`.
- **Sugestao**: Adicionar validacao explicita no server: `if (cupons.length > 1) return error`. Defesa em profundidade.

### [BAIXO] Desconto client/server usa mesma funcao -- divergencia minima

- **Onde**: `src/core/pricing/order-totals.ts`, `src/utils/cart-calculations.ts`
- **Problema**: Ambos usam `calculateOrderTotals`. Divergencia possivel de 1 centavo por arredondamento.
- **Impacto**: Negligivel.

## Conclusao

**Status geral: BLOQUEANTE para lancamento**

A base server-side e solida, mas ha **3 achados criticos** que devem ser corrigidos antes do lancamento com trafego pago:

1. **`usos_restantes` nunca e decrementado** -- cupons com limite de uso sao efetivamente infinitos. Achado mais grave.
2. **Race condition no decremento** -- sem atomicidade, cupons limitados podem ser abusados em concorrencia.
3. **Client aceita cupons inativos/expirados** -- causa UX ruim e abandono de carrinho.

Corrigir itens 1 e 3 antes de ativar trafego pago. Item 2 pode ser implementado em paralelo com monitoramento.
