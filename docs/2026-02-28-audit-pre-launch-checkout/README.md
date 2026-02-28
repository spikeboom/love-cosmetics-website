# Auditoria Pre-Launch: Carrinho, Checkout e Pagamento

> **Data**: 2026-02-28
> **Objetivo**: Identificar falhas criticas no fluxo de compra antes do lancamento com trafego pago.
> **Metodo**: Cada area e investigada em uma sessao isolada de Claude Code (contexto limpo).

## Como usar

Para cada area abaixo, abra uma sessao nova de Claude Code e use o prompt sugerido.
Marque o status conforme for concluindo:

- `[ ]` Pendente
- `[~]` Em andamento
- `[x]` Concluido
- `[!]` Falha critica encontrada

---

## Areas de Investigacao

### 1. `[ ]` Validacao de Precos e Integridade do Carrinho

**Risco**: Cliente paga valor errado; preco manipulado no client-side.

**O que investigar**:
- O `item.preco` do localStorage pode ser adulterado? O server valida corretamente?
- `PRICE_TOLERANCE = 0.50` e suficiente? Pode causar perda ou abuso?
- Se o preco de um produto mudar no Strapi durante o checkout, o que acontece?
- O `OutdatedCartAlert` funciona corretamente? Bloqueia a compra ou so avisa?
- Validacao de quantidade (1-100): faz sentido para todos os produtos?

**Arquivos para ler**:
```
src/app/api/carrinho/validar/route.ts
src/lib/pedido/validate-order.ts
src/core/pricing/order-totals.ts
src/contexts/cart-totals/CartTotalsContext.tsx
src/utils/cart-calculations.ts
src/components/cart/OutdatedCartAlert.tsx
src/lib/strapi/index.ts              (PRICE_TOLERANCE)
src/lib/strapi/produtos.ts           (fetchProdutosComFallback)
```

**Prompt sugerido**:
> Estou auditando o fluxo de compra pre-lancamento. Investigue a VALIDACAO DE PRECOS E INTEGRIDADE DO CARRINHO. Leia todos os arquivos listados e responda: (1) O server valida corretamente os precos vindos do client? (2) E possivel manipular localStorage para pagar menos? (3) O que acontece se o preco mudar no Strapi no meio do checkout? (4) A tolerancia de R$0.50 pode ser abusada? (5) Ha alguma race condition ou edge case perigoso? Documente tudo que encontrar como critico, medio ou baixo risco.

---

### 2. `[ ]` Cupons e Descontos — Abuso e Validacao

**Risco**: Cliente aplica cupom invalido, expirado, ou abusa de regras.

**O que investigar**:
- Cupom expirado ou inativo pode ser aplicado?
- `usos_restantes` e verificado e decrementado atomicamente?
- O cupom `BEMVINDOLOVE15` (primeira compra) pode ser burlado trocando email/CPF?
- O que acontece se o cupom for removido do Strapi entre o carrinho e o pagamento?
- Client envia `cupons` no payload — o server confia ou revalida?
- Multiplos cupons: o limite de 1 cupom e enforced no server?

**Arquivos para ler**:
```
src/utils/coupon-operations.ts
src/modules/cupom/domain.ts
src/lib/strapi/cupons.ts             (fetchAndValidateCupom)
src/lib/pedido/validate-order.ts     (validacao server-side)
src/app/api/pedido/route.ts          (regra BEMVINDOLOVE15)
src/core/pricing/order-totals.ts
src/core/processing/product-processing.ts
src/contexts/coupon/CouponContext.tsx
```

**Prompt sugerido**:
> Estou auditando o fluxo de compra pre-lancamento. Investigue CUPONS E DESCONTOS. Leia todos os arquivos listados e responda: (1) Um cupom expirado/inativo pode ser usado? O server valida? (2) `usos_restantes` e decrementado de forma atomica (sem race condition)? (3) A regra de cupom de primeira compra (`BEMVINDOLOVE15`) pode ser burlada? (4) O server revalida o cupom ou confia no client? (5) E possivel aplicar mais de 1 cupom? (6) O desconto calculado no server pode divergir do client? Documente tudo como critico, medio ou baixo risco.

---

### 3. `[ ]` Criacao de Pedido — Payload, Validacao e Persistencia

**Risco**: Pedido criado com dados inconsistentes; falha silenciosa na persistencia.

**O que investigar**:
- O payload montado pelo `useCreateOrder` pode ser manipulado?
- O server usa valores calculados por ele mesmo ou confia no client?
- O que acontece se a API `POST /api/pedido` falhar no meio (timeout, crash)?
- Pedido duplicado: pode o usuario clicar 2x e criar 2 pedidos?
- Campos obrigatorios: CPF, email, endereco — sao validados no server?
- O que acontece se `localStorage` estiver corrompido ou parcialmente preenchido?

**Arquivos para ler**:
```
src/hooks/checkout/useCreateOrder.ts
src/app/api/pedido/route.ts
src/lib/pedido/create-pedido.ts
src/lib/pedido/validate-order.ts
src/lib/prisma.ts
```

**Prompt sugerido**:
> Estou auditando o fluxo de compra pre-lancamento. Investigue a CRIACAO DE PEDIDO. Leia todos os arquivos listados e responda: (1) O server usa seus proprios valores calculados ou confia no total/desconto enviado pelo client? (2) E possivel criar pedido duplicado (duplo clique, re-submit)? (3) Se a API falhar no meio da criacao, o estado fica inconsistente? (4) CPF, email e endereco sao validados no server ou so no client? (5) O que acontece se dados do localStorage estiverem incompletos/corrompidos? Documente tudo como critico, medio ou baixo risco.

---

### 4. `[ ]` Pagamento PagBank — PIX e Cartao

**Risco**: Pagamento duplicado; falha no webhook; cliente paga mas pedido nao atualiza.

**O que investigar**:
- Pagamento duplicado: se o usuario clica "Pagar" 2x, cria 2 cobranças?
- Webhook PagBank: a validacao HMAC esta correta? Em producao (nao sandbox)?
- Se o webhook falhar/nao chegar, o pedido fica preso em "PENDING" pra sempre?
- Polling de status: tem timeout? O que acontece se expirar?
- PIX: o QR code tem expiracao? O que acontece apos expirar?
- Cartao: a encriptacao via SDK funciona em producao? O SDK e carregado corretamente?
- `notification_urls`: a URL de webhook esta apontando para producao corretamente?
- Erro de pagamento: o usuario ve mensagem util ou tela branca?
- Valores enviados ao PagBank: centavos, arredondamento, soma dos itens = total?

**Arquivos para ler**:
```
src/hooks/checkout/usePagBankPayment.ts
src/app/api/pagbank/create-order/route.ts
src/app/api/pagbank/webhook/route.ts
src/lib/pagbank/create-order.ts
src/lib/pagbank/orders.ts
src/lib/pagbank/signature.ts
src/lib/pagbank/pagbank-audit-logger.ts
src/utils/pagbank-config.ts
src/app/api/pedido/status/route.ts
```

**Prompt sugerido**:
> Estou auditando o fluxo de compra pre-lancamento. Investigue o PAGAMENTO PAGBANK (PIX e Cartao). Leia todos os arquivos listados e responda: (1) Pagamento duplicado e prevenido? O que impede 2 cobranças pro mesmo pedido? (2) A validacao HMAC do webhook funciona em producao (nao so sandbox)? (3) Se o webhook nao chegar, o pedido fica preso pra sempre? (4) O polling tem timeout adequado? (5) PIX: expiracao do QR code esta tratada? (6) Os valores em centavos estao corretos (arredondamento, soma = total)? (7) A `notification_url` aponta para producao? (8) Erros de pagamento mostram feedback util ao usuario? Documente tudo como critico, medio ou baixo risco.

---

### 5. `[ ]` Frete — Calculo, Validacao e Edge Cases

**Risco**: Frete gratuito fraudulento; CEP invalido passa; frete nao calculado.

**O que investigar**:
- O frete calculado no client e revalidado no server? (Resposta provavel: nao e recalculado, so checado range 0-150)
- O usuario pode enviar `frete: 0` no payload e ter frete gratis?
- O que acontece se a Frenet API estiver fora? Fallback de R$15 e aplicado?
- Opcao de "Frete Teste R$0,10" esta visivel so em dev? (`NEXT_PUBLIC_DEV_TOOLS`)
- O CEP e validado (formato, existencia)?
- O que acontece se o usuario mudar o CEP entre o carrinho e o checkout?

**Arquivos para ler**:
```
src/app/actions/freight-actions.ts
src/deprecated/hooks/useFreight.ts
src/contexts/shipping/ShippingContext.tsx
src/utils/frete-value.ts
src/components/figma-shared/FreightOptions.tsx
src/app/(figma)/(main)/figma/components/ShippingCalculator.tsx
src/lib/pedido/validate-order.ts     (validacao de frete: linhas relevantes)
```

**Prompt sugerido**:
> Estou auditando o fluxo de compra pre-lancamento. Investigue o CALCULO DE FRETE. Leia todos os arquivos listados e responda: (1) O server revalida o frete ou confia no valor do client? (2) E possivel enviar frete=0 e nao pagar frete? (3) A opcao "Frete Teste R$0,10" aparece em producao? Verifique a logica de `NEXT_PUBLIC_DEV_TOOLS`. (4) Se a API Frenet estiver fora, o fallback funciona bem? (5) O CEP e validado no server? (6) O que acontece se o CEP mudar entre carrinho e checkout? Documente tudo como critico, medio ou baixo risco.

---

### 6. `[ ]` UX de Erro e Edge Cases do Usuario

**Risco**: Cliente encontra tela branca, erro generico, ou fica preso no fluxo.

**O que investigar**:
- Carrinho vazio: o que acontece se acessar /checkout/identificacao direto?
- Voltar no navegador durante pagamento: o que acontece?
- Sessao expirada (tab aberta por horas): dados ainda validos?
- Campos de formulario: validacao em tempo real ou so no submit?
- Mensagens de erro: sao claras para o usuario final? (ex: "PRICE_MISMATCH" aparece raw?)
- Loading states: todos os botoes desabilitam durante submit?
- Mobile: o fluxo funciona responsivamente?
- Timeout de pagamento: o usuario sabe o que fazer?

**Arquivos para ler**:
```
src/app/(figma)/(checkout)/figma/checkout/pagamento/PagamentoPageClient.tsx
src/app/(figma)/(checkout)/figma/checkout/pagamento/components/PagamentoPixReal.tsx
src/app/(figma)/(checkout)/figma/checkout/pagamento/components/PagamentoCartaoReal.tsx
src/app/(figma)/(checkout)/figma/checkout/pagamento/components/PagamentoSelecao.tsx
src/app/(figma)/(checkout)/figma/checkout/confirmacao/components/ErrorState.tsx
src/app/(figma)/(checkout)/figma/checkout/confirmacao/components/SuccessState.tsx
src/app/(figma)/(checkout)/figma/checkout/identificacao/IdentificacaoPageClient.tsx
src/app/(figma)/(checkout)/figma/checkout/entrega/EntregaPageClient.tsx
src/app/(figma)/(main)/figma/cart/CartPageClient.tsx
src/lib/checkout/validation.ts
```

**Prompt sugerido**:
> Estou auditando o fluxo de compra pre-lancamento. Investigue UX DE ERRO E EDGE CASES. Leia todos os arquivos listados e responda: (1) O que acontece se o usuario acessar /checkout/identificacao com carrinho vazio? (2) Apertar "voltar" no navegador durante pagamento causa problema? (3) Botoes de submit desabilitam durante loading (previne duplo clique)? (4) Mensagens de erro sao amigaveis ou mostram codigos tecnicos ao usuario? (5) Os formularios validam em tempo real ou so no submit? (6) O que acontece se o usuario ficar com a tab aberta por horas? Documente tudo como critico, medio ou baixo risco.

---

### 7. `[ ]` Seguranca — Injection, XSS, CSRF e Manipulacao de Dados

**Risco**: Ataque que compromete dados ou financeiro.

**O que investigar**:
- CPF, email, nome: sao sanitizados antes de salvar no DB?
- SQL/NoSQL injection: Prisma protege por padrao, mas ha `$queryRaw` ou concatenacao?
- XSS: dados do usuario sao renderizados sem escape em algum lugar?
- CSRF: as API routes tem protecao?
- Rate limiting: ha protecao contra brute force no cupom ou criacao de pedido?
- Dados sensiveis em logs: cartao, CPF, token PagBank aparecem em console.log?
- Headers de seguranca: CORS, Content-Security-Policy, etc.
- Webhook PagBank: pode ser spoofado se o token nao estiver configurado?

**Arquivos para ler**:
```
src/app/api/pedido/route.ts
src/app/api/pagbank/create-order/route.ts
src/app/api/pagbank/webhook/route.ts
src/lib/pagbank/signature.ts
src/lib/pagbank/pagbank-audit-logger.ts
src/lib/pedido/create-pedido.ts
src/lib/pedido/validate-order.ts
src/app/api/carrinho/validar/route.ts
src/middleware.ts                     (se existir)
next.config.js / next.config.mjs
```

**Prompt sugerido**:
> Estou auditando o fluxo de compra pre-lancamento. Investigue SEGURANCA. Leia todos os arquivos listados e responda: (1) Inputs do usuario (CPF, email, nome, endereco) sao sanitizados antes de salvar? (2) Ha risco de SQL/NoSQL injection (query raw, concatenacao)? (3) Ha risco de XSS (dados do usuario renderizados sem escape)? (4) API routes tem protecao contra CSRF? (5) Ha rate limiting contra brute force? (6) Dados sensiveis (cartao, CPF, tokens) aparecem em logs? (7) O webhook PagBank pode ser spoofado em producao? (8) Headers de seguranca estao configurados? Documente tudo como critico, medio ou baixo risco.

---

### 8. `[ ]` Fluxo E2E — Conexao Entre as Pecas

**Risco**: Cada peca funciona isolada mas a integracao falha.

**O que investigar**:
- O que o CartContext passa para o useCreateOrder e exatamente o que o server espera?
- Os totais calculados no CartTotalsContext batem com os do server (calculateOrderTotals)?
- O pedido criado no DB tem todos os campos que o PagBank precisa?
- Apos pagamento confirmado, o carrinho e limpo? Os dados de checkout sao limpos?
- O fluxo de confirmacao le os dados corretamente do DB?
- Se o usuario esta logado vs deslogado, o fluxo funciona nos dois cenarios?
- Analytics (GTM): os eventos disparam nos momentos certos?

**Arquivos para ler**:
```
src/contexts/cart/CartContext.tsx
src/contexts/cart-totals/CartTotalsContext.tsx
src/hooks/checkout/useCreateOrder.ts
src/app/api/pedido/route.ts
src/lib/pedido/validate-order.ts
src/core/pricing/order-totals.ts
src/app/api/pagbank/create-order/route.ts
src/lib/pagbank/create-order.ts
src/app/(figma)/(checkout)/figma/checkout/confirmacao/components/SuccessState.tsx
src/app/(figma)/(checkout)/figma/checkout/pagamento/PagamentoPageClient.tsx
```

**Prompt sugerido**:
> Estou auditando o fluxo de compra pre-lancamento. Investigue o FLUXO E2E (end-to-end). Leia todos os arquivos listados e responda: (1) Os dados que o CartContext/useCreateOrder enviam batem com o que a API /api/pedido espera? (2) Os totais do CartTotalsContext (client) batem com calculateOrderTotals (server)? (3) O pedido no DB tem tudo que o PagBank precisa? (4) Apos pagamento, carrinho e dados de checkout sao limpos corretamente? (5) O fluxo funciona tanto logado quanto deslogado? (6) Ha algum campo que o client envia e o server ignora (ou vice-versa)? Documente tudo como critico, medio ou baixo risco.

---

## Checklist Pos-Auditoria

Apos concluir todas as areas, compilar aqui:

### Falhas Criticas (bloqueia lancamento)
- _nenhuma encontrada ainda_

### Riscos Medios (corrigir em breve)
- _nenhum encontrado ainda_

### Riscos Baixos (melhorias futuras)
- _nenhum encontrado ainda_

### Notas Gerais
- _observacoes gerais_
