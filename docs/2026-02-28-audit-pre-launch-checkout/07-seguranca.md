# 07 — Seguranca

## Resumo

A aplicacao possui validacao de precos server-side e rate limiting no login de clientes, porem apresenta **vulnerabilidades criticas** que devem ser corrigidas antes do lancamento: credenciais admin hardcoded no codigo-fonte, rotas de debug/dev expostas sem protecao adequada, ausencia total de headers de seguranca, e falta de sanitizacao nos inputs do fluxo de pedido.

## Achados

### [CRITICO] Token e senha admin hardcoded no codigo-fonte

- **Onde**: `src/middleware.ts:24` e `src/app/api/login/route.ts:7-9`
- **Problema**: A senha admin (`123love`) e o token de sessao (`sktE)7381J1`) estao hardcoded diretamente no codigo-fonte. Qualquer pessoa com acesso ao repositorio (ou ao bundle JS do servidor) consegue acessar o painel admin.
- **Impacto**: Acesso total ao painel administrativo de pedidos. Se o repositorio for publico ou se algum colaborador vazar o codigo, a area admin fica completamente comprometida.
- **Sugestao**: Mover credenciais para variaveis de ambiente (`ADMIN_USERNAME`, `ADMIN_PASSWORD_HASH`). Usar bcrypt para comparar senhas com hash. Gerar tokens de sessao aleatorios (JWT ou UUID) em vez de um token estatico compartilhado.

### [CRITICO] Rota de debug expoe token Bling completo em producao

- **Onde**: `src/app/api/debug/token/route.ts:13`
- **Problema**: A rota GET `/api/debug/token` retorna o token de acesso Bling **completo** (`fullValue: token`) sem nenhuma protecao de autenticacao ou verificacao de ambiente. Qualquer pessoa pode acessar `seusite.com/api/debug/token` e obter o token da integracao Bling.
- **Impacto**: Comprometimento total da integracao Bling (notas fiscais, estoque). Um atacante pode emitir notas fiscais falsas, alterar dados de estoque ou extrair dados de clientes via API Bling.
- **Sugestao**: Remover esta rota completamente antes do lancamento.

### [CRITICO] Rota de debug refresh-token exposta sem protecao

- **Onde**: `src/app/api/debug/refresh-token/route.ts`
- **Problema**: A rota GET `/api/debug/refresh-token` permite renovar o token Bling sem nenhuma autenticacao. Nao ha verificacao de `NODE_ENV` ou `STAGE`.
- **Impacto**: Um atacante pode forcar a renovacao continua do token Bling, potencialmente causando invalidacao de tokens legitimos e disrupcao da integracao.
- **Sugestao**: Remover ou proteger com autenticacao admin + verificacao de ambiente.

### [CRITICO] Rota dev-delete protegida apenas por NODE_ENV (bypassavel)

- **Onde**: `src/app/api/cliente/auth/dev-delete/route.ts:7`
- **Problema**: A rota DELETE `/api/cliente/auth/dev-delete?cpf=XXX` permite deletar qualquer cliente pelo CPF. A protecao depende de `process.env.NODE_ENV === 'production'`. Se essa variavel nao estiver configurada corretamente no deploy, a rota fica acessivel.
- **Impacto**: Delecao arbitraria de contas de clientes, incluindo historico de sessoes.
- **Sugestao**: Remover esta rota completamente do build de producao.

### [CRITICO] Ausencia de sanitizacao nos inputs do pedido (create-pedido)

- **Onde**: `src/lib/pedido/create-pedido.ts:15-48`
- **Problema**: Os campos `nome`, `sobrenome`, `email`, `cpf`, `telefone`, `endereco`, `complemento`, `bairro`, `cidade`, `estado` sao salvos diretamente do `body` da requisicao sem nenhum schema Zod ou sanitizacao. O `validateOrder` valida apenas precos e produtos, nao os dados pessoais.
- **Impacto**: Strings arbitrariamente longas causando bloat no banco; dados malformados em downstream (Bling NF, PagBank); potencial XSS armazenado se renderizado sem escape.
- **Sugestao**: Criar schema Zod para o body do pedido (similar ao `cadastroClienteSchema` ja existente em `src/lib/cliente/validation.ts`).

### [MEDIO] Webhook PagBank aceita requests sem assinatura em sandbox (risco de config errada em prod)

- **Onde**: `src/lib/pagbank/signature.ts:29-48`
- **Problema**: O fallback `?? true` faz com que, se `PAGBANK_API_URL` nao estiver definida, webhooks sem assinatura sejam aceitos. Se por erro de deploy a variavel nao for configurada, webhooks falsos podem marcar pedidos como PAID.
- **Impacto**: Pedidos marcados como pagos sem pagamento real.
- **Sugestao**: Inverter o fallback para `?? false` (seguro por padrao).

### [MEDIO] Webhook GET endpoint exposto sem autenticacao

- **Onde**: `src/app/api/pagbank/webhook/route.ts:164-211`
- **Problema**: O endpoint GET `/api/pagbank/webhook?orderId=XXX` permite consultar status de qualquer pedido no PagBank sem autenticacao.
- **Impacto**: Vazamento de informacoes sobre status de pagamentos.
- **Sugestao**: Proteger com autenticacao admin ou remover.

### [MEDIO] API routes de pedido sem protecao CSRF

- **Onde**: `src/app/api/pedido/route.ts`, `src/app/api/pagbank/create-order/route.ts`, `src/app/api/carrinho/validar/route.ts`
- **Problema**: Nenhuma rota possui protecao CSRF. Nao ha verificacao de `Origin` header, token CSRF, ou header customizado.
- **Impacto**: Site malicioso pode submeter requests em nome de usuario logado.
- **Sugestao**: Verificar `Origin` header nas rotas criticas. Adicionar token CSRF ou SameSite=Strict nos cookies.

### [MEDIO] Rate limiting admin login inexistente

- **Onde**: `src/app/api/login/route.ts`
- **Problema**: A rota de login admin nao tem rate limiting. Senha simples permite brute force trivial.
- **Impacto**: Acesso ao painel admin por brute force em segundos.
- **Sugestao**: Implementar rate limiting. Usar senha forte. Idealmente migrar para auth provider.

### [MEDIO] Ausencia completa de headers de seguranca

- **Onde**: `next.config.ts`
- **Problema**: Nenhum header de seguranca configurado (CSP, X-Frame-Options, X-Content-Type-Options, HSTS, Referrer-Policy, Permissions-Policy).
- **Impacto**: Sem X-Frame-Options: clickjacking no checkout. Sem HSTS: primeira visita interceptavel via HTTP. Sem CSP: maior superficie para XSS.
- **Sugestao**: Adicionar bloco `headers()` no `next.config.ts` com todos os headers relevantes.

### [MEDIO] Dados sensiveis em logs de auditoria PagBank

- **Onde**: `src/lib/pagbank/pagbank-audit-logger.ts:90-98`
- **Problema**: O audit logger grava bodies completos (com PII: CPF, nome, email) em arquivo de texto no filesystem.
- **Impacto**: Vazamento de PII. Violacao de LGPD.
- **Sugestao**: Desativar em producao (`PAGBANK_AUDIT_LOG_ENABLED=false`). Mascarar dados sensiveis se mantido.

### [MEDIO] Email do pedido logado em texto plano

- **Onde**: `src/app/api/pedido/route.ts:33,148`
- **Problema**: Email do cliente em logs de validacao e sucesso via `logMessage`.
- **Impacto**: PII em logs pode violar LGPD.
- **Sugestao**: Mascarar email nos logs.

### [BAIXO] Risco de XSS armazenado via dados de pedido

- **Onde**: `src/lib/pedido/create-pedido.ts:17-29`
- **Problema**: Dados do usuario salvos sem sanitizacao. React escapa HTML por padrao, mas contextos nao-HTML (emails, PDFs, CSVs) podem ser vulneraveis.
- **Impacto**: XSS se dados forem renderizados sem escape em outro contexto.
- **Sugestao**: Sanitizar inputs antes de salvar como defense-in-depth.

### [BAIXO] Nao ha risco de SQL/NoSQL injection (PONTO POSITIVO)

- **Onde**: Todos os arquivos de acesso a dados
- **Problema**: Nenhum. Prisma ORM com queries parametrizadas elimina o risco.
- **Sugestao**: Manter uso consistente do Prisma. Nao introduzir `$queryRaw`.

### [BAIXO] Rate limiting de login baseado em memoria (nao persistente)

- **Onde**: `src/lib/cliente/session.ts:6`
- **Problema**: Rate limiting usa `Map` em memoria. Perde-se com restart ou horizontal scaling.
- **Impacto**: Rate limiting ineficaz em deploy com multiplas instancias.
- **Sugestao**: Aceitavel para lancamento com instancia unica. Migrar para Redis para escalar.

### [BAIXO] Variavel de token PagBank nomeada como SANDBOX em producao

- **Onde**: `src/app/api/pagbank/create-order/route.ts:128`
- **Problema**: `PAGBANK_TOKEN_SANDBOX` usada em producao. Confusao operacional.
- **Impacto**: Risco de swap acidental entre tokens.
- **Sugestao**: Renomear para `PAGBANK_TOKEN`.

## Respostas Diretas

| # | Pergunta | Resposta |
|---|----------|----------|
| 1 | Inputs sanitizados? | **NAO.** Fluxo de pedido salva dados pessoais sem Zod/sanitizacao. |
| 2 | SQL/NoSQL injection? | **NAO.** Prisma ORM com parametros tipados em todos os arquivos. |
| 3 | XSS? | **BAIXO.** React escapa por padrao. Sem `dangerouslySetInnerHTML`. |
| 4 | CSRF? | **NAO.** Nenhuma protecao CSRF implementada. |
| 5 | Rate limiting? | **PARCIAL.** Login cliente: sim (em-memoria). Login admin: nao. Pedido: nao. |
| 6 | Dados sensiveis em logs? | **SIM.** Email em logs, PII no audit logger, token Bling exposto. |
| 7 | Webhook spoofavel? | **DEPENDE.** HMAC ok se configurado. Fallback inseguro se env vars ausentes. |
| 8 | Headers de seguranca? | **NAO.** Nenhum configurado. |

## Conclusao

**Status: BLOQUEANTE para lancamento**

Os achados criticos mais urgentes:

1. **Credenciais admin hardcoded** — corrigir imediatamente (senha e token no codigo-fonte).
2. **Rotas de debug expostas** (`/api/debug/token`, `/api/debug/refresh-token`) — remover antes do deploy. Expoe token Bling completo.
3. **Rota dev-delete** — remover antes do deploy.
4. **Sanitizacao de inputs do pedido** — adicionar schema Zod.
5. **Webhook fallback inseguro** — inverter default para rejeitar.
6. **Headers de seguranca ausentes** — adicionar no `next.config.ts`.

**Pontos positivos**: Uso consistente de Prisma (sem injection), validacao robusta de precos server-side, rate limiting no login de cliente com Zod, e validacao HMAC de webhook quando configurada corretamente.
