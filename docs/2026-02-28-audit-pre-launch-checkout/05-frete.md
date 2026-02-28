# 05 — Frete

## Resumo

O frete e calculado no client via Frenet API (server action) e o valor e enviado como `frete_calculado` no payload do pedido. O server NAO recalcula o frete — apenas valida se esta no range 0-150. Isso abre uma brecha critica onde um atacante pode enviar `frete_calculado: 0` e obter frete gratis. A opcao "Frete Teste R$0,10" esta protegida por `NEXT_PUBLIC_DEV_TOOLS`, mas o `.env.master` (producao) NAO define essa variavel, o que a desativa corretamente.

## Achados

### [CRITICO] Server nao revalida o frete com a API Frenet — confia no valor do client

- **Onde**: `src/lib/pedido/validate-order.ts:28-36` (funcao `validateFrete`)
- **Problema**: A validacao server-side do frete e apenas um range check (`freteEnviado >= 0 && freteEnviado <= 150`). O server NAO recalcula o frete chamando a API Frenet com o CEP e os itens. O valor `frete_calculado` enviado pelo client e aceito diretamente. O `total_pedido` e recalculado pelo server via `calculateOrderTotals` usando esse mesmo `freteEnviado`, entao a consistencia interna e mantida — mas com base no frete que o client forneceu.
- **Impacto**: Um atacante pode interceptar a request POST para `/api/pedido` e alterar `frete_calculado` para `0` ou `0.01`. O `validateOrder` vai aceitar (esta no range 0-150), recalcular o total com frete=0, e o total vai bater. O pedido sera criado sem frete. O PagBank cobrara o total sem frete.
- **Sugestao**: Recalcular o frete no server chamando `calculateFreightFrenet(body.cep, items)` dentro de `validateOrder` e comparar com `freteEnviado`. Se a diferenca for maior que uma tolerancia (ex: R$1,00), rejeitar o pedido. Alternativamente, usar o valor calculado pelo server como valor autoritativo.

### [CRITICO] Possivel enviar frete=0 e nao pagar frete

- **Onde**: `src/lib/pedido/validate-order.ts:28-36`, `src/app/api/pedido/route.ts:20-26`
- **Problema**: A funcao `validateFrete` aceita qualquer valor entre 0 e 150 inclusive. Frete = 0 e um valor valido segundo essa logica. O `calculateOrderTotals` simplesmente soma `freteCents` ao total. Se freteCents = 0, o total nao inclui frete.
- **Impacto**: Perda financeira direta. Qualquer usuario com ferramentas de dev pode modificar o payload e obter frete gratis. Com trafego pago, bots ou scripts podem explorar isso sistematicamente.
- **Sugestao**: (1) Definir um frete minimo no server, OU (2) recalcular o frete no server via Frenet API e rejeitar se divergente. Se frete gratis for uma promocao valida no futuro, marcar explicitamente com uma flag verificavel.

### [MEDIO] Opcao "Frete Teste R$0,10" — protegida por NEXT_PUBLIC_DEV_TOOLS mas necessita atencao

- **Onde**: `src/app/actions/freight-actions.ts:198-206`
- **Problema**: A opcao de frete de teste (R$0,10, carrier "[DEV]", serviceCode "DEV_TEST") e injetada quando `process.env.NEXT_PUBLIC_DEV_TOOLS === "true"`. Analise dos arquivos de ambiente:
  - `.env` (local): `NEXT_PUBLIC_DEV_TOOLS=true` — ativo em dev (correto)
  - `.env.dev` (dev): `NEXT_PUBLIC_DEV_TOOLS=true` — ativo em dev (correto)
  - `.env.master` (producao): NAO define `NEXT_PUBLIC_DEV_TOOLS` — portanto `undefined`, opcao de teste NAO aparece em producao

  POREM ha risco residual: como `NEXT_PUBLIC_DEV_TOOLS` e `NEXT_PUBLIC_*`, ela e embedada no bundle JS no build time. Se o build de producao for feito com o `.env` errado, a opcao de teste apareceria em producao. O Dockerfile usa `ARG ENV_FILE=.env` como padrao — se nao especificarem `.env.master`, usa `.env` (que tem DEV_TOOLS=true).
- **Impacto**: Se o deploy usar o `.env` local por engano, a opcao "Frete Teste R$0,10" aparece para todos os usuarios.
- **Sugestao**: (1) Verificar que o pipeline de deploy sempre usa `--build-arg ENV_FILE=.env.master`. (2) Adicionar verificacao no server que rejeite fretes com serviceCode "DEV_TEST". (3) Considerar trocar o default do Dockerfile de `.env` para `.env.master` para fail-safe.

### [MEDIO] API Frenet fora do ar — fallback bloqueia o checkout

- **Onde**: `src/deprecated/hooks/useFreight.ts:180-195`, `src/app/actions/freight-actions.ts:220-226`
- **Problema**: Quando a API Frenet falha, `useFreight` seta `freightValue = DEFAULT_FREIGHT (15)`, `hasCalculated = false`, e `availableServices = []`. Com `hasCalculated = false`, a pagina de entrega redireciona o usuario de volta ao carrinho. O usuario fica preso: nao avanca para o checkout.
- **Impacto**: Se a Frenet estiver fora por minutos/horas, NENHUM pedido pode ser criado.
- **Sugestao**: Implementar fallback funcional: quando a Frenet falha, oferecer uma opcao de frete padrao (ex: "Entrega Padrao - R$15,00 - 5-10 dias uteis") como servico selecionavel, marcando `hasCalculated = true`.

### [MEDIO] CEP nao e validado no server

- **Onde**: `src/lib/pedido/validate-order.ts` (nenhuma validacao de CEP), `src/app/api/pedido/route.ts`
- **Problema**: O CEP (`body.cep`) e salvo diretamente no banco sem nenhuma validacao — nem formato, nem existencia. Um atacante pode enviar `cep: "00000000"` ou `cep: "abc"` ou string vazia.
- **Impacto**: CEPs invalidos no banco dificultam logistica. CEP falso gera entregas impossiveis.
- **Sugestao**: Adicionar validacao de CEP no server: formato (8 digitos numericos) e idealmente existencia via ViaCEP.

### [BAIXO] CEP pode mudar entre carrinho e checkout sem recalculo de frete

- **Onde**: `src/app/(figma)/(checkout)/figma/checkout/entrega/EntregaPageClient.tsx:164-170`
- **Problema**: O usuario calcula o frete no carrinho com CEP A. Na pagina de entrega, pode editar o CEP para CEP B. O frete e opcoes continuam do CEP A. O valor enviado no payload permanece calculado para CEP A, mas o CEP salvo no pedido sera CEP B.
- **Impacto**: Inconsistencia entre CEP de entrega e frete cobrado.
- **Sugestao**: (1) Tornar CEP da pagina de entrega read-only. OU (2) Recalcular frete automaticamente quando CEP mudar. OU (3) Verificar no server que o CEP do pedido corresponde ao CEP usado no calculo.

### [BAIXO] Constante `freteValue = 15` orfao em `src/utils/frete-value.ts`

- **Onde**: `src/utils/frete-value.ts:1`
- **Problema**: O arquivo exporta `export const freteValue = 15` que era usado no modelo antigo. Agora so e referenciado em codigo deprecated.
- **Impacto**: Risco de manutencao.
- **Sugestao**: Unificar ou remover `frete-value.ts`.

## Conclusao

**Status: BLOQUEANTE para lancamento**

A area de frete apresenta **2 vulnerabilidades criticas** que devem ser corrigidas antes do lancamento com trafego pago:

1. **O server nao revalida o frete** — aceita qualquer valor entre 0-150 vindo do client, permitindo frete gratis fraudulento.
2. **Frete = 0 e aceito** — nao ha frete minimo nem recalculo server-side.

**Prioridade de correcao sugerida**:
1. (P0) Recalcular frete no server via Frenet API dentro de `validateOrder`
2. (P0) Rejeitar fretes abaixo de um minimo (ou divergentes do calculo server-side)
3. (P1) Validar CEP no server (formato + existencia)
4. (P1) Garantir que o pipeline de deploy use `.env.master` e nunca `.env` em producao
5. (P2) Implementar fallback funcional quando Frenet esta fora
6. (P2) Impedir mudanca de CEP entre carrinho e checkout sem recalculo de frete
