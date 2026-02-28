# 08 -- Fluxo E2E: Conexao entre as Pecas

## Resumo

O fluxo E2E esta bem estruturado: client e server compartilham `calculateOrderTotals` como fonte de verdade, a validacao server-side recalcula tudo antes de aceitar o pedido, e o PagBank recebe os valores corretos em centavos. Ha achados criticos relacionados ao token do PagBank hardcoded como `_SANDBOX`, ao campo `payment_method` nunca ser salvo no banco, e a divergencia potencial entre soma dos items do PagBank e o total quando ha cupom com multiplos itens de quantidade > 1.

## Achados

### [CRITICO] Token PagBank hardcoded como SANDBOX em producao

- **Onde**: `src/app/api/pagbank/create-order/route.ts:128` e `src/app/api/pagbank/webhook/route.ts:177`
- **Problema**: O codigo usa `process.env.PAGBANK_TOKEN_SANDBOX` diretamente. Nao ha nenhuma referencia a `PAGBANK_TOKEN_PRODUCTION` ou `PAGBANK_TOKEN` generico em nenhum arquivo `.ts` do projeto. O fallback da URL da API tambem aponta para sandbox: `process.env.PAGBANK_API_URL || "https://sandbox.api.pagseguro.com"`.
- **Impacto**: Se em producao a env var for nomeada diferente (ex: `PAGBANK_TOKEN`), o pagamento falhara com erro 401/403. Se o nome `PAGBANK_TOKEN_SANDBOX` for mantido em producao com o token real, funciona, mas e confuso e propenso a erro humano em deploy.
- **Sugestao**: Criar uma funcao centralizada (ja existe `getPagBankToken()` em `src/utils/pagbank-config.ts:36` que le `PAGBANK_TOKEN_SANDBOX`) e usá-la em todos os endpoints. Renomear a env para `PAGBANK_TOKEN` (generico) ou implementar logica de ambiente: `process.env.PAGBANK_TOKEN || process.env.PAGBANK_TOKEN_SANDBOX`.

### [CRITICO] Campo `payment_method` nunca e salvo no banco de dados

- **Onde**: `src/lib/pagbank/create-order.ts:322-358` (`buildOrderUpdateData`)
- **Problema**: O schema Prisma tem `payment_method String?` (schema.prisma:70), mas `buildOrderUpdateData` nunca seta esse campo. Apos o pagamento ser processado, nao ha como saber se o pedido foi pago via PIX ou cartao, a menos que se infira pela presenca de `pix_qr_code` vs `payment_card_info`.
- **Impacto**: Consultas administrativas, relatorios financeiros, e logica de NF (Bling) que dependerem de `payment_method` receberao `null`. A inferencia por campos auxiliares e fragil.
- **Sugestao**: Adicionar `payment_method: paymentMethod === "pix" ? "pix" : "credit_card"` em `buildOrderUpdateData`.

### [MEDIO] Divergencia de soma de items PagBank com cupom rateado e quantidade > 1

- **Onde**: `src/lib/pagbank/create-order.ts:56-81` (`buildItemsFromPedido`)
- **Problema**: O rateio de cupom usa `Math.floor(itemDescontoCents / quantity)` para calcular `descontoPorUnidade`. O `floor` gera centavos perdidos. Exemplo: item de R$100 x qty 3, cupom de R$10. `itemDescontoCents=1000`, `descontoPorUnidade = floor(1000/3) = 333`. Preco final = `(10000-333)*3 = 29001` centavos. Mas o total real e `30000-1000 = 29000`. Sobram 1 centavo. O PagBank pode rejeitar se `sum(items) != charges.amount` em pedidos com cartao.
- **Impacto**: Potencial rejeicao do PagBank em cenarios especificos de rateio. Na pratica, o PagBank valida pelo `charges[].amount.value` (cartao) ou `qr_codes[].amount.value` (PIX), e os items sao informativos, entao o risco e baixo mas nao zero -- depende da validacao do PagBank.
- **Sugestao**: Adicionar ajuste de arredondamento na ultima unidade do item (similar ao que ja e feito para o ultimo item do array, estender para a ultima unidade de cada item).

### [MEDIO] Pedido deletado quando CPF ja existe e `salvar_minhas_informacoes=true`

- **Onde**: `src/lib/pedido/create-pedido.ts:168`
- **Problema**: Quando o usuario marca "salvar informacoes" mas ja existe um cliente com o mesmo CPF, o codigo deleta o pedido recem-criado (`prisma.pedido.delete`) e retorna erro 409. O pedido e perdido. Alem disso, a mensagem de erro diz "email" mas a busca e por CPF.
- **Impacto**: Se o usuario tinha a intencao de comprar sem criar conta (desmarcando a opcao), o pedido ja foi criado e deletado. Nota: no fluxo atual, `salvar_minhas_informacoes` e sempre `false` (hardcoded no `useCreateOrder.ts:166`), entao esse cenario nao ocorre na pratica hoje. Porem, se essa opcao for habilitada futuramente, causara perda de pedidos.
- **Sugestao**: Em vez de deletar o pedido, criar o pedido sem vincular conta e retornar sucesso com um aviso. Ou validar duplicidade de CPF ANTES de criar o pedido.

### [MEDIO] `data_nascimento` e obrigatoria no schema mas pode ser `undefined` no payload

- **Onde**: `src/hooks/checkout/useCreateOrder.ts:88-93` e `prisma/schema.prisma:23`
- **Problema**: O campo `data_nascimento` no schema Prisma e `DateTime` (obrigatorio, nao e `DateTime?`). No `useCreateOrder`, se o usuario nao preenche a data de nascimento, `dataNascimento` sera `undefined`. O `createPedidoFromBody` faz `new Date(body.data_nascimento)` que com `undefined` resulta em `Invalid Date`, causando erro do Prisma.
- **Impacto**: Se por algum motivo o campo nao for preenchido (mesmo marcado como obrigatorio no formulario), o pedido falha com erro 500 generico sem mensagem util para o usuario.
- **Sugestao**: Tornar o campo `DateTime?` no schema, ou adicionar validacao explicita no server antes de criar o pedido.

### [BAIXO] `ga_session_id` e `ga_session_number` nunca sao enviados pelo client

- **Onde**: `src/hooks/checkout/useCreateOrder.ts` (payload nao inclui esses campos) e `src/lib/pedido/create-pedido.ts:46-47`
- **Problema**: O `createPedidoFromBody` tenta salvar `body.ga_session_id` e `body.ga_session_number`, mas o payload montado em `useCreateOrder.ts` nao inclui esses campos. Eles serao sempre `null` no banco.
- **Impacto**: Perda de dados de analytics (sessao GA4) que seriam uteis para atribuicao de conversao. Nao afeta o fluxo de compra.
- **Sugestao**: Extrair os dados do cookie `_ga_*` no client (ou via server action) e incluir no payload do pedido.

### [BAIXO] Frete nao e enviado ao PagBank no pedido PIX

- **Onde**: `src/lib/pagbank/create-order.ts:118-146` (`buildPixOrderRequest`)
- **Problema**: O `buildPixOrderRequest` nao inclui `shipping` (endereco), enquanto `buildCardOrderRequest` inclui. O PagBank aceita pedidos PIX sem shipping, mas os dados de entrega nao ficam registrados na plataforma PagBank para pedidos PIX.
- **Impacto**: Nenhum impacto funcional. Apenas os dados de shipping nao aparecem no painel PagBank para pedidos PIX. Os dados estao salvos no banco local.
- **Sugestao**: Considerar adicionar `shipping` ao pedido PIX para consistencia no painel PagBank.

### [BAIXO] `pedidoId` nao persiste em navegacao -- recarregar a pagina perde o estado

- **Onde**: `src/app/(figma)/(checkout)/figma/checkout/pagamento/PagamentoPageClient.tsx:37`
- **Problema**: `pedidoId` e um `useState` (nao persistido). Se o usuario recarregar a pagina durante o pagamento PIX (ex: F5 apos gerar QR Code), o `pedidoId` se perde, o componente volta para tela de selecao, e um novo pedido sera criado ao clicar em "PIX" novamente. O pedido anterior fica pendente/abandonado no banco.
- **Impacto**: Pedidos duplicados/abandonados no banco. O usuario paga o PIX do pedido antigo mas o frontend redireciona para o novo pedido (que nao foi pago). No entanto, o webhook do PagBank atualizara o pedido antigo corretamente.
- **Sugestao**: Persistir `pedidoId` em `sessionStorage` ou `localStorage` e recuperar ao montar o componente. Verificar o status do pedido existente antes de criar um novo.

### [BAIXO] Limpeza pos-compra nao remove dados de identificacao e entrega

- **Onde**: `src/app/(figma)/(checkout)/figma/checkout/pagamento/PagamentoPageClient.tsx:176-178`
- **Problema**: Apos pagamento bem-sucedido, `clearCart()` e `clearCupons()` sao chamados e `checkoutPagamento` e removido, mas `checkoutIdentificacao` e `checkoutEntrega` sao mantidos intencionalmente. O comentario diz "Manter identificacao e entrega para proximas compras".
- **Impacto**: Nenhum impacto negativo -- e uma decisao de UX deliberada para facilitar re-compras. Os dados sensiveis (CPF, email, endereco) ficam no localStorage do usuario.
- **Sugestao**: Avaliar se manter CPF e dados pessoais em localStorage e aceitavel do ponto de vista de privacidade (LGPD). Considerar limpar apos X dias ou oferecer opcao ao usuario.

### [BAIXO] Client envia campos que o server ignora

- **Onde**: `src/hooks/checkout/useCreateOrder.ts:130-132` vs `src/lib/pedido/create-pedido.ts:15-48`
- **Problema**: O payload do client inclui campos `preco_de`, `desconto_percentual` e `imagem` dentro de cada item. Esses campos sao salvos porque `items` vai como `Json[]` no Prisma, entao sao persistidos. Nao ha filtragem server-side do conteudo dos items.
- **Impacto**: Nenhum impacto funcional. Esses campos extras sao usados para apresentacao (pagina de detalhes do pedido). Porem, como o JSON e armazenado sem sanitizacao, campos arbitrarios poderiam ser injetados (baixo risco pois sao apenas dados armazenados, nao executados).
- **Sugestao**: Considerar fazer whitelist dos campos aceitos em cada item no server antes de salvar.

## Respostas as Perguntas

### 1. Os dados que o CartContext/useCreateOrder enviam batem com o que a API /api/pedido espera?

**Sim, com ressalvas.** O `useCreateOrder` monta um payload completo com todos os campos que `createPedidoFromBody` espera. A correspondencia e:
- `nome`, `sobrenome`, `email`, `cpf`, `telefone`, `data_nascimento` -- OK
- `items` (com `reference_id`, `name`, `quantity`, `preco`, `unit_amount`) -- OK
- `cupons` (array de strings) -- OK
- `descontos`, `total_pedido`, `frete_calculado` -- OK
- `subtotal_produtos`, `cupom_valor`, `cupom_descricao` -- OK
- `salvar_minhas_informacoes` (hardcoded `false`), `aceito_receber_whatsapp` (hardcoded `false`) -- OK
- `ga_session_id`, `ga_session_number` -- **NAO ENVIADOS** pelo client (ver achado BAIXO)

### 2. Os totais do CartTotalsContext (client) batem com calculateOrderTotals (server)?

**Sim.** Ambos usam exatamente a mesma funcao `calculateOrderTotals` de `src/core/pricing/order-totals.ts`. O client chama via `calculateCartTotals` (em `src/utils/cart-calculations.ts:36`) que importa e usa `calculateOrderTotals`. O server chama em `validate-order.ts:159`. A mesma logica em centavos, mesma formula de cupom (multiplacar + diminuir). A tolerancia de R$0.50 (`PRICE_TOLERANCE`) absorve qualquer micro-diferenca de arredondamento.

### 3. O pedido no DB tem tudo que o PagBank precisa?

**Sim, com uma lacuna.** O pedido salvo contem todos os campos necessarios para construir o request PagBank: `nome`, `sobrenome`, `email`, `cpf`, `telefone`, `cep`, `endereco`, `numero`, `bairro`, `cidade`, `estado`, `items`, `total_pedido`, `cupom_valor`. A lacuna e que `payment_method` nunca e salvo de volta no banco apos pagamento (ver achado CRITICO).

### 4. Apos pagamento, carrinho e dados de checkout sao limpos corretamente?

**Parcialmente.** Em `handlePaymentSuccess` (PagamentoPageClient.tsx:172-178):
- `clearCart()` -- limpa state e localStorage
- `clearCupons()` -- limpa state e localStorage
- `localStorage.removeItem("checkoutPagamento")` -- OK
- `checkoutIdentificacao` e `checkoutEntrega` sao **mantidos** intencionalmente

O fluxo e adequado. A limpeza do carrinho e cupons acontece apos o tracking `ucPurchase` ser disparado (evitando perda de dados de analytics).

### 5. O fluxo funciona tanto logado quanto deslogado?

**Sim.** O `route.ts` do `/api/pedido` (linhas 88-136) trata ambos os cenarios:
- **Logado**: `getCurrentSession()` retorna sessao, `linkPedidoToLoggedCliente` vincula o pedido ao cliente
- **Deslogado**: Se `salvar_minhas_informacoes=true`, tenta criar conta (com risco descrito no achado MEDIO). Se `false` (caso atual hardcoded), simplesmente cria o pedido sem vincular a nenhum cliente.

O `useCreateOrder` nao precisa de autenticacao -- nao envia tokens. A verificacao de sessao e feita server-side via cookies.

### 6. Ha algum campo que o client envia e o server ignora (ou vice-versa)?

- **Client envia, server usa indiretamente**: `preco_de`, `desconto_percentual`, `imagem` dentro de items -- salvos como JSON sem filtragem
- **Client envia, server ignora**: nenhum campo e descartado explicitamente
- **Server espera, client nao envia**: `ga_session_id`, `ga_session_number` -- salvos como `null`
- **Server sobrescreve**: `total_pedido` e `descontos` sao substituidos pelos valores calculados pelo servidor (`totalSeguro`, `descontosSeguro`) -- comportamento correto de seguranca

## Conclusao

O fluxo E2E esta **bem arquitetado** do ponto de vista de seguranca e consistencia de dados. A decisao de usar `calculateOrderTotals` como fonte unica de verdade tanto no client quanto no server e acertada e elimina divergencias de calculo. A validacao server-side em `validate-order.ts` e robusta e previne manipulacao de precos.

Os dois achados criticos -- token PagBank hardcoded como `_SANDBOX` e `payment_method` nunca salvo -- devem ser corrigidos **antes do lancamento**. O primeiro pode causar falha total de pagamento se a configuracao de env nao for exatamente `PAGBANK_TOKEN_SANDBOX` em producao. O segundo impacta rastreabilidade e relatorios.

Os achados medios (rateio de cupom com arredondamento, persistencia de `pedidoId`) merecem atencao mas nao sao bloqueadores para o lancamento, pois o PagBank trata items como informativos e o cenario de recarregar pagina durante pagamento e incomum.
