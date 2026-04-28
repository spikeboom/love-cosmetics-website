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
