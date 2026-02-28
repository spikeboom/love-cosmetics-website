# 03 -- Criacao de Pedido

## Resumo

O fluxo de criacao de pedido possui uma validacao server-side robusta de precos e cupons (recalcula tudo a partir do Strapi), porem apresenta falhas criticas na ausencia de protecao contra pedidos duplicados, validacao incompleta de dados pessoais no servidor, e frete confiado integralmente ao client. A falta de transacao atomica entre as operacoes de banco tambem cria risco de estado inconsistente.

## Achados

### [CRITICO] Frete nao e recalculado no servidor -- confia no valor enviado pelo client

- **Onde**: `src/lib/pedido/validate-order.ts:28-36` e `src/lib/pedido/create-pedido.ts:35`
- **Problema**: A funcao `validateFrete()` apenas verifica se o frete esta entre 0 e 150 reais. O servidor nao recalcula o frete consultando a API de transportadora (Correios/Melhor Envio). O valor `body.frete_calculado` enviado pelo client e gravado diretamente no banco sem recalculo. Um atacante pode enviar `frete_calculado: 0` para qualquer CEP e o pedido sera criado com frete gratis.
- **Impacto**: Perda financeira direta. Qualquer usuario com conhecimento basico de DevTools pode alterar o frete para zero no payload da requisicao POST `/api/pedido`.
- **Sugestao**: Recalcular o frete no servidor usando o CEP e os items do pedido (peso/dimensoes). No minimo, validar contra o cache do calculo de frete ja realizado (armazenar server-side com uma chave de sessao). Alternativa pragmatica: chamar a mesma API de frete usada no front e comparar com tolerancia.

### [CRITICO] Sem protecao contra pedido duplicado (duplo clique / re-submit)

- **Onde**: `src/hooks/checkout/useCreateOrder.ts:60-210`, `src/app/(figma)/(checkout)/figma/checkout/pagamento/PagamentoPageClient.tsx:87-105`, `src/app/(figma)/(checkout)/figma/checkout/pagamento/components/PagamentoSelecao.tsx:107-114`
- **Problema**: Existem multiplos vetores de duplicacao:
  1. O hook `useCreateOrder` usa `loading` state para controlar concorrencia, mas a funcao `createOrder` nao verifica `loading` antes de executar -- ela simplesmente seta `setLoading(true)`. Se o React ainda nao re-renderizou, dois cliques rapidos disparam duas chamadas.
  2. O componente `PagamentoPageClient` verifica `if (pedidoId)` para evitar recriar, mas entre o primeiro clique e a resposta da API, `pedidoId` ainda e `null`, permitindo uma segunda chamada.
  3. O botao "Finalizar compra" em `PagamentoSelecao` nao tem `disabled` durante loading -- nao recebe a prop `loading`/`creatingOrder` e portanto nao desabilita durante a requisicao.
  4. A API `POST /api/pedido` nao possui nenhuma chave de idempotencia.
- **Impacto**: Pedidos duplicados no banco de dados para a mesma compra. O cliente pode acabar pagando duas vezes ou gerar confusao operacional (dois pedidos para o mesmo cliente/momento).
- **Sugestao**:
  1. Adicionar guard `if (loading) return` no inicio de `createOrder`.
  2. Passar `creatingOrder` como prop para `PagamentoSelecao` e desabilitar o botao.
  3. Implementar idempotency key: o client gera um UUID unico por tentativa de compra, envia no header, e o server usa `@@unique` ou `upsert` para rejeitar duplicatas.
  4. Considerar uma constraint no banco (ex: hash de cpf + items + timestamp truncado).

### [CRITICO] Sem validacao server-side de CPF, email, endereco e telefone

- **Onde**: `src/app/api/pedido/route.ts:15` (faz `req.json()` sem validacao), `src/lib/pedido/create-pedido.ts:6-48` (grava `body.*` diretamente)
- **Problema**: O servidor nao valida nenhum campo pessoal do payload:
  - **CPF**: Nenhuma validacao de checksum no server. Um CPF invalido (ex: `00000000000`, `12345678900`) e aceito e gravado. O `validarCPF` com checksum existe em `src/lib/checkout/validation.ts` mas so e usado no client.
  - **Email**: Nenhuma validacao de formato no server. Strings vazias ou mal-formadas sao aceitas.
  - **Endereco**: Campos como `cep`, `rua`, `bairro`, `cidade`, `estado` nao sao validados no server. Valores vazios ou absurdos sao gravados.
  - **Telefone**: Nenhuma validacao de formato.
  - **Nome/Sobrenome**: Podem ser strings vazias.
- **Impacto**: Pedidos com dados invalidos que impedem entrega, emissao de NF (Bling), e contato com o cliente. Atacantes podem injetar dados arbitrarios. CPF invalido pode causar rejeicao na emissao de NF-e pelo Bling/SEFAZ.
- **Sugestao**: Aplicar o mesmo schema Zod (`identificacaoSchema` e `entregaSchema` de `src/lib/checkout/validation.ts`) no server-side, dentro de `route.ts`, antes de chamar `createPedidoFromBody`. Rejeitar com 400 se invalido.

### [MEDIO] Ausencia de transacao atomica -- estado inconsistente em falha parcial

- **Onde**: `src/app/api/pedido/route.ts:94-134`
- **Problema**: A criacao do pedido envolve multiplas operacoes de banco que nao estao em uma transacao:
  1. `createPedidoFromBody` -- cria o `Pedido` (linha 94)
  2. `linkPedidoToLoggedCliente` -- cria `PedidoCliente` + atualiza `Cliente` (linha 106)
  3. `createAccountForOrderIfRequested` -- cria `Cliente` + `PedidoCliente` + `Session` (linha 120)

  Se a operacao 1 sucede mas a 2 ou 3 falha, o pedido existe no banco sem vinculo ao cliente. Pior: em `createAccountForOrderIfRequested`, se a criacao da conta falha apos o pedido ser criado, o catch na linha 181 retorna silenciosamente sem reportar erro -- o pedido fica orfao e a resposta 201 e retornada com `contaCriada: false`, mas o pedido ja foi criado.
- **Impacto**: Pedidos orfaos no banco sem cliente vinculado. Falhas silenciosas dificultam debugging. No cenario do CPF ja existente (linha 168), o pedido e deletado explicitamente, mas no catch generico (linha 181) nao.
- **Sugestao**: Usar `prisma.$transaction()` para agrupar todas as operacoes. Se qualquer etapa falhar, fazer rollback completo. No minimo, logar o erro no catch vazio da linha 83 e da linha 181.

### [MEDIO] Erros silenciados em catch vazio

- **Onde**: `src/lib/pedido/create-pedido.ts:83-84` (`linkPedidoToLoggedCliente`) e `src/lib/pedido/create-pedido.ts:181-185` (`createAccountForOrderIfRequested`)
- **Problema**:
  1. Linha 83: o catch de `linkPedidoToLoggedCliente` e completamente vazio -- se o vinculo pedido-cliente falhar, nada e logado e nenhum erro e retornado. O pedido e criado sem vinculo.
  2. Linha 181: o catch de `createAccountForOrderIfRequested` retorna `{ clienteId: null, contaCriada: false }` sem logar o erro. O chamador em `route.ts` nao verifica se `clienteId` e null neste caso e retorna 201 como se tudo estivesse ok.
- **Impacto**: Falhas invisiveis em producao. Dificuldade de diagnostico. Pedidos sem vinculo a conta do cliente.
- **Sugestao**: Adicionar logging em ambos os catch blocks. Considerar se a falha de vinculo deve impedir a criacao do pedido (e fazer rollback) ou se e aceitavel continuar com warning.

### [MEDIO] data_nascimento pode causar crash se ausente ou invalida

- **Onde**: `src/lib/pedido/create-pedido.ts:22`
- **Problema**: A linha `data_nascimento: new Date(body.data_nascimento)` e executada sem verificacao. Se `body.data_nascimento` for `undefined`, `null`, ou string invalida, `new Date(undefined)` retorna `Invalid Date`, o que pode causar erro no Prisma ao tentar inserir no banco (campo `DateTime` not null no schema).
- **Impacto**: Erro 500 na criacao do pedido se o campo estiver ausente. Diferente de `linkPedidoToLoggedCliente` (linha 79) e `createAccountForOrderIfRequested` (linha 125) que fazem check condicional, o `createPedidoFromBody` nao faz.
- **Sugestao**: Adicionar validacao: `data_nascimento: body.data_nascimento ? new Date(body.data_nascimento) : null` (se o schema permitir null) ou rejeitar com 400 se ausente.

### [MEDIO] PRICE_TOLERANCE de R$ 0.50 e excessivamente permissiva

- **Onde**: `src/lib/strapi/index.ts:5`, usada em `src/lib/pedido/validate-order.ts:113,170,180`
- **Problema**: A tolerancia de R$ 0.50 e aplicada em tres comparacoes:
  1. Preco de cada item individual (linha 113)
  2. Desconto total do cupom (linha 170)
  3. Total do pedido (linha 180)

  Para um pedido com 5 items, a tolerancia acumulada pode chegar a R$ 2.50 (5x R$0.50 nos items) + R$ 0.50 no desconto + R$ 0.50 no total. Um atacante sofisticado pode explorar isso para obter descontos sistematicos de ate R$ 0.50 por pedido manipulando o total.
- **Impacto**: Perda financeira pequena por pedido, mas significativa em volume com trafego pago.
- **Sugestao**: Reduzir para R$ 0.02 (margem de arredondamento real de centavos) ou usar comparacao em centavos inteiros (como ja e feito internamente em `calculateOrderTotals`). A tolerancia no total deveria ser calculada como funcao do numero de items, nao um valor fixo.

### [MEDIO] Sem rate limiting na API de criacao de pedido

- **Onde**: `src/app/api/pedido/route.ts`
- **Problema**: A rota `POST /api/pedido` nao possui nenhum rate limiting. Um atacante pode enviar milhares de requisicoes para:
  1. Criar pedidos spam no banco (DoS/poluicao de dados)
  2. Testar cupons por forca bruta (a validacao do cupom no Strapi e chamada a cada request)
  3. Sobrecarregar a API do Strapi (busca de produtos e cupons a cada request)
- **Impacto**: Degradacao de performance, custos de infraestrutura, poluicao do banco de dados.
- **Sugestao**: Implementar rate limiting por IP e/ou por sessao. Usar middleware como `next-rate-limit` ou Vercel Edge Config. Limitar a 5-10 pedidos por minuto por IP.

### [BAIXO] localStorage corrompido causa erro generico sem orientacao ao usuario

- **Onde**: `src/hooks/checkout/useCreateOrder.ts:67-78`
- **Problema**: Se os dados do localStorage (`checkoutIdentificacao` ou `checkoutEntrega`) estiverem corrompidos (JSON invalido), o `JSON.parse` na linha 78-79 lanca excecao que e capturada pelo catch generico (linha 204), retornando apenas "Erro ao criar pedido" sem indicar que o usuario precisa preencher os dados novamente.
- **Impacto**: Experiencia ruim para o usuario -- ve erro generico sem saber como resolver. Pode acontecer em cenarios reais: limpeza parcial de cache, extensoes de browser, etc.
- **Sugestao**: Wrap o `JSON.parse` em try/catch especifico e retornar mensagem orientando o usuario a voltar para a etapa de identificacao/entrega. Limpar os dados corrompidos do localStorage.

### [BAIXO] Pedido criado antes do pagamento -- acumulo de pedidos nao pagos

- **Onde**: `src/app/api/pedido/route.ts:94`, `src/app/(figma)/(checkout)/figma/checkout/pagamento/PagamentoPageClient.tsx:87-105`
- **Problema**: O pedido e criado no banco ANTES de qualquer tentativa de pagamento. Se o usuario desistir na tela de pagamento, o pedido permanece no banco com `status_pagamento: null`. Nao ha mecanismo de limpeza (TTL) para pedidos abandonados.
- **Impacto**: Acumulo de registros no banco. Pode distorcer metricas de conversao. Pedidos com cupom "BEMVINDOLOVE15" ocupam o status de "sem primeira compra" para aquele CPF/email (embora a validacao cheque apenas `PAID`/`AUTHORIZED`, entao nao bloqueia -- este impacto e menor).
- **Sugestao**: Implementar job de limpeza (cron) que deleta ou marca como expirados pedidos com `status_pagamento IS NULL` apos 24-48 horas. Alternativa: criar o pedido apenas apos a primeira tentativa de pagamento.

### [BAIXO] Cupom de primeira compra verifica apenas pedidos pagos -- bypass possivel com pedidos estornados

- **Onde**: `src/app/api/pedido/route.ts:68-74`
- **Problema**: A validacao do cupom `BEMVINDOLOVE15` busca apenas pedidos com `status_pagamento: { in: ["PAID", "AUTHORIZED"] }`. Um usuario pode: (1) fazer uma compra e pagar, (2) solicitar estorno/chargeback, (3) usar o cupom novamente em outra compra. Se o status do pedido original for atualizado para `REFUNDED`/`CANCELLED`, o cupom volta a funcionar.
- **Impacto**: Reuso do cupom de primeira compra apos estorno. Perda financeira moderada.
- **Sugestao**: Incluir tambem status como `REFUNDED` e `CANCELLED` na busca, ou manter uma tabela separada `CupomUsado` (que ja existe no schema Prisma mas nao e usada aqui).

## Conclusao

A area de criacao de pedido tem uma base solida na validacao de precos (recalculo server-side a partir do Strapi, comparacao com `calculateOrderTotals`), porem apresenta **3 achados criticos** que precisam ser resolvidos antes do lancamento com trafego pago:

1. **Frete nao recalculado no servidor** -- permite frete zero fraudulento
2. **Sem protecao contra pedidos duplicados** -- risco operacional significativo
3. **Sem validacao server-side de dados pessoais** -- pedidos com dados invalidos, risco de falha em NF-e

Alem disso, a ausencia de transacoes atomicas e rate limiting, combinada com erros silenciados, cria fragilidades que podem se manifestar sob carga real de trafego pago. Recomendo priorizar os itens criticos e os erros silenciados antes do go-live.
