# PostHog ABC Landing Pages

Documentacao operacional do teste ABC das landing pages da Nova Love, com PostHog, Google Forms e Apps Script.

## URLs principais

### Projeto local

- Projeto: `C:\Users\Administrator\Documents\Love Drive\NextLove\love-cosmetics-website`
- Landing local: `http://localhost:3000/landing-pages/nova-love?utm_source=meta&utm_medium=paid_social&utm_campaign=teste_abc_love&utm_content=codex_test&utm_term=abc`
- Formulario local: `http://localhost:3000/landing-pages/formulario`

### Dev e producao

- Landing dev: `https://dev.lovecosmetics.com.br/landing-pages/nova-love?utm_source=meta&utm_medium=paid_social&utm_campaign=teste_abc_love&utm_content=dev_test&utm_term=abc`
- Landing producao: `https://www.lovecosmetics.com.br/landing-pages/nova-love?utm_source=meta&utm_medium=paid_social&utm_campaign=teste_abc_love&utm_content=prod_test&utm_term=abc`

### PostHog

- Dashboard ABC: `https://us.posthog.com/project/467332/dashboard/1704741`
- Activity/Eventos: `https://us.posthog.com/project/467332/activity/explore`
- Feature flags: `https://us.posthog.com/project/467332/feature_flags`
- Experiments: `https://us.posthog.com/project/467332/experiments`
- Project settings: `https://us.posthog.com/project/467332/settings/project`

Cards principais no dashboard:

- `Local - Landing views by variant`: `https://us.posthog.com/project/467332/insights/1hQZL3UM`
- `Local - CTA clicks by variant`: `https://us.posthog.com/project/467332/insights/lsBq0xpK`
- `Local - Form submissions by variant`: `https://us.posthog.com/project/467332/insights/jXOZryyg`
- `Local - ABC Funnel by variant`: `https://us.posthog.com/project/467332/insights/8BCdOJ5y`
- `Dev - Landing views by variant`: `https://us.posthog.com/project/467332/insights/xYAWwmpX`
- `Dev - CTA clicks by variant`: `https://us.posthog.com/project/467332/insights/XAwPhEyj`
- `Dev - Form submissions by variant`: `https://us.posthog.com/project/467332/insights/dKgSmbOy`
- `Dev - ABC Funnel by variant`: `https://us.posthog.com/project/467332/insights/OFlnHaDd`
- `Production - Landing views by variant`: `https://us.posthog.com/project/467332/insights/LBMWZVXI`
- `Production - CTA clicks by variant`: `https://us.posthog.com/project/467332/insights/bp6Lqr1v`
- `Production - Form submissions by variant`: `https://us.posthog.com/project/467332/insights/vrpcY0Kb`
- `Production - ABC Funnel by variant`: `https://us.posthog.com/project/467332/insights/3cmsiXQA`

Insights antigos, sem filtro por ambiente, foram removidos do dashboard para evitar mistura entre `local`, `dev` e `production`.

### Google Forms e Apps Script

- Google Form editor: `https://docs.google.com/forms/d/14vK7bnpt3DErIEE8gRPZEM3kEG7IjAWOF6Um-2LmVhg/edit`
- Google Form publico/embed base: `https://docs.google.com/forms/d/e/1FAIpQLSeKrVlVskWt-YYfFVMRZEMKGtoHpZe01st9f7q9JzTCeS0fRA/viewform`
- Apps Script editor: `https://script.google.com/u/0/home/projects/1Gh3MHjjt-N-RPpssR-GBITQJVmzPZEKNgleOCAWWt6wx2guvDRUN5SBw/edit`
- Apps Script execucoes: `https://script.google.com/u/0/home/projects/1Gh3MHjjt-N-RPpssR-GBITQJVmzPZEKNgleOCAWWt6wx2guvDRUN5SBw/executions`

## Variantes

O teste usa a feature flag PostHog `landing-proposta-meta`.

- `lp1`: `biotecnologia`
- `lp2`: `amazonia`
- `lp3`: `ciencia`

## Eventos PostHog

Eventos customizados do funil:

- `landing_viewed`: disparado no servidor ao renderizar `/landing-pages/nova-love`
- `landing_cta_clicked`: disparado ao clicar no CTA da landing
- `form_started`: disparado ao abrir `/landing-pages/formulario`
- `form_submitted`: disparado pelo webhook do Google Forms via Apps Script

Propriedades obrigatorias para analise:

- `variant`: `lp1`, `lp2` ou `lp3`
- `proposal`: `biotecnologia`, `amazonia` ou `ciencia`
- `site_environment`: `local`, `dev`, `production` ou `unknown`
- `site_host`: exemplo `localhost:3000`, `dev.lovecosmetics.com.br`, `www.lovecosmetics.com.br`
- `site_origin`: exemplo `http://localhost:3000`
- `utm_source`
- `utm_medium`
- `utm_campaign`
- `utm_content`
- `utm_term`

## Ambientes

A segmentacao do dashboard depende de `site_environment`.

- `local`: `localhost`, `127.0.0.1` e dominio `*.ngrok-free.dev`
- `dev`: `dev.lovecosmetics.com.br`
- `production`: `www.lovecosmetics.com.br` e `lovecosmetics.com.br`
- `unknown`: fallback quando nao for possivel inferir

O dashboard tem 12 cards separados: 4 para `Local`, 4 para `Dev`, 4 para `Production`. Todos usam filtro `site_environment` e breakdown por `variant`.

## Tracking Context do Google Forms

O Google Form tem um campo tecnico:

```text
NAO PREENCHA - TRACKING_CONTEXT
```

O projeto Love preenche esse campo com JSON. Exemplo local:

```json
{
  "visitor_id": "nl_xxx",
  "variant": "lp2",
  "utm_source": "meta",
  "utm_medium": "paid_social",
  "utm_campaign": "teste_abc_love",
  "utm_content": "codex_test",
  "utm_term": "abc",
  "return_url": "https://outmoded-clair-pectic.ngrok-free.dev/api/posthog/google-form-submit",
  "site_environment": "local",
  "site_host": "localhost:3000",
  "site_origin": "http://localhost:3000"
}
```

O Apps Script nao precisa entender `site_environment`. Ele repassa `answers` para o webhook do projeto Love, e o webhook le `answers.tracking_context`.

## Algoritmo do Apps Script

Resumo:

```text
Google Forms submit
  -> onFormSubmitPostHog(event)
  -> le todas as respostas
  -> copia "NAO PREENCHA - TRACKING_CONTEXT" para answers.tracking_context
  -> parseia tracking_context.return_url
  -> valida return_url contra allowlist
  -> POST para return_url ou WEBHOOK_URL default
  -> envia secret, form_id, response_id, submitted_at e answers
```

Allowlist de webhooks:

- `https://outmoded-clair-pectic.ngrok-free.dev/api/posthog/google-form-submit`
- `https://dev.lovecosmetics.com.br/api/posthog/google-form-submit`
- `https://www.lovecosmetics.com.br/api/posthog/google-form-submit`

## Variaveis de ambiente

Variaveis relevantes no projeto Love:

- `POSTHOG_KEY`
- `POSTHOG_HOST`
- `NEXT_PUBLIC_POSTHOG_KEY`
- `NEXT_PUBLIC_POSTHOG_HOST`
- `GOOGLE_FORMS_WEBHOOK_SECRET`
- `NEXT_PUBLIC_COCREATE_GOOGLE_FORM_EMBED_URL`
- `NEXT_PUBLIC_COCREATE_GOOGLE_FORM_VIEW_URL`
- `NEXT_PUBLIC_COCREATE_GOOGLE_FORM_ENTRY_TRACKING_CONTEXT`
- `NEXT_PUBLIC_COCREATE_GOOGLE_FORMS_RETURN_URL`

Regras:

- Local deve usar `NEXT_PUBLIC_COCREATE_GOOGLE_FORMS_RETURN_URL` apontando para o ngrok.
- Dev deve usar `https://dev.lovecosmetics.com.br/api/posthog/google-form-submit`.
- Producao deve usar `https://www.lovecosmetics.com.br/api/posthog/google-form-submit`.
- O secret do Apps Script e do backend precisa bater com `GOOGLE_FORMS_WEBHOOK_SECRET`.

## Como testar com Codex e Chrome DevTools MCP

Use sempre contextos isolados no Chrome MCP para simular cache/cookies limpos:

```text
isolatedContext: abc-submit-1
isolatedContext: abc-submit-2
isolatedContext: abc-submit-3
```

### Teste sem submit

Objetivo: validar funil ate abertura do formulario.

1. Abrir a landing local em contexto isolado:

```text
http://localhost:3000/landing-pages/nova-love?utm_source=meta&utm_medium=paid_social&utm_campaign=teste_abc_love&utm_content=mcp_no_submit_1&utm_term=abc
```

2. Ler `variant` e `visitor_id` do link do CTA.
3. Clicar no CTA.
4. Confirmar que o iframe do Forms carregou.
5. Confirmar que `NAO PREENCHA - TRACKING_CONTEXT` esta preenchido.
6. Nao clicar em `Enviar`.
7. Na Activity, validar:

- `landing_viewed`
- `landing_cta_clicked`
- `form_started`
- ausencia de `form_submitted` para esse `utm_content`

### Teste com submit

Objetivo: validar funil completo, incluindo Apps Script e webhook.

1. Abrir a landing local em contexto isolado:

```text
http://localhost:3000/landing-pages/nova-love?utm_source=meta&utm_medium=paid_social&utm_campaign=teste_abc_love&utm_content=mcp_submit_N&utm_term=abc
```

2. Clicar no CTA.
3. Confirmar no campo `NAO PREENCHA - TRACKING_CONTEXT`:

- `visitor_id`
- `variant`
- UTMs
- `return_url`
- `site_environment`
- `site_host`
- `site_origin`

4. Preencher o Google Forms com dados de teste:

```text
Nome: Teste MCP Submit N
WhatsApp: 1199999000N
E-mail: mcp.submitN@example.com
```

5. Escolher respostas obrigatorias.
6. Clicar `Enviar`.
7. Aguardar `Sua resposta foi registrada`.
8. Na Activity, filtrar pelo `utm_content` usado e validar:

- `landing_viewed`
- `landing_cta_clicked`
- `form_started`
- `form_submitted`

9. Validar propriedades do `form_submitted`:

- `variant`
- `proposal`
- `site_environment`
- `site_host`
- `site_origin`
- `utm_content`
- mesmo `distinct_id`/`visitor_id` do funil

10. Abrir/atualizar dashboard:

```text
https://us.posthog.com/project/467332/dashboard/1704741
```

11. Conferir a secao correta:

- Local: testes localhost/ngrok
- Dev: testes `dev.lovecosmetics.com.br`
- Production: testes `www.lovecosmetics.com.br`

### Consulta util na aba Activity

Na aba `https://us.posthog.com/project/467332/activity/explore`, Codex pode usar a API autenticada no console do Chrome MCP:

```js
async () => {
  const res = await fetch('/api/projects/467332/events/?limit=250', {
    credentials: 'include',
  });
  const data = await res.json();
  const wanted = new Set(['mcp_submit_1', 'mcp_submit_2', 'mcp_submit_3']);
  return data.results
    .filter((event) => wanted.has(event.properties?.utm_content))
    .map((event) => ({
      event: event.event,
      variant: event.properties?.variant,
      proposal: event.properties?.proposal,
      site_environment: event.properties?.site_environment,
      site_host: event.properties?.site_host,
      site_origin: event.properties?.site_origin,
      utm_content: event.properties?.utm_content,
      person: event.distinct_id,
      time: event.timestamp,
    }));
}
```

## O que foi feito

- Criado teste ABC com variantes `lp1`, `lp2`, `lp3`.
- Integrado PostHog server-side para avaliar feature flag e registrar `landing_viewed`.
- Integrado tracking client-side/endpoint server para `landing_cta_clicked` e `form_started`.
- Integrado webhook `form_submitted` via Google Forms + Apps Script.
- Consolidado tracking do Google Forms em um unico campo especial: `NAO PREENCHA - TRACKING_CONTEXT`.
- Adicionada segmentacao por ambiente com:
  - `site_environment`
  - `site_host`
  - `site_origin`
- Configurado dashboard PostHog com cards separados por `Local`, `Dev` e `Production`.
- Removidos do dashboard os cards antigos sem filtro por ambiente para evitar mistura de dados.
- Testado em localhost com submits reais para as tres variantes:
  - `mcp_submit_1`: `lp2`
  - `mcp_submit_2`: `lp3`
  - `mcp_submit_3`: `lp1`

Resultado validado:

- Activity recebeu `landing_viewed`, `landing_cta_clicked`, `form_started` e `form_submitted`.
- Eventos chegaram com `site_environment: local`.
- Dashboard local refletiu os submits por variante.

## Cuidados

- Nao misturar dados locais, dev e producao em cards sem filtro de ambiente.
- Ao testar com Codex, usar contexto isolado novo a cada rodada para simular cache/cookies limpos.
- Em localhost, confirmar que o ngrok usado em `NEXT_PUBLIC_COCREATE_GOOGLE_FORMS_RETURN_URL` esta ativo.
- Se o Apps Script falhar, verificar primeiro a aba Execucoes.
- Se Activity mostrar eventos mas dashboard nao, usar Refresh ou aguardar cache/agregacao do PostHog.
- Nao commitar valores secretos. Documentar nomes de variaveis, nao os valores.
