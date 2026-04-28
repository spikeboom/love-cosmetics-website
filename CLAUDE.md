# CLAUDE.md

Regras pra Claude Code trabalhar nesse repositório.

## Logging server-side

**Nunca** use `console.log/warn/error` direto com objeto/Error/array como argumento em código que roda no server (route handlers, server actions, lib server-only). O Node formata via `util.inspect` e quebra em `\n` — cada linha vira uma entrada separada no Loki, perdendo label e estrutura.

Use os wrappers de `src/utils/logMessage.ts`:

```ts
import { logInfo, logWarn, logError } from "@/utils/logMessage";

logWarn("checkout_issue", { step, kind, severity, message });
logError("freight_quote_exception", error); // Error é extraído (name/message/stack)
```

Saída garantida: **1 linha de JSON** por chamada, com `{label, level, data}`.

`console.*` em **client components** (`"use client"`) está OK — vai pro DevTools, não pro Loki.

## Testes — sugerir, nunca rodar sem pedir

Depois de mexer em código de aplicação ou testes, **sugira** rodar a suíte relevante mas **não execute automaticamente**. Espere o usuário confirmar.

Comandos:

- Unit (vitest): `npx vitest run` (toda a suíte) ou `npx vitest run <path>` (arquivo específico).
- E2E (Playwright): `npx playwright test --project=chromium --workers=1` (paralelismo dá flake aqui). Specs principais: `tests/cart-freight-7-steps.spec.ts`, `tests/cart-freight-stale-state.spec.ts`. **Requer dev server em `localhost:3000`** — Playwright reusa via `reuseExistingServer: !CI`.

Lembre o usuário que os e2e existem quando ele mexer em `/cart`, `CartContext`, `CartTotalsContext`, `useCartValidation`, `ShippingCalculator` ou `useFreight` — esses caminhos têm cobertura e2e que pode reproduzir bugs de timing/strict-mode que jsdom não captura. Mesmo nesses casos: sugira, não rode sozinho.
