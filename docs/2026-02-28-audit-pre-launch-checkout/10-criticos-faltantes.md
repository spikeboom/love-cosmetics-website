# 10 -- Criticos Faltantes (pos-auditoria)

> **Data**: 2026-02-28  
> **Escopo**: Fluxo Carrinho -> Checkout -> Pagamento (`/figma/`) + APIs adjacentes que impactam lancamento  
> **Objetivo**: Registrar achados **criticos** que nao estavam na lista original (16 criticos / Temas 1-12), mas que na minha visao tambem **bloqueiam lancamento**.

---

## [CRITICO] API "admin" de criacao de pedido sem autenticacao/autorizaçao

- **Onde**: `src/app/api/pedido/admin/route.ts:72` (`POST /api/pedido/admin`)
- **Problema**: A rota cria pedidos no banco (incluindo `origem: "admin"`) e pode marcar como `CORTESIA` (status de pagamento) sem exigir autenticacao. Isso permite que qualquer pessoa na internet crie pedidos arbitrarios e/ou spamme o banco.
- **Por que isso e critico**:
  - **Fraude/operacional**: se o backoffice tratar `status_pagamento = "CORTESIA"` como pedido efetivado, abre vetor para pedidos gratuitos.
  - **DoS / poluicao de dados**: criacao massiva de pedidos pode inflar custos, sujar relatorios e afetar rotinas (Bling/NF, picking, etc.).
  - **Surface area fora do checkout**: o endpoint nao faz parte do fluxo publico, mas fica exposto no mesmo deploy.
- **Evidencia de que nao esta protegido pelo middleware**:
  - `src/middleware.ts:17` protege `/api/pedidos/*` (plural) e `/api/admin/*`, nao `/api/pedido/*` (singular).
  - `src/middleware.ts:106` (matcher) inclui `"/api/pedidos/:path*"` mas nao inclui `"/api/pedido/:path*"`.
- **Como explorar (alto nivel)**: enviar um `POST /api/pedido/admin` com payload arbitrario (itens, frete, desconto, `cortesia: true/false`) e criar registros no banco.
- **Recomendacao**: exigir auth admin (JWT/cookie) no proprio handler e/ou mover a rota para o namespace protegido (`/api/pedidos/...`) e ajustar o `matcher` para cobrir apenas o que deve ser admin.

---

## [CRITICO] Endpoint publico expõe PII completa do pedido (somente por `pedidoId`)

- **Onde**: `src/app/api/pedido/[id]/route.ts:5` (`GET /api/pedido/:id`) com `select` abrangente em `src/app/api/pedido/[id]/route.ts:22`
- **Problema**: Retorna dados sensiveis do pedido (nome, email, telefone, endereco completo, itens, etc.) sem autenticacao. O acesso depende apenas de conhecer o `pedidoId` (UUID).
- **Por que isso e critico**:
  - **LGPD / vazamento de PII**: qualquer vazamento do `pedidoId` vira vazamento de dados pessoais e de compra.
  - **`pedidoId` aparece na URL**: a pagina de confirmacao usa `pedidoId` em query string (`src/app/(figma)/(checkout)/figma/checkout/confirmacao/page.tsx:20`). Se nao houver `Referrer-Policy` forte, o navegador pode enviar o referer completo (incluindo `?pedidoId=...`) para terceiros (scripts, pixels, imagens, fontes) carregados na pagina.
  - **A propria confirmacao busca e usa PII**: `src/app/(figma)/(checkout)/figma/checkout/confirmacao/page.tsx:36` chama `/api/pedido/${pedidoId}` e `src/app/(figma)/(checkout)/figma/checkout/confirmacao/page.tsx:73` envia `user_data` (email/telefone/endereco) para tracking via `ucPurchase`.
- **Como explorar (alto nivel)**: obter um `pedidoId` valido (ex.: link compartilhado, print, vazamento via referer/log/analytics) e chamar `GET /api/pedido/:id` para extrair PII e detalhes do pedido.
- **Recomendacao**:
  - Exigir autenticacao do cliente (sessao) ou um token de acesso por pedido (ex.: `pedidoAccessToken` separado do `id`).
  - Alternativamente, reduzir o payload publico para dados nao-sensiveis (ex.: status + total) e manter PII apenas para rotas autenticadas (cliente/admin).
  - Definir `Referrer-Policy` restritiva (ex.: `strict-origin` ou `no-referrer`) nas paginas do checkout/confirmacao para reduzir vazamento do `pedidoId` via query string.

