# 04 — Pagamento PagBank (PIX e Cartao)

## Resumo

O fluxo de pagamento PagBank cobre PIX e cartao de credito com validacao basica contra pagamento duplicado, polling com timeout, e validacao HMAC de webhooks. Porem, existem vulnerabilidades criticas: **nomes de variaveis de ambiente hardcoded para sandbox ("_SANDBOX")** mesmo em producao, **race condition na criacao de ordens duplicadas no PagBank**, **QR code PIX expirado sem bloqueio de UI**, e **soma de itens potencialmente divergente do total** quando ha rateio de cupom.

## Achados

### [CRITICO] Nomes de variaveis de ambiente hardcoded como "_SANDBOX" em producao

- **Onde**: `src/app/api/pagbank/create-order/route.ts:128`, `src/app/api/pagbank/webhook/route.ts:177`, `src/utils/pagbank-config.ts:9,36`
- **Problema**: Todo o codigo usa `PAGBANK_TOKEN_SANDBOX` e `NEXT_PUBLIC_PAGBANK_PUBLIC_KEY_SANDBOX` como nomes de variaveis, inclusive em producao. O `.env.master` (producao) define `PAGBANK_TOKEN_SANDBOX` com um token de producao real (`16eec1b0-...`). Nao existe `PAGBANK_TOKEN_PRODUCTION` nem logica para selecionar entre sandbox/producao. Isso e confuso e perigoso: qualquer dev pode achar que o token de sandbox esta ativo em producao.
- **Impacto**: Risco operacional alto. Troca acidental de token (alguem pode "corrigir" achando que esta errado), confusao em debug, e auditoria de seguranca levanta bandeira vermelha.
- **Sugestao**: Renomear para `PAGBANK_TOKEN` e `NEXT_PUBLIC_PAGBANK_PUBLIC_KEY` (sem sufixo de ambiente). Alternativamente, usar logica condicional: `process.env.STAGE === "PRODUCTION" ? process.env.PAGBANK_TOKEN_PRODUCTION : process.env.PAGBANK_TOKEN_SANDBOX`.

### [CRITICO] Race condition — pedido pode gerar multiplas ordens no PagBank

- **Onde**: `src/app/api/pagbank/create-order/route.ts:39-65`
- **Problema**: A unica protecao contra pagamento duplicado e verificar `status_pagamento === "PAID" || "AUTHORIZED"`. Porem, se o usuario clicar "Finalizar compra" duas vezes rapidamente (double-click), ou se o frontend fizer retry por timeout de rede, duas requisicoes POST concorrentes podem passar pela verificacao simultaneamente (ambas veem `status_pagamento = null`), criando **duas ordens distintas no PagBank** para o mesmo pedido. Nao ha verificacao de `pagbank_order_id !== null` (se ja existe uma ordem PagBank para o pedido), nem lock otimista, nem idempotency key.
- **Impacto**: O cliente pode ser cobrado duas vezes. Mesmo que apenas uma ordem seja processada, a outra pode ficar pendente e eventualmente ser cobrada.
- **Sugestao**: (1) Antes de criar no PagBank, verificar se `pagbank_order_id` ja existe no pedido. Se existir, retornar a ordem existente em vez de criar nova. (2) Usar `prisma.pedido.update` com `where: { id: pedidoId, pagbank_order_id: null }` para garantir atomicidade. Se o update nao afetar nenhuma linha, significa que outra requisicao ja criou a ordem. (3) No frontend, desabilitar o botao apos primeiro clique (ja feito parcialmente via `loading`, mas com possivel gap de tempo).

### [CRITICO] NGROK_URL presente no .env local pode vazar para producao

- **Onde**: `src/lib/pagbank/create-order.ts:106-116`, `.env:48`
- **Problema**: A funcao `resolveNotificationUrls()` prioriza `NGROK_URL` sobre `BASE_URL_PRODUCTION`. O `.env` local contem `NGROK_URL=https://outmoded-clair-pectic.ngrok-free.dev`. Se por algum acidente essa variavel for definida no ambiente de producao (deploy acidental do `.env` errado, variavel residual no servidor), **todos os webhooks do PagBank vao para o ngrok** e nunca chegam ao servidor real. O `.env.master` nao tem `NGROK_URL`, mas a logica de prioridade e perigosa.
- **Impacto**: Webhooks perdidos em producao = pedidos pagos nunca atualizados, cliente paga mas pedido fica como "aguardando pagamento".
- **Sugestao**: (1) Remover a logica de NGROK_URL do codigo de producao. Usar apenas em modo development: `if (process.env.NODE_ENV === "development") { ... }`. (2) Adicionar um log de alerta se NGROK_URL for detectado com `STAGE=PRODUCTION`.

### [CRITICO] Soma de itens rateados pode divergir do total enviado ao PagBank

- **Onde**: `src/lib/pagbank/create-order.ts:34-82`
- **Problema**: Quando ha cupom, a funcao `buildItemsFromPedido` rateia o desconto proporcionalmente entre itens e usa `Math.floor` para distribuir por unidade. Porem, o `totalAmount` enviado para o PagBank em `charges[0].amount.value` vem de `buildTotalAmount(pedido)` que e `Math.round(pedido.total_pedido * 100)`. A soma dos `unit_amount * quantity` dos itens rateados pode nao ser igual ao `totalAmount` devido a acumulacao de arredondamentos. O PagBank pode rejeitar a ordem se detectar divergencia entre soma dos itens e total do charge.
- **Impacto**: Ordens rejeitadas pelo PagBank em casos especificos de cupom + multiplos itens com quantidades variadas, resultando em falha de pagamento para o cliente.
- **Sugestao**: Apos calcular todos os itens rateados, somar `unit_amount * quantity` de todos e comparar com `totalAmount`. Se houver diferenca de centavos, ajustar o ultimo item para fechar a conta exatamente. Alternativamente, enviar o desconto como item separado com valor negativo (se o PagBank suportar).

### [MEDIO] Webhook nao tem protecao de idempotencia — status pode regredir

- **Onde**: `src/app/api/pagbank/webhook/route.ts:83-99`
- **Problema**: O webhook atualiza `status_pagamento` incondicionalmente com o status recebido. Se o PagBank enviar webhooks fora de ordem (ex: PAID chega, depois IN_ANALYSIS chega atrasado), o status regride de PAID para IN_ANALYSIS. Nao ha verificacao se o status atual e "mais avancado" que o novo.
- **Impacto**: Pedido marcado como PAID pode voltar a IN_ANALYSIS, afetando processamento de nota fiscal, envio, e visao do cliente.
- **Sugestao**: Implementar uma hierarquia de status: `WAITING_PAYMENT < IN_ANALYSIS < AUTHORIZED < PAID < CANCELED/DECLINED`. Apenas atualizar se o novo status for "mais avancado" na hierarquia. Nao permitir regredir de PAID para outro status exceto CANCELED (para estornos).

### [MEDIO] Validacao HMAC do webhook pode falhar em producao — algoritmo nao e o padrao PagBank

- **Onde**: `src/lib/pagbank/signature.ts:19-64`
- **Problema**: A validacao usa `sha256Raw(token + "-" + rawBody)` e compara com o header `x-authenticity-token`. A documentacao oficial do PagBank para a API Orders v2 pode usar um header e algoritmo diferente. O `PAGBANK_WEBHOOK_TOKEN` no `.env.master` esta configurado com o **mesmo valor** do `PAGBANK_TOKEN_SANDBOX` (`16eec1b0-...`), o que provavelmente esta incorreto — o webhook token deveria ser um segredo separado configurado no painel do PagBank.
- **Impacto**: Se o algoritmo ou header estiver incorreto, todos os webhooks serao rejeitados em producao, fazendo com que nenhum pedido seja atualizado automaticamente.
- **Sugestao**: (1) Verificar na documentacao oficial do PagBank qual header e algoritmo exato sao usados. (2) Testar com um webhook real em producao antes de lancar. (3) Garantir que `PAGBANK_WEBHOOK_TOKEN` e o token correto cadastrado no painel do PagBank (nao o token de API).

### [MEDIO] PIX expirado nao bloqueia a UI — usuario pode pagar QR code vencido

- **Onde**: `src/app/(figma)/(checkout)/figma/checkout/pagamento/components/PagamentoPixReal.tsx:104-118`
- **Problema**: O countdown visual mostra o tempo restante e para em 0, mas **nao toma nenhuma acao quando chega a zero**. O QR code e o codigo Pix continuam visiveis e o botao "Copiar codigo Pix" continua funcional. O usuario pode tentar pagar um PIX expirado, o banco pode rejeitar, mas nao ha feedback claro no frontend.
- **Impacto**: Experiencia ruim para o usuario que tenta pagar e o banco rejeita. Pode gerar confusao e reclamacoes.
- **Sugestao**: Quando `timeLeft === 0`: (1) Ocultar QR code e codigo PIX. (2) Mostrar mensagem "Codigo PIX expirado". (3) Oferecer botao "Gerar novo codigo" que chama `createPixPayment` novamente. (4) Parar o polling.

### [MEDIO] Se webhook nao chegar, pedido depende apenas do polling (com timeout)

- **Onde**: `src/hooks/checkout/usePagBankPayment.ts:270-353`
- **Problema**: O polling para PIX tem timeout de 15 minutos (igual a expiracao do QR code), e para cartao de 2 minutos. Se o webhook nao chegar E o polling expirar (ex: usuario fecha o browser), o pedido fica preso no status `AWAITING_PAYMENT` para sempre. Nao ha job de reconciliacao que consulte o PagBank periodicamente para atualizar pedidos pendentes.
- **Impacto**: Pedidos pagos podem ficar como "aguardando" indefinidamente, resultando em perda de venda (produto nao enviado), reclamacao do cliente, e inconsistencia no estoque.
- **Sugestao**: Implementar um cron job ou scheduled function que: (1) Busca pedidos com `status_pagamento = "AWAITING_PAYMENT"` ha mais de 20 minutos. (2) Consulta o PagBank pela API `GET /orders/{id}` para obter o status real. (3) Atualiza o banco. Isso funciona como safety net quando webhook + polling falham.

### [MEDIO] Endpoint GET do webhook expoe dados da ordem PagBank sem autenticacao

- **Onde**: `src/app/api/pagbank/webhook/route.ts:164-211`
- **Problema**: O endpoint GET `/api/pagbank/webhook?orderId=xxx` consulta o PagBank e retorna dados completos da ordem (incluindo dados do cliente, CPF, etc.) sem nenhuma autenticacao. Qualquer pessoa com um `orderId` (formato previsivel como `ORDE_xxxx`) pode consultar dados sensiveis.
- **Impacto**: Vazamento de dados pessoais (CPF, nome, email, telefone, endereco) de clientes. Violacao de LGPD.
- **Sugestao**: (1) Mover essa funcionalidade para uma rota admin protegida. (2) Se o polling precisa, usar o endpoint `/api/pedido/status` que retorna apenas dados minimos (status, isPaid). O polling ja usa esse endpoint via `checkOrderStatus`, mas o `startPaymentPolling` usa o GET do webhook diretamente.

### [BAIXO] Fallback de API URL aponta para sandbox

- **Onde**: `src/app/api/pagbank/create-order/route.ts:127`, `src/app/api/pagbank/webhook/route.ts:176`, `src/utils/pagbank-config.ts:31`
- **Problema**: O fallback para `PAGBANK_API_URL` e `https://sandbox.api.pagseguro.com`. Se a variavel de ambiente nao for definida por alguma razao, o sistema inteiro roda contra o sandbox sem nenhum aviso visivel ao usuario.
- **Impacto**: Em caso de falha de configuracao, pagamentos "funcionam" no sandbox mas nao cobram de verdade. O lojista pensa que esta vendendo, mas nao recebe dinheiro.
- **Sugestao**: Remover o fallback para sandbox. Se `PAGBANK_API_URL` nao estiver definida, **lancar erro** (fail-fast) em vez de silenciosamente usar sandbox.

### [BAIXO] Console.log expoe dados sensiveis em producao

- **Onde**: `src/lib/pagbank/create-order.ts:269-275,290-296`
- **Problema**: Os `console.log` do "PagBank Request Debug" e "PagBank Response Debug" imprimem o corpo completo da requisicao e resposta, incluindo dados do cartao criptografado, CPF, e detalhes do pedido. Em producao, esses logs podem ser capturados por servicos de monitoramento.
- **Impacto**: Exposicao de dados sensiveis em logs de producao.
- **Sugestao**: Remover esses `console.log` ou condicioná-los a `NODE_ENV === "development"`. Os logs de auditoria (`pagbank-audit-logger.ts`) ja cumprem essa funcao de forma mais controlada.

### [BAIXO] Polling do PIX usa endpoint do webhook (GET) em vez do status do pedido

- **Onde**: `src/hooks/checkout/usePagBankPayment.ts:282`
- **Problema**: O `startPaymentPolling` faz GET em `/api/pagbank/webhook?orderId=xxx`, que por sua vez chama a API do PagBank diretamente a cada 10 segundos (PIX) ou 3 segundos (cartao). Isso consome requests da API PagBank e pode gerar rate limiting. Alem disso, expoe dados sensiveis conforme achado anterior.
- **Impacto**: Rate limiting da API PagBank, especialmente com multiplos usuarios pagando PIX simultaneamente. Cada usuario gera ~90 requests em 15 minutos.
- **Sugestao**: Usar o endpoint `/api/pedido/status` para polling (que consulta o banco local, nao a API PagBank). O status local sera atualizado pelo webhook. Reservar a consulta direta ao PagBank apenas para o botao "Ja realizei o Pix" (verificacao manual).

### [BAIXO] notification_url de producao esta correta mas sem validacao explicita

- **Onde**: `src/lib/pagbank/create-order.ts:106-116`
- **Problema**: A `notification_url` e construida corretamente como `https://www.lovecosmetics.com.br/api/pagbank/webhook` em producao (via `BASE_URL_PRODUCTION`). Porem, nao ha validacao que garanta que a URL resultante e HTTPS e aponta para o dominio correto.
- **Impacto**: Baixo se as variaveis estiverem corretas, mas uma validacao explicita evitaria problemas futuros.
- **Sugestao**: Adicionar assertion: `if (!notificationUrls[0].startsWith("https://")) throw new Error("notification_url deve ser HTTPS")`.

### [BAIXO] Erro de pagamento mostra feedback generico em alguns cenarios

- **Onde**: `src/hooks/checkout/usePagBankPayment.ts:194,204`
- **Problema**: Quando o PagBank retorna erro, a mensagem exibida e frequentemente "Erro ao processar pagamento" sem detalhes uteis para o usuario (como "cartao sem limite", "dados incorretos", etc.).
- **Impacto**: O usuario nao sabe por que o pagamento falhou e pode desistir da compra.
- **Sugestao**: Mapear os codigos de erro do PagBank para mensagens amigaveis ao usuario. Ex: status DECLINED com reason "INSUFFICIENT_FUNDS" -> "Saldo insuficiente no cartao".

## Conclusao

O fluxo de pagamento tem uma base funcional solida, mas apresenta **4 achados criticos** que devem ser resolvidos antes do lancamento com trafego pago:

1. **Race condition de pagamento duplicado** — mais urgente, pode gerar cobranca dupla e prejuizo financeiro/reputacional.
2. **Nomes de variaveis "_SANDBOX" em producao** — confuso e propenso a erro operacional.
3. **NGROK_URL com prioridade sobre producao** — uma variavel residual pode redirecionar webhooks para lugar errado.
4. **Soma de itens rateados divergindo do total** — pode causar rejeicao de pagamentos com cupom.

Alem disso, a **falta de job de reconciliacao** e a **ausencia de protecao contra regressao de status no webhook** sao riscos medios que devem ser enderecados nas primeiras semanas pos-lancamento. O endpoint GET do webhook sem autenticacao e uma questao de LGPD que precisa ser tratada.

Recomendacao: **NAO lancar** ate resolver os 4 criticos. Estimar 1-2 dias de trabalho para as correcoes prioritarias.
