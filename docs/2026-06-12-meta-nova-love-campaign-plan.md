# Plano Meta Ads - Campanha Nova Love

Data: 2026-06-12

Documento operacional para preparar a campanha Meta Ads da pesquisa de co-criacao da Nova Love, usando o criativo `IMG_0593.JPEG`, as landing pages de producao e a instrumentacao PostHog/Google Forms ja existente.

## Resumo executivo

A estrutura tecnica da campanha esta pronta para producao:

- Landing principal: `https://www.lovecosmetics.com.br/landing-pages/nova-love`
- Formulario: `https://www.lovecosmetics.com.br/landing-pages/formulario`
- Teste ABC via PostHog feature flag: `landing-proposta-meta`
- Dashboard PostHog: `https://us.posthog.com/project/467332/dashboard/1704741`
- Pixel Meta ativo recomendado: `1332951988577735` (`Lovè - Novo Pixel 2025`)

A campanha pode ser deixada engatilhada na Meta com inicio futuro e baixo orcamento diario. O ponto tecnico mais importante antes de escalar e enviar `CompleteRegistration` para a Meta quando o Google Forms for submetido, preferencialmente via Meta Conversions API no webhook `form_submitted`.

## Validacao de producao

Teste feito em producao com:

```text
utm_source=meta
utm_medium=paid_social
utm_campaign=teste_abc_love
utm_content=prod_smoke
utm_term=abc
```

Resultado:

- A landing abriu corretamente em `www.lovecosmetics.com.br`.
- A feature flag sorteou a variante `lp3`.
- O CTA preservou `variant`, `visitor_id` e UTMs.
- O formulario Google Forms carregou no iframe.
- O campo tecnico `NAO PREENCHA - TRACKING_CONTEXT` foi preenchido corretamente.
- O `tracking_context` apontou para o webhook de producao:

```text
https://www.lovecosmetics.com.br/api/posthog/google-form-submit
```

Eventos confirmados no PostHog para `utm_content=prod_smoke`:

- `landing_viewed`
- `landing_cta_clicked`
- `form_started`

Nao foi feito submit real no Google Forms durante essa validacao.

## Estrutura atual das landing pages

Arquivo operacional relacionado:

```text
docs/2026-06-12-posthog-abc-landing-pages/README.md
```

Rotas principais:

- `src/app/(figma)/(landing)/landing-pages/nova-love/page.tsx`
- `src/app/(figma)/(landing)/landing-pages/formulario/page.tsx`
- `src/app/api/posthog/landing-event/route.ts`
- `src/app/api/posthog/google-form-submit/route.ts`
- `src/lib/posthog/landing-experiment.ts`
- `src/lib/posthog/server.ts`
- `src/lib/posthog/landing-client.ts`

Variantes:

- `lp1`: `biotecnologia`
- `lp2`: `amazonia`
- `lp3`: `ciencia`

Eventos PostHog do funil:

- `landing_viewed`: renderizacao da landing.
- `landing_cta_clicked`: clique no CTA.
- `form_started`: abertura do formulario.
- `form_submitted`: webhook do Google Forms via Apps Script.

Propriedades obrigatorias para analise:

- `variant`
- `proposal`
- `site_environment`
- `site_host`
- `site_origin`
- `utm_source`
- `utm_medium`
- `utm_campaign`
- `utm_content`
- `utm_term`

## Criativo recebido

Arquivo:

```text
C:\Users\Administrator\Downloads\IMG_0593.JPEG
```

Dimensoes:

- Largura: `2430`
- Altura: `3038`
- Proporcao: `0.800`, equivalente a `4:5`
- Formato: imagem vertical adequada para Instagram Feed e placements 4:5.

Uso recomendado:

- Feed Instagram
- Explore
- Profile Feed
- Facebook/Instagram Feed quando suportar 4:5

Para Stories/Reels, criar uma versao `9:16`. O criativo atual pode rodar em Stories/Reels com cortes, mas isso tende a prejudicar leitura e composicao.

## Consulta Meta Ads

Conta:

```text
LOVÉ COSMÉTICOS
act_1797025310799329
```

Moeda:

```text
BRL
```

Timezone da conta:

```text
America/Puerto_Rico
```

Status:

- `account_status`: ativo.
- Conta pre-paga.
- Saldo disponivel exibido pela API: `R$84,10 BRL`.
- `balance`: `0`.
- `spend_cap`: `1952827`.
- `amount_spent`: `1945439`.

Interpretacao operacional:

- O saldo exibido pelo funding source e `R$84,10`.
- A folga aproximada pelo `spend_cap` e `R$73,88`.
- Para evitar bloqueio por cap, tratar `R$73,88` como teto seguro ate confirmar ou ajustar o limite no Gerenciador da Meta.

## Performance Meta - ultimos 120 dias

Periodo consultado:

```text
2026-02-12 a 2026-06-12
```

Gasto total consultado:

```text
R$7.834,40
```

Campanha mais parecida para leads:

```text
[CBO][MOFU][AQ][LEADS/INSCRIÇÃO][GRUPO VIP] Comunicação Contínua
```

Metricas:

- Gasto: `R$91,73`
- Impressoes: `2.313`
- Alcance: `1.571`
- Cliques no link: `1.210`
- Registros: `10`
- Custo por registro: `R$9,17`
- Objetivo: `OUTCOME_LEADS`
- Otimizacao no conjunto: `OFFSITE_CONVERSIONS`
- Evento: `COMPLETE_REGISTRATION`
- Pixel: `1332951988577735`

Configuracao de publico usada nas campanhas de leads:

- Mulheres.
- Idade entre 18-40 ou 25-45, dependendo da campanha.
- Regioes: Norte, Nordeste e parte do Sudeste/Sul.
- Interesses:
  - Cosmeticos
  - Beleza
  - Spas
  - Cuidados com a pele
  - Cuidados naturais com a pele
  - Natureza
  - Meio ambiente
  - Moda sustentavel
- Placements recentes: principalmente Instagram.

## Recomendacao de campanha

Nome sugerido:

```text
[CBO][MOFU][AQ][Leads][Pesquisa] Nova Love ABC
```

Objetivo ideal:

```text
OUTCOME_LEADS
```

Condicao para usar esse objetivo com qualidade:

- Enviar `CompleteRegistration` para a Meta quando o Google Forms for submetido.
- Usar o pixel `1332951988577735`.
- Preferencialmente enviar via Meta Conversions API no webhook `src/app/api/posthog/google-form-submit/route.ts`.

Alternativa imediata, se nao houver CAPI ainda:

```text
OUTCOME_TRAFFIC
```

Neste caso, a Meta otimiza para trafego/visualizacao, e a qualidade real do funil fica no PostHog.

URL final:

```text
https://www.lovecosmetics.com.br/landing-pages/nova-love
```

UTMs recomendadas:

```text
utm_source=meta
utm_medium=paid_social
utm_campaign=nova_love_pesquisa_abc
utm_content={{ad.name}}
utm_term={{adset.name}}
```

URL com UTMs:

```text
https://www.lovecosmetics.com.br/landing-pages/nova-love?utm_source=meta&utm_medium=paid_social&utm_campaign=nova_love_pesquisa_abc&utm_content={{ad.name}}&utm_term={{adset.name}}
```

## Estrutura recomendada na Meta

Campanha:

- Tipo: CBO.
- Status inicial: publicada com inicio futuro, ou pausada se o objetivo for apenas montar a estrutura.
- Orcamento inicial: `R$12/dia`.
- Inicio futuro recomendado: apos revisao dos anuncios, ou manualmente no dia de start.

Conjunto:

```text
[M 25-45][N/NE/SE][Skincare Natureza Sustentabilidade]
```

Configuracao:

- Mulheres.
- 25-45 anos.
- Brasil, focando regioes ja usadas em campanhas anteriores.
- Interesses:
  - Cosmeticos
  - Beleza
  - Spas
  - Meio ambiente
  - Natureza
  - Moda sustentavel
  - Cuidados naturais com a pele
  - Cuidados com a pele
- Placements:
  - Instagram Feed
  - Instagram Explore
  - Instagram Profile Feed
  - Instagram Reels/Stories apenas se houver adaptacao 9:16.

Anuncios:

- `AD 01 - CRIATIVO PESQUISA 4x5`
- `AD 02 - CRIATIVO PESQUISA 4x5 - Copy Curta`
- `AD 03 - CRIATIVO PESQUISA 4x5 - Copy Produto Exclusivo`

CTA recomendado:

```text
LEARN_MORE
```

Ou, em portugues no Gerenciador:

```text
Saiba mais
```

## Copies sugeridas

### Copy 1 - Direta

```text
Ajude a construir a nova marca de cosmeticos da Amazonia.

Estamos ouvindo mulheres que se importam com skincare, bem-estar e inovacao.

Participe da nossa pesquisa e concorra a um produto exclusivo da Love.
```

### Copy 2 - Co-criacao

```text
A nova fase da Love esta sendo criada com quem realmente usa skincare.

Sua opiniao ajuda a definir quais narrativas, ativos e propostas fazem mais sentido para os proximos cosmeticos da Amazonia.

Responda a pesquisa e concorra a um produto exclusivo.
```

### Copy 3 - Beneficio

```text
Voce ama skincare?

Participe da pesquisa da Love e ajude a construir uma nova geracao de cosmeticos inspirados na Amazonia.

Participantes selecionadas receberao um produto exclusivo para testar.
```

Headline sugerida:

```text
Ajude a criar a Nova Love
```

Descricao:

```text
Responda a pesquisa e concorra a um produto exclusivo.
```

## Plano de credito ate quarta-feira

Data atual:

```text
sexta-feira, 2026-06-12
```

Quarta-feira que vem:

```text
2026-06-17
```

Saldo disponivel exibido:

```text
R$84,10
```

Teto seguro por `spend_cap`:

```text
R$73,88
```

Plano conservador:

| Data | Acao | Orcamento |
| --- | --- | ---: |
| 2026-06-12 | Smoke test e revisao | R$8 a R$10 |
| 2026-06-13 | Rodagem leve | R$12 |
| 2026-06-14 | Rodagem leve | R$12 |
| 2026-06-15 | Ajuste conforme PostHog | R$14 |
| 2026-06-16 | Manter melhor conjunto/anuncio | R$14 |
| 2026-06-17 | Fechamento e leitura | R$11,88 a R$13,88 |

Plano mais simples:

```text
R$12/dia por 5 dias = R$60
```

Isso deixa reserva operacional entre `R$13,88` e `R$24,10`, dependendo se o limite real for o spend cap ou o saldo exibido.

## Como deixar engatilhado

Opcao recomendada:

1. Criar campanha, conjunto e anuncios.
2. Publicar com inicio futuro.
3. Usar orcamento baixo (`R$12/dia`).
4. Deixar passar por revisao.
5. Conferir preview e URL final.
6. No dia de start, confirmar saldo, limite e PostHog.
7. Se tudo estiver correto, manter ativo.

Por que usar inicio futuro:

- Permite revisao antes do gasto.
- Reduz risco de descobrir problema so no momento de ativar.
- Mantem a campanha pronta para apenas iniciar.

Alternativa:

- Criar tudo pausado.
- Risco: algumas revisoes podem acontecer tarde ou so depois de ativar/publicar.

## Checklist antes de publicar

- Confirmar que a landing de producao abre:

```text
https://www.lovecosmetics.com.br/landing-pages/nova-love
```

- Confirmar que o formulario abre:

```text
https://www.lovecosmetics.com.br/landing-pages/formulario
```

- Confirmar PostHog para ambiente `production`.
- Confirmar `NEXT_PUBLIC_COCREATE_GOOGLE_FORMS_RETURN_URL` em producao:

```text
https://www.lovecosmetics.com.br/api/posthog/google-form-submit
```

- Confirmar secret do Apps Script e backend.
- Confirmar que o criativo 4:5 esta legivel no preview.
- Criar versao 9:16 se for rodar Stories/Reels.
- Confirmar saldo e limite de gasto na Meta.
- Confirmar que nao ha token/segredo commitado.

## Recomendacao tecnica antes de escalar

Implementar envio de evento Meta CAPI no webhook:

```text
src/app/api/posthog/google-form-submit/route.ts
```

Evento recomendado:

```text
CompleteRegistration
```

Pixel:

```text
1332951988577735
```

Dados para evento:

- `event_name`: `CompleteRegistration`
- `event_time`: horario do submit
- `event_source_url`: URL de origem da landing/formulario
- `action_source`: `website`
- `event_id`: deterministico por `response_id`, quando disponivel
- `user_data`:
  - email normalizado e hasheado
  - telefone/WhatsApp normalizado e hasheado
  - `client_ip_address`, se disponivel
  - `client_user_agent`, se disponivel
- `custom_data`:
  - `content_name`: `Nova Love Pesquisa ABC`
  - `utm_source`
  - `utm_medium`
  - `utm_campaign`
  - `utm_content`
  - `utm_term`
  - `variant`
  - `proposal`

Com isso, a Meta consegue otimizar para registros reais, e o PostHog continua sendo a fonte analitica para comparar variantes e qualidade do funil.

## Decisao recomendada

Para comecar hoje com o menor risco:

1. Criar campanha com inicio futuro e `R$12/dia`.
2. Usar objetivo de trafego se nao for implementar CAPI agora.
3. Medir qualidade no PostHog.
4. Implementar CAPI `CompleteRegistration` antes de aumentar orcamento.

Para comecar do jeito mais correto:

1. Implementar CAPI no webhook do Google Forms.
2. Criar campanha `OUTCOME_LEADS`.
3. Otimizar para `CompleteRegistration`.
4. Rodar `R$12/dia` ate 2026-06-17.
5. Escalar somente se `form_submitted` e custo por lead estiverem aceitaveis.

