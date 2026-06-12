# Meta CAPI Nova Love - log de implementacao e validacao

Data: 2026-06-12

Este documento registra o que foi feito depois do plano inicial em
`docs/2026-06-12-meta-nova-love-campaign-plan.md`.

## Contexto

A campanha da Nova Love precisava sair pronta para receber trafego da Meta,
preservar os parametros de clique e enviar `CompleteRegistration` para a Meta
via servidor quando o Google Forms fosse submetido.

O ponto mais importante era nao depender do GTM de outro dominio e nao alterar o
formato completo do `TRACKING_CONTEXT`, porque ele ja serve para outras partes do
fluxo.

## Token Meta CAPI

O primeiro token configurado era o token amplo usado para investigar campanhas,
conta de anuncios e historico. Ele funcionava, mas nao era adequado para runtime
da aplicacao.

Foi gerado um novo token diretamente no Events Manager:

- Dataset/pixel: `1332951988577735` (`Love - Novo Pixel 2025`)
- Caminho: Events Manager > Configuracoes > API de Conversoes > Configurar
  integracao direta
- Tipo validado pela Graph API: `SYSTEM_USER`
- Expiracao: `expires_at=0`, `data_access_expires_at=0`
- Escopo reportado: `read_ads_dataset_quality`

O valor do token nao deve ser documentado. Ele foi colocado apenas nas variaveis
de ambiente.

Observacao: durante a geracao, a Meta travou dois datasets selecionados na opcao
com Dataset Quality API. Mesmo assim, o token gerado e muito menos amplo do que o
token full usado para analise de campanhas.

## Variaveis de ambiente

Foram atualizadas:

- `.env`
- `.env.dev`
- `.env.master`

Configuracao final:

- `META_PIXEL_ID=1332951988577735` nos tres ambientes
- `META_CAPI_ACCESS_TOKEN` com o token CAPI dedicado nos tres ambientes
- `META_CAPI_TEST_EVENT_CODE` somente em local e dev
- `master` ficou sem `META_CAPI_TEST_EVENT_CODE`, para producao nao marcar
  eventos como teste

## Implementacao

Foi criada a tabela `landing_page_visits` para persistir o contexto de origem da
visita antes do usuario sair para o Google Forms.

Campos principais persistidos:

- `visitorId`
- `variant`
- `proposal`
- `assignmentSource`
- `landingPath`
- `landingUrl`
- `referrer`
- `userAgent`
- `clientIpAddress`
- `fbp`
- `fbc`
- `fbclid`
- UTMs: source, medium, campaign, content, term
- ambiente: `siteEnvironment`, `siteHost`, `siteOrigin`
- resposta Meta: `metaEventId`, `metaSentAt`, `metaResponse`

Arquivos principais:

- `prisma/schema.prisma`
- `prisma/migrations/20260612173000_add_landing_page_visits/migration.sql`
- `src/app/api/posthog/landing-visit/route.ts`
- `src/lib/posthog/landing-client.ts`
- `src/app/(figma)/(landing)/landing-pages/CoCriacaoLandingClient.tsx`
- `src/lib/meta/conversions-api.ts`
- `src/app/api/posthog/google-form-submit/route.ts`

## Captura na landing

Ao abrir `/landing-pages/nova-love`, o client envia um POST para
`/api/posthog/landing-visit`.

Ele captura:

- `_fbp`, quando existir
- `_fbc`, quando existir
- `fbclid`
- `_fbc` sintetizado a partir do `fbclid`, quando o cookie ainda nao existe
- `user_agent`
- `landing_url`
- `referrer`
- UTMs
- variante e proposta da landing

O envio e repetido algumas vezes logo apos a abertura da pagina para dar tempo
de cookies do Pixel/GTM aparecerem quando eles forem criados.

## Webhook do Google Forms

O webhook existente em `/api/posthog/google-form-submit` foi mantido e recebeu a
chamada adicional para a Meta CAPI.

O `TRACKING_CONTEXT` nao foi alterado. O webhook continua lendo o contexto
original do formulario e usa `visitor_id` para buscar a linha salva em
`landing_page_visits`.

O evento enviado para a Meta:

- `event_name`: `CompleteRegistration`
- `action_source`: `website`
- `event_source_url`: URL salva da landing, quando encontrada
- `event_id`: derivado do response id/visitor id para deduplicacao
- `user_data`: email hash, telefone hash, `_fbp`, `_fbc`, user-agent e IP quando
  disponiveis
- `custom_data`: nome do conteudo, variante, proposta, proposta escolhida,
  landing path, referrer, fbclid e UTMs

Falha no envio Meta nao quebra o webhook do Google Forms. O erro fica isolado no
log.

## Migration e generate

Foi executado com cuidado:

```bash
npx prisma migrate deploy
npx prisma generate
```

Resultado:

- Migration aplicada no banco local sem reset e sem limpeza de dados
- Prisma Client gerado com sucesso

## Validacao tecnica

Comandos/validacoes realizados:

- `npx prisma validate`: sucesso
- `npx prisma migrate deploy`: sucesso
- `npx prisma generate`: sucesso
- `npx tsc --noEmit`: falhou apenas por erro preexistente em
  `tests/unit/hooks/useCartValidation.test.tsx`

Erro preexistente observado:

```text
tests/unit/hooks/useCartValidation.test.tsx(84,12): Tuple type '[]' ...
tests/unit/hooks/useCartValidation.test.tsx(84,17): Tuple type '[]' ...
```

Nao apareceu erro TypeScript causado pela implementacao nova.

## Validacao do token CAPI

Depois de gerar o token dedicado, foi enviado um evento manual de teste para a
Meta.

Resposta da Graph API:

```json
{
  "events_received": 1,
  "messages": []
}
```

Depois, no Events Manager, o evento apareceu como:

- Evento: `Concluir inscricao`
- Origem: servidor
- Metodo: configuracao manual
- Status: processado

Isso confirmou que o token novo tem permissao real para enviar eventos ao
dataset/pixel correto.

## Teste completo do fluxo real

Foi feito um teste via MCP Chrome DevTools em uma aba isolada.

URL simulada de campanha:

```text
http://localhost:3000/landing-pages/nova-love?utm_source=meta&utm_medium=paid_social&utm_campaign=nova_love_cocriacao_2026_06&utm_content=img_0593_story_poll&utm_term=skincare_amazonia&fbclid=IwAR3mEtA_TEST_nova_love_20260612_1129
```

Tambem foi simulado `document.referrer` como:

```text
https://l.facebook.com/
```

Resultado da landing:

- Variante atribuida: `lp2`
- Proposta: `amazonia`
- `visitor_id`: `nl_f5514f83-e39f-45e1-b0f1-de4069fbcd8e`
- CTA levou para `/landing-pages/formulario` preservando UTMs e `visitor_id`
- `TRACKING_CONTEXT` permaneceu completo e sem alteracao de formato

Dados capturados no request `/api/posthog/landing-visit`:

- `landingUrl`
- `referrer`
- `userAgent`
- `fbclid`
- `_fbc` sintetizado
- UTMs
- `siteEnvironment=local`
- `siteHost=localhost:3000`
- `siteOrigin=http://localhost:3000`

Observacao: `_fbp` ficou `null` em localhost, porque o cookie do Pixel nao foi
criado no teste local. Em producao, com dominio real e Pixel carregado, a
tendencia e que `_fbp` exista.

## Submissao do formulario

O Google Forms foi preenchido com dados de teste:

- Nome: `Teste Meta CAPI Nova Love`
- WhatsApp: numero de teste
- Email: email de teste da Lovè
- Idade: `25-34 anos`
- Frequencia skincare: `Todos os dias`
- Gasto mensal: `R$ 150,00 - R$ 300,00`
- Influencias: `Resultados visiveis na pele` e `Ingredientes amazonicos
  exclusivos`
- Proposta escolhida: proposta B, `O Poder da Amazonia no seu Skincare Diario`

O Google Forms confirmou:

```text
Sua resposta foi registrada.
```

## Confirmacao na Meta

O Events Manager recebeu o evento novo:

- Evento: `Concluir inscricao`
- Status: `Processado`
- Recebido de: servidor
- Metodo: configuracao manual
- `event_id`: `complete_registration_2_ABaOnues...`
- Horario exibido pela Meta: `Hoje as 14:31:27`

Parametros exibidos pela Meta:

- `content_name=Nova Love Pesquisa ABC`
- `variant=lp2`
- `proposal=amazonia`
- `proposal_selected=B. O Poder da Amazonia no seu Skincare Diario...`
- `landing_path=/landing-pages/nova-love`
- `referrer=https://l.facebook.com/`
- `fbclid=IwAR3mEtA_TEST_nova_love_20260612_1129`
- `utm_source=meta`
- `utm_medium=paid_social`
- `utm_campaign=nova_love_cocriacao_2026_06`
- `utm_content=img_0593_story_poll`
- `utm_term=skincare_amazonia`

Chaves de usuario exibidas pela Meta:

- Email
- Telefone
- Agente do usuario
- Identificacao do clique

## Confirmacao no banco

A linha em `landing_page_visits` foi consultada pelo `visitorId`.

Foi confirmado:

- `fbp=null` no teste local
- `fbc` preenchido com valor sintetizado a partir do `fbclid`
- `fbclid` presente
- `referrer` presente
- `landingUrl` completa presente
- UTMs presentes
- `metaEventId` preenchido
- `metaSentAt` preenchido
- `metaResponse.status=200`
- `metaResponse.body.events_received=1`
- `metaResponse.test_event_code=true`

## Commit

Commit criado:

```text
bd51dd7 Add Meta CAPI tracking for Nova Love landing
```

O commit incluiu:

- Documentacao da campanha e do fluxo
- Migration da tabela `landing_page_visits`
- Captura client-side da visita
- Endpoint de persistencia da visita
- Helper Meta Conversions API
- Integracao do envio CAPI no webhook do Google Forms

Antes do commit, foi feita busca no diff staged por token bruto/codigo de teste.
Nenhum segredo Meta foi encontrado no conteudo commitado.

## Estado final

O fluxo esta validado ponta a ponta em ambiente local/dev com evento de teste da
Meta:

1. Link de campanha Meta abre a landing com UTMs e `fbclid`.
2. Landing salva contexto de origem no banco.
3. Usuario vai para o Google Forms com `visitor_id` no `TRACKING_CONTEXT`.
4. Google Forms chama o webhook.
5. Webhook busca a visita salva pelo `visitor_id`.
6. Webhook envia `CompleteRegistration` via Meta CAPI.
7. Meta recebe o evento com parametros de campanha e chaves de usuario.

Pendencias praticas antes de producao:

- Garantir que as envs reais de producao tenham o token CAPI dedicado.
- Garantir que `META_CAPI_TEST_EVENT_CODE` nao esteja configurado em producao.
- Rodar a migration em producao com `prisma migrate deploy`.
- Fazer um teste final em dominio real para confirmar `_fbp`.
