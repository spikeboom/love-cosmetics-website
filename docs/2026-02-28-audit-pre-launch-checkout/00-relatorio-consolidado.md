# Relatorio Consolidado — Auditoria Pre-Launch

> **Data**: 2026-02-28
> **Escopo**: Fluxo Carrinho → Checkout → Pagamento (`/figma/`)
> **Objetivo**: Identificar falhas criticas antes do lancamento com trafego pago

---

## Visao Geral

Foram investigadas **8 areas** por agentes independentes. O resultado consolidado:

| Severidade | Qtd | Status |
|------------|-----|--------|
| CRITICO    | 16  | Bloqueia lancamento |
| MEDIO      | 18  | Corrigir em breve |
| BAIXO      | 16  | Melhorias futuras |

**Veredito: NAO LANCAR** ate resolver os criticos. Estimativa: 2-4 dias de trabalho focado.

---

## Todos os Achados Criticos

Os 16 criticos foram agrupados por tema. Varios agentes encontraram os mesmos problemas de angulos diferentes — isso confirma que sao reais.

---

### TEMA 1: FRETE SEM VALIDACAO SERVER-SIDE

**Encontrado por**: 01-Precos, 03-Pedido, 05-Frete

Este e provavelmente o achado mais grave da auditoria. O frete e o unico valor financeiro que o server aceita cegamente do client.

**O problema**: A funcao `validateFrete()` em `src/lib/pedido/validate-order.ts:28-36` apenas checa se o frete esta entre R$0 e R$150. O server NAO recalcula o frete via API Frenet. O valor `body.frete_calculado` enviado pelo client e gravado diretamente no banco e usado no total.

**Como explorar**: Um atacante abre DevTools, intercepta o POST para `/api/pedido`, altera `frete_calculado` de `25.90` para `0`, ajusta `total_pedido` correspondentemente. O server recalcula `total = subtotal - cupom + 0` e aceita. O PagBank cobra sem frete.

**Impacto**: Frete gratis fraudulento em todo pedido. Com entrega a partir de Manaus (AM), o frete real pode ser R$20-80. Com trafego pago gerando volume, a perda financeira e direta e escalavel.

**Arquivos afetados**:
- `src/lib/pedido/validate-order.ts:28-36` — validacao fraca
- `src/lib/pedido/create-pedido.ts:35` — salva `body.frete_calculado` direto
- `src/core/pricing/order-totals.ts:48` — soma frete ao total sem questionar

**Correcao sugerida**: Recalcular o frete no server chamando `calculateFreightFrenet(body.cep, items)` dentro de `validateOrder`. Comparar com o valor enviado. Se divergir mais que R$1, rejeitar com erro `FREIGHT_MISMATCH`. Como alternativa rapida: definir um frete minimo server-side (ex: R$10) e rejeitar qualquer valor abaixo.

---

### TEMA 2: PAGAMENTO DUPLICADO (RACE CONDITION)

**Encontrado por**: 03-Pedido, 04-PagBank, 06-UX

Ha multiplos vetores que permitem criar pedidos e/ou cobranças duplicadas.

**Vetor 1 — Pedido duplicado** (`src/hooks/checkout/useCreateOrder.ts`):
- O hook usa `loading` state, mas nao tem guard `if (loading) return` no inicio de `createOrder`
- O botao "Finalizar compra" em `PagamentoSelecao.tsx:107-114` NAO recebe prop `disabled` durante loading
- A API `POST /api/pedido` nao tem chave de idempotencia
- Resultado: duplo clique rapido = 2 pedidos no banco

**Vetor 2 — Cobranca duplicada no PagBank** (`src/app/api/pagbank/create-order/route.ts:39-65`):
- A unica protecao e checar `status_pagamento === PAID/AUTHORIZED`
- Se 2 requests concorrentes chegam (ambas veem `status_pagamento = null`), ambas criam uma ordem no PagBank
- Nao ha verificacao de `pagbank_order_id !== null` nem lock otimista
- Resultado: cliente cobrado 2x

**Vetor 3 — Botao voltar do navegador** (`PagamentoPageClient.tsx:36-37`):
- `pedidoId` esta em `useState` (nao persistido)
- Se o usuario volta e re-avanca, `pedidoId` e `null`, criando novo pedido
- O PIX do pedido anterior continua valido e pode ser pago

**Correcao sugerida**:
1. Guard `if (loading) return` em `createOrder`
2. Desabilitar botao durante loading
3. Idempotency key (UUID por tentativa de compra)
4. No PagBank route: checar `pagbank_order_id !== null` antes de criar
5. Persistir `pedidoId` em `sessionStorage`

---

### TEMA 3: ROTAS DE DEBUG/DEV EXPOSTAS EM PRODUCAO

**Encontrado por**: 07-Seguranca

Tres rotas de debug/desenvolvimento estao acessiveis sem autenticacao.

**3a. Token Bling exposto** — `src/app/api/debug/token/route.ts:13`
- GET `/api/debug/token` retorna o token Bling COMPLETO
- Sem autenticacao, sem check de ambiente
- Impacto: comprometimento total da integracao Bling (NF, estoque, dados de clientes)

**3b. Refresh token Bling exposto** — `src/app/api/debug/refresh-token/route.ts`
- GET `/api/debug/refresh-token` renova o token Bling
- Sem autenticacao, sem check de ambiente
- Impacto: invalidacao de tokens legitimos, disrupcao da integracao

**3c. Delete de cliente por CPF** — `src/app/api/cliente/auth/dev-delete/route.ts:7`
- DELETE `/api/cliente/auth/dev-delete?cpf=XXX` deleta qualquer cliente
- Protecao: apenas `NODE_ENV === 'production'` (pode falhar se env mal configurada)
- Impacto: delecao arbitraria de contas de clientes

**Correcao sugerida**: Deletar as 3 rotas do codebase antes do deploy. Se precisar mante-las para debug futuro, proteger com autenticacao admin + check explicito de `STAGE !== "PRODUCTION"`.

---

### TEMA 4: CREDENCIAIS ADMIN HARDCODED

**Encontrado por**: 07-Seguranca

**O problema**:
- `src/app/api/login/route.ts:7-9` — Senha admin `123love` hardcoded no codigo
- `src/middleware.ts:24` — Token de sessao `sktE)7381J1` hardcoded no codigo

Qualquer pessoa com acesso ao repositorio (ou ao bundle JS do server) tem acesso total ao painel admin de pedidos.

**Impacto**: Se o repo for publico ou um colaborador vazar o codigo, a area admin fica 100% comprometida. Mesmo privado, senhas em codigo-fonte violam boas praticas de seguranca.

**Correcao sugerida**: Mover para env vars (`ADMIN_PASSWORD_HASH`). Usar bcrypt para hash. Gerar tokens de sessao aleatorios (JWT ou UUID) em vez de estaticos. Trocar a senha para algo forte.

---

### TEMA 5: CUPONS COM `usos_restantes` NUNCA DECREMENTADO

**Encontrado por**: 02-Cupons

**O problema**: O campo `usos_restantes` e verificado em `src/lib/strapi/cupons.ts:56` (`cupom.usos_restantes <= 0`), mas **em nenhum lugar do codigo o valor e decrementado** apos uso. Nao ha PUT/PATCH ao Strapi para atualizar `usos_restantes` apos criacao do pedido nem apos pagamento confirmado.

**Impacto**: Cupons configurados com limite de uso (ex: `usos_restantes: 50` para campanha de influenciador) podem ser usados infinitamente. Com trafego pago, isso e perda financeira direta e descontrolada.

**Agravante — Race condition TOCTOU**: Mesmo que o decremento seja implementado, a logica GET → check → create → PUT nao e atomica. Requests concorrentes podem ler o mesmo valor e todas passarem.

**Correcao sugerida**:
1. Implementar decremento no webhook de pagamento confirmado (PAID), nao na criacao do pedido
2. Usar operacao atomica: `UPDATE cupoms SET usos_restantes = usos_restantes - 1 WHERE codigo = ? AND usos_restantes > 0` (custom controller Strapi)
3. Ou mover controle de uso para tabela no Prisma (contar registros vs limite)

---

### TEMA 6: CLIENT ACEITA CUPONS INATIVOS/EXPIRADOS (UX CRITICA)

**Encontrado por**: 02-Cupons

**O problema**: `fetchCupom()` em `src/modules/cupom/domain.ts:3-21` faz GET ao Strapi filtrando apenas por `codigo`, sem verificar `ativo`, `data_expiracao`, ou `usos_restantes`. Um cupom inativo ou expirado e retornado e aplicado visualmente no carrinho. O usuario so descobre que e invalido ao clicar "Finalizar compra" (quando `validateOrder` bloqueia server-side).

**Impacto**: Com trafego pago, cada abandono de carrinho custa dinheiro. O usuario ve o desconto, avanca o checkout inteiro, e na ultima etapa recebe erro. Frustracao maxima, conversao perdida.

**Correcao sugerida**: Adicionar `filters[ativo][$eq]=true` na query Strapi de `fetchCupom`. Ou substituir por `fetchAndValidateCupom` que ja faz todas as verificacoes.

---

### TEMA 7: TOKEN PAGBANK "_SANDBOX" EM PRODUCAO

**Encontrado por**: 04-PagBank, 08-E2E

**O problema**: Todo o codigo usa `PAGBANK_TOKEN_SANDBOX` como nome da env var, inclusive em producao:
- `src/app/api/pagbank/create-order/route.ts:128`
- `src/app/api/pagbank/webhook/route.ts:177`
- `src/utils/pagbank-config.ts:9,36`

O `.env.master` armazena o token de producao real nessa variavel com nome de sandbox. Funciona, mas e uma bomba-relogio operacional.

**Agravante — Fallback para sandbox**: Se `PAGBANK_API_URL` nao estiver definida, o fallback e `https://sandbox.api.pagseguro.com`. Pagamentos "funcionam" mas nao cobram de verdade. O lojista pensa que esta vendendo, mas nao recebe dinheiro.

**Agravante — NGROK_URL**: `resolveNotificationUrls()` em `src/lib/pagbank/create-order.ts:106-116` prioriza `NGROK_URL` sobre `BASE_URL_PRODUCTION`. Uma env var residual no servidor de producao redirecionaria TODOS os webhooks para um tunel ngrok morto. Resultado: pagamentos feitos mas pedidos nunca atualizados.

**Correcao sugerida**:
1. Renomear para `PAGBANK_TOKEN` (sem sufixo de ambiente)
2. Remover fallback para sandbox — se env var ausente, throw error (fail-fast)
3. Proteger NGROK_URL com `if (NODE_ENV === "development")`

---

### TEMA 8: VALIDACAO DE DADOS PESSOAIS AUSENTE NO SERVER

**Encontrado por**: 03-Pedido, 07-Seguranca

**O problema**: `POST /api/pedido` faz `req.json()` e passa direto para `createPedidoFromBody()` sem nenhuma validacao:
- **CPF**: Sem checksum no server (existe em `validation.ts` mas so e usado no client)
- **Email**: Sem validacao de formato
- **Endereco**: Campos podem ser vazios
- **data_nascimento**: `new Date(undefined)` = `Invalid Date` → erro 500

**Impacto**: Pedidos com dados invalidos que impedem entrega e emissao de NF-e (Bling/SEFAZ rejeita CPF invalido). Strings arbitrariamente longas causando bloat no banco. Campo `data_nascimento` ausente causa crash.

**Correcao sugerida**: Aplicar os schemas Zod ja existentes (`identificacaoSchema`, `entregaSchema` de `src/lib/checkout/validation.ts`) no server dentro de `route.ts`. Rejeitar com 400 se invalido.

---

### TEMA 9: UX CRITICA — `alert()` E PIX EXPIRADO

**Encontrado por**: 06-UX

**9a. `alert()` para erros de pagamento** — `PagamentoPageClient.tsx:184-186`
- Erros de pagamento (cartao recusado, PIX expirado, timeout) usam `alert()` nativo
- Pode conter mensagens tecnicas do PagBank
- Bloqueia a thread, sem opcao de "tentar novamente", visual quebrado
- Com trafego pago, cada erro mal tratado = conversao perdida

**9b. Timer PIX chega a zero sem acao** — `PagamentoPixReal.tsx:104-118`
- O countdown visual para em 0, mas nada acontece
- QR Code continua visivel e copiavel
- Polling continua rodando
- Usuario tenta pagar PIX expirado, banco rejeita, confusao

**Correcao sugerida**:
- Substituir `alert()` por componente visual inline com opcoes de acao
- Quando `timeLeft === 0`: ocultar QR, mostrar "PIX expirado", oferecer "Gerar novo codigo", parar polling

---

### TEMA 10: CARRINHO VAZIO PERMITE ACESSO AO CHECKOUT

**Encontrado por**: 06-UX

**O problema**: `/checkout/identificacao` nao verifica se o carrinho tem itens. O usuario pode acessar diretamente a URL com carrinho vazio, preencher dados, e eventualmente tentar criar pedido com 0 produtos.

**Impacto**: Erro 500 no backend sem mensagem amigavel. Perda de tempo do usuario. Possivel pedido com 0 itens no banco.

**Correcao sugerida**: Guard em cada etapa do checkout:
```tsx
const { cart } = useCart();
useEffect(() => {
  if (Object.keys(cart).length === 0) router.push("/figma/cart");
}, [cart]);
```

---

### TEMA 11: `payment_method` NUNCA SALVO NO BANCO

**Encontrado por**: 08-E2E

**O problema**: O schema Prisma tem `payment_method String?` mas `buildOrderUpdateData()` em `src/lib/pagbank/create-order.ts:322-358` nunca seta esse campo. Apos pagamento, nao ha como saber se foi PIX ou cartao sem inferencia fragil.

**Impacto**: Relatorios financeiros, reconciliacao, e logica de NF sem informacao do metodo de pagamento.

**Correcao sugerida**: Adicionar `payment_method: paymentMethod === "pix" ? "pix" : "credit_card"` em `buildOrderUpdateData`.

---

### TEMA 12: SOMA DE ITENS PAGBANK PODE DIVERGIR DO TOTAL

**Encontrado por**: 04-PagBank, 08-E2E

**O problema**: Quando ha cupom, `buildItemsFromPedido()` rateia o desconto proporcionalmente usando `Math.floor`. Com multiplos itens de quantidade > 1, centavos se perdem. Exemplo: item R$100 x3, cupom R$10 → `floor(1000/3) = 333` centavos por unidade → total items = 29001 vs total real = 29000.

**Impacto**: PagBank pode rejeitar a ordem se validar que soma dos itens != total do charge. Na pratica, PagBank trata items como informativos para cartao/PIX, mas o risco existe.

**Correcao sugerida**: Apos calcular todos os itens, somar e comparar com o total. Se houver diferenca de centavos, ajustar o ultimo item para fechar a conta.

---

## Priorizacao de Correcoes

### P0 — Corrigir ANTES de qualquer deploy (bloqueantes)

| # | Tema | Esforco | Impacto |
|---|------|---------|---------|
| 1 | Frete sem validacao server-side | 4h | Fraude financeira direta |
| 3 | Rotas de debug expostas | 30min | Token Bling exposto publicamente |
| 4 | Credenciais admin hardcoded | 1h | Painel admin comprometido |
| 7 | Token PagBank "_SANDBOX" + NGROK_URL | 2h | Pagamentos podem falhar ou ir pro sandbox |

### P1 — Corrigir antes de ligar trafego pago

| # | Tema | Esforco | Impacto |
|---|------|---------|---------|
| 2 | Pagamento duplicado (race condition) | 4h | Cobranca dupla |
| 5 | `usos_restantes` nunca decrementado | 4h | Cupons infinitos |
| 6 | Client aceita cupons inativos | 1h | Abandono de carrinho |
| 8 | Validacao de dados pessoais no server | 2h | Pedidos invalidos, NF rejeitada |
| 9 | `alert()` e PIX expirado | 3h | UX pessima, conversao perdida |

### P2 — Corrigir na primeira semana

| # | Tema | Esforco | Impacto |
|---|------|---------|---------|
| 10 | Guard carrinho vazio | 30min | Edge case de UX |
| 11 | `payment_method` nunca salvo | 15min | Relatorios incompletos |
| 12 | Soma itens PagBank divergente | 2h | Rejeicao de pagamento rara |

---

## Pontos Positivos Encontrados

Nem tudo e problema. A auditoria confirmou que a arquitetura tem bases solidas:

1. **`calculateOrderTotals` como fonte unica de verdade** — client e server usam a mesma funcao. Elimina divergencias de calculo.
2. **Server recalcula precos a partir do Strapi** — `validateOrder` busca precos reais com `cache: "no-store"` e rejeita manipulacao.
3. **Server usa valores calculados por ele** — `totalSeguro` e `descontosSeguro` sao usados para salvar no banco, nao os valores do client.
4. **Prisma ORM** — elimina risco de SQL injection em todo o codebase.
5. **Cupom limitado a 1 por pedido** — enforced no client e no server.
6. **Desconto clampado** — `Math.max(0, Math.min(...))` previne descontos negativos ou maiores que o subtotal.
7. **Fluxo logado/deslogado funciona** — ambos os cenarios sao tratados corretamente.
