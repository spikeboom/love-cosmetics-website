# Fixes Criticos Implementados (Checkout Pre-Launch)

> Referencia: `docs/2026-02-28-audit-pre-launch-checkout/00-relatorio-consolidado.md`
>
> Objetivo: enderecar os **16 achados CRITICO** (Temas 1-12) antes do lancamento.

Este documento descreve, por TEMA do relatorio consolidado, o que foi alterado no codigo para corrigir o problema, quais pontos de comportamento mudaram e quais arquivos foram os principais alvos. No fim, listei mudancas adicionais que nao estavam explicitamente no consolidado.

---

## TEMA 1: Frete sem validacao server-side

**O que foi feito**
- `validateOrder()` agora **recalcula o frete no server** via Frenet (`calculateFreightFrenet(cep, items)`), em vez de aceitar cegamente `body.frete_calculado`.
- O frete enviado pelo client e comparado por **centavos** com os servicos retornados; se nao bater, retorna `FREIGHT_MISMATCH`.
- Em producao, se a Frenet falhar/indisponivel, o pedido e bloqueado com `FREIGHT_UNAVAILABLE` (fail-safe).
- O pedido passa a ser salvo com `freteSeguro` (valor validado) e, quando possivel, com detalhes do servico (transportadora/servico/prazo).

**Arquivos principais**
- `src/lib/pedido/validate-order.ts`
- `src/lib/pedido/create-pedido.ts`
- `src/app/api/pedido/route.ts`
- `src/lib/strapi/produtos.ts` (fetch do produto inclui peso/dimensoes para o calculo do frete)

---

## TEMA 2: Pagamento duplicado (race condition)

**O que foi feito (pedido duplicado / idempotencia)**
- O client gera e persiste uma `idempotencyKey` (por sessao) e envia no `POST /api/pedido`.
- O server grava `Pedido.idempotency_key` com unique, e se receber a mesma chave retorna o pedido existente (idempotente).
- No client, `useCreateOrder()` tem guard de concorrencia (`inFlightRef`) e o botao de finalizar fica `disabled` durante loading.
- `pedidoId` passou a ser persistido em `sessionStorage` para suportar voltar/avancar no navegador sem criar outro pedido.

**O que foi feito (cobranca duplicada PagBank)**
- `POST /api/pagbank/create-order` ganhou um lock atomico com `updateMany` que transiciona o pedido para `CREATING_PAYMENT` antes de chamar PagBank.
- Se ja existir `pagbank_order_id` (e nao estiver em status terminal de falha), a rota **reusa** o pagamento existente em vez de criar outro.
- Bloqueio para nao permitir alternar metodo de pagamento no mesmo pedido (exceto em caso de falha).

**Arquivos principais**
- `src/hooks/checkout/useCreateOrder.ts`
- `src/app/api/pedido/route.ts`
- `src/app/api/pagbank/create-order/route.ts`
- `src/app/(figma)/(checkout)/figma/checkout/pagamento/PagamentoPageClient.tsx`
- `src/app/(figma)/(checkout)/figma/checkout/pagamento/components/PagamentoSelecao.tsx`

---

## TEMA 3: Rotas de debug/dev expostas em producao

**O que foi feito**
- As rotas de debug/dev passaram a:
  - Retornar `404` em producao.
  - Exigir autenticacao admin via JWT (cookie `auth_token`) fora de producao.
- `/api/debug/token` nao retorna mais token completo (apenas preview/tamanho).

**Arquivos principais**
- `src/app/api/debug/token/route.ts`
- `src/app/api/debug/refresh-token/route.ts`
- `src/app/api/cliente/auth/dev-delete/route.ts`
- `src/lib/admin/auth-edge.ts` (verificacao JWT admin)

---

## TEMA 4: Credenciais admin hardcoded

**O que foi feito**
- Remocao de senha/token hardcoded no login admin e no middleware.
- Login admin (`POST /api/login`) agora valida credenciais via env:
  - `ADMIN_USERNAME`
  - `ADMIN_PASSWORD_HASH` (argon2) ou `ADMIN_PASSWORD` (fallback)
  - `ADMIN_JWT_SECRET` (obrigatorio em producao)
- Em caso de sucesso, e emitido um JWT (cookie `auth_token`) e o `middleware.ts` valida esse JWT para rotas admin.

**Arquivos principais**
- `src/app/api/login/route.ts`
- `src/middleware.ts`
- `src/lib/admin/auth-edge.ts`

---

## TEMA 5: Cupons com `usos_restantes` nunca decrementado

**O que foi feito (solucao escolhida: controle via Prisma, nao via PUT no Strapi)**
- Foi implementado controle global de uso de cupom via tabela no Postgres (Prisma), evitando o TOCTOU do modelo GET -> check -> PUT.
- Fluxo:
  1. Ao criar pedido, se o cupom tiver `usos_restantes` numerico, o server faz uma **reserva atomica** (lock por codigo + contagem global).
  2. Ao receber webhook `PAID/AUTHORIZED`, a reserva vira **CONSUMED** (uso efetivado).
  3. Em falha terminal (`DECLINED/CANCELED/PAYMENT_FAILED`), a reserva pode ser liberada (status `RELEASED`).
- A reserva tem TTL (default 30 min) para nao bloquear cupom indefinidamente em checkout abandonado.

**Observacao importante**
- Essa solucao **nao decrementa o campo no Strapi**. O `usos_restantes` do Strapi passa a ser usado como "limite maximo" e o controle real fica na tabela `CupomReserva`.

**Arquivos principais**
- `prisma/schema.prisma` (model `CupomReserva` + relacao com `Pedido` + `idempotency_key`)
- `prisma/migrations/20260228180000_add_idempotency_key_and_cupom_reserva/migration.sql`
- `src/lib/cupom/usage.ts` (reserve/consume/release)
- `src/app/api/pedido/route.ts` (reserva dentro de transaction)
- `src/app/api/pagbank/webhook/route.ts` (consume/release conforme status)

---

## TEMA 6: Client aceita cupons inativos/expirados (UX critica)

**O que foi feito**
- `fetchCupom()` passou a filtrar/invalidar cupom no client-side (SSR/server actions) quando:
  - `ativo === false`
  - `data_expiracao` ja passou
  - `usos_restantes <= 0`
  - limite global (DB) ja foi atingido (contagem em `CupomReserva`)
- No server, o pedido continua validando cupom via `fetchAndValidateCupom()` (defesa em profundidade).

**Arquivos principais**
- `src/modules/cupom/domain.ts`
- `src/lib/strapi/cupons.ts`

---

## TEMA 7: Token PagBank "_SANDBOX" em producao + NGROK_URL

**O que foi feito**
- Centralizacao/config:
  - Token preferencial: `PAGBANK_TOKEN` (mantido fallback para `PAGBANK_TOKEN_SANDBOX` por compatibilidade).
  - `PAGBANK_API_URL` obrigatorio em producao (sem fallback silencioso para sandbox).
- URLs de webhook:
  - `NGROK_URL` **nunca** e priorizado em producao.
  - Em producao usa `BASE_URL_PRODUCTION` (com fallback seguro).

**Arquivos principais**
- `src/utils/pagbank-config.ts`
- `src/lib/pagbank/create-order.ts`
- `src/app/api/pagbank/webhook/route.ts` (GET de consulta usa config central)

---

## TEMA 8: Validacao de dados pessoais ausente no server

**O que foi feito**
- `POST /api/pedido` passou a validar payload com Zod:
  - CPF (checksum), email, telefone, CEP, endereco e data de nascimento.
  - Sanitizacao: digits-only para cpf/cep/telefone; normalizacao de `estado`, trim em strings.
- `items` agora pode vir vazio no schema para cair no erro correto de negocio (`EMPTY_CART`) dentro de `validateOrder` (e nao estourar em schema).

**Arquivos principais**
- `src/app/api/pedido/route.ts`
- `src/lib/checkout/validation.ts` (reuso de validacoes)

---

## TEMA 9: UX critica (alert e PIX expirado)

**O que foi feito**
- Remocao de `alert()` e exibicao de erros inline (banner/estado de erro), com opcao de tentar novamente.
- PIX:
  - Quando o timer chega a 0, o polling e interrompido e a UI muda para "PIX expirado".
  - Foi adicionada acao "Gerar novo codigo" (gera um novo PIX).
- Server-side: `POST /api/pagbank/create-order` permite recriar uma ordem PIX se o `pix_expiration` ja passou (mesmo que o pedido ainda esteja em `AWAITING_PAYMENT`).

**Arquivos principais**
- `src/app/(figma)/(checkout)/figma/checkout/pagamento/PagamentoPageClient.tsx`
- `src/app/(figma)/(checkout)/figma/checkout/pagamento/components/PagamentoSelecao.tsx`
- `src/app/(figma)/(checkout)/figma/checkout/pagamento/components/PagamentoPixReal.tsx`
- `src/app/(figma)/(checkout)/figma/checkout/pagamento/components/PagamentoCartaoReal.tsx`
- `src/app/api/pagbank/create-order/route.ts`

---

## TEMA 10: Carrinho vazio permite acesso ao checkout

**O que foi feito**
- Guards client-side para redirecionar para `/figma/cart` se o carrinho estiver vazio:
  - Identificacao
  - Entrega
  - Pagamento
- Guard usa `isCartLoaded` para evitar redirect prematuro antes de carregar o carrinho do storage.
- Server tambem retorna `EMPTY_CART` se chegar `items=[]`.

**Arquivos principais**
- `src/app/(figma)/(checkout)/figma/checkout/identificacao/IdentificacaoPageClient.tsx`
- `src/app/(figma)/(checkout)/figma/checkout/entrega/EntregaPageClient.tsx`
- `src/app/(figma)/(checkout)/figma/checkout/pagamento/PagamentoPageClient.tsx`
- `src/lib/pedido/validate-order.ts`

---

## TEMA 11: `payment_method` nunca salvo no banco

**O que foi feito**
- `buildOrderUpdateData()` passou a setar `payment_method` como `"pix"` ou `"credit_card"` ao salvar retorno do PagBank.
- A rota de criacao de pagamento tambem trava `payment_method` quando inicia a criacao (evita troca indevida).

**Arquivos principais**
- `src/lib/pagbank/create-order.ts`
- `src/app/api/pagbank/create-order/route.ts`

---

## TEMA 12: Soma de itens PagBank pode divergir do total

**O que foi feito**
- `buildItemsFromPedido()` foi reescrito para trabalhar em **centavos** e distribuir desconto de cupom de forma deterministica (largest remainder).
- Para evitar divergencia, o frete passou a ser incluido como item `"Frete"` (assim `sum(items)` acompanha `amount.value`).
- Foi adicionada uma etapa final de ajuste `adjustItemsSumToTotalCents()` para corrigir divergencias raras de centavos (split de linha ou item "Ajuste" se necessario).

**Arquivos principais**
- `src/lib/pagbank/create-order.ts`

---

## O que foi feito fora do relatorio consolidado

- Criacao de migration Prisma para suportar:
  - `Pedido.idempotency_key` (unique).
  - `CupomReserva` (controle global/atomico de cupom).  
  Arquivo: `prisma/migrations/20260228180000_add_idempotency_key_and_cupom_reserva/migration.sql`.
- Reducao de risco operacional no PagBank:
  - Menos logging de payload sensivel em producao (logs mostram apenas metadados como `bodyLength`).
- Ajustes de robustez no fluxo do checkout:
  - Persistencia do `pedidoId` e `idempotencyKey` em `sessionStorage` para suportar back/forward e evitar duplicacao.
  - Tratamento explicito do novo erro `COUPON_EXHAUSTED` como erro de cupom na pagina de pagamento (acao "Retirar cupom e continuar").

