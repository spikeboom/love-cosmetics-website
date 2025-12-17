# Analytics: Fallback para Cookies Bloqueados

## Problemas Conhecidos

### ITP (Intelligent Tracking Prevention) - Safari/iOS
- Cookies de terceiros **bloqueados por padrão**
- Cookies first-party limitados a **7 dias** (ou 24h se criados via JS)
- Cookies `_ga` e `_ga_*` são afetados diretamente

### Navegadores com Bloqueio Nativo
- **Brave** - bloqueio agressivo por padrão
- **Firefox** (ETP - Enhanced Tracking Protection)
- **Safari** - ITP ativo por padrão
- **Modo anônimo/privado** - cookies não persistem

### Extensões de Privacidade
- uBlock Origin
- Privacy Badger
- Ghostery
- AdBlock Plus

---

## Soluções para Server Actions

### 1. Fallback com Fingerprint Leve

Quando o cookie `_ga` não existe, geramos um ID baseado em dados estáveis dos headers HTTP:

```typescript
async function getAnalyticsSession(gaSessionId?: string): Promise<AnalyticsSession> {
  const headersList = await headers();
  const cookieStore = await cookies();

  // Tentar cookie _ga primeiro
  const gaCookie = cookieStore.get("_ga")?.value;
  let gaClientId = gaCookie?.split(".").slice(-2).join(".");

  // FALLBACK: gerar ID baseado em dados estáveis (não é fingerprint invasivo)
  if (!gaClientId) {
    const userAgent = headersList.get("user-agent") || "";
    const acceptLang = headersList.get("accept-language") || "";
    const ip = headersList.get("x-forwarded-for")?.split(",")[0] || "";

    // Hash simples para criar um ID pseudo-anônimo
    const fallbackData = `${userAgent}|${acceptLang}|${ip}`;
    gaClientId = `fallback_${hashString(fallbackData)}`;
  }

  return {
    ga_session_id: gaSessionId || generateSessionId(),
    ga_client_id: gaClientId,
    user_agent: headersList.get("user-agent") || undefined,
    ip_address: headersList.get("x-forwarded-for")?.split(",")[0] ||
                headersList.get("x-real-ip") || undefined,
  };
}

function generateSessionId(): string {
  return `srv_${Date.now()}`;
}

function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}
```

**Vantagens:**
- Não depende de cookies do GA
- Funciona mesmo com ITP/bloqueadores
- Respeita privacidade (não é fingerprint completo)

**Limitações:**
- Mesmo usuário em IPs diferentes = IDs diferentes
- Menos preciso que cookie real

---

### 2. Cookie HttpOnly Server-Side

Criar um cookie próprio, gerenciado pelo servidor, que é mais durável que cookies criados via JavaScript:

```typescript
export async function getOrCreateAnalyticsId(): Promise<string> {
  const cookieStore = await cookies();
  const existingId = cookieStore.get("_lc_aid")?.value; // love cosmetics analytics id

  if (existingId) return existingId;

  // Criar novo ID
  const newId = `${Date.now()}.${Math.random().toString(36).substr(2, 9)}`;

  cookieStore.set("_lc_aid", newId, {
    httpOnly: true,        // Não acessível via JS (mais seguro, escapa do ITP)
    secure: true,          // Apenas HTTPS
    sameSite: "lax",       // Proteção CSRF
    maxAge: 60 * 60 * 24 * 365 * 2,  // 2 anos
    path: "/",
  });

  return newId;
}
```

**Vantagens:**
- Cookies HttpOnly têm tratamento diferente no ITP
- Não são limitados a 7 dias como cookies JS
- Mais controle sobre expiração

**Uso:**
```typescript
async function getAnalyticsSession(gaSessionId?: string): Promise<AnalyticsSession> {
  const lcAnalyticsId = await getOrCreateAnalyticsId();
  // ...
  return {
    ga_client_id: gaClientId || lcAnalyticsId, // fallback para nosso ID
    // ...
  };
}
```

---

### 3. Armazenamento no Banco de Dados (Mais Confiável)

Salvar eventos diretamente no banco, independente do GA4:

```typescript
// Schema Prisma (adicionar)
model AnalyticsEvent {
  id             String   @id @default(cuid())
  event_name     String
  event_id       String   @unique
  client_id      String?
  user_id        String?  // clienteId se logado
  session_id     String?
  page_url       String
  ip_address     String?
  user_agent     String?
  ecommerce_data Json?
  created_at     DateTime @default(now())

  @@index([event_name])
  @@index([client_id])
  @@index([user_id])
  @@index([created_at])
}
```

```typescript
async function sendToAnalytics(payload: any) {
  // SEMPRE salvar no banco (não depende de cookies)
  await prisma.analyticsEvent.create({
    data: {
      event_name: payload.event_name,
      event_id: payload.event_id,
      client_id: payload.session.ga_client_id,
      user_id: payload.user.clienteId,
      session_id: payload.session.ga_session_id,
      page_url: payload.page_url,
      ip_address: payload.session.ip_address,
      user_agent: payload.session.user_agent,
      ecommerce_data: payload.ecommerce,
      created_at: new Date(),
    },
  });

  // Tentar enviar pro GA4 também (best effort)
  if (process.env.GA4_API_SECRET) {
    try {
      await fetch(
        `https://www.google-analytics.com/mp/collect?measurement_id=${GA4_MEASUREMENT_ID}&api_secret=${GA4_API_SECRET}`,
        {
          method: "POST",
          body: JSON.stringify({
            client_id: payload.session.ga_client_id || "server_generated",
            user_id: payload.user.clienteId,
            events: [{
              name: payload.event_name,
              params: { ...payload.ecommerce, event_id: payload.event_id },
            }],
          }),
        }
      );
    } catch (error) {
      // GA4 falhou, mas dados estão salvos no banco
      console.error("[GA4 Error]", error);
    }
  }
}
```

**Vantagens:**
- 100% confiável - não depende de nada externo
- Dados próprios para análise
- Backup se GA4 falhar
- Pode exportar depois para BigQuery/GA4

---

## Resumo das Estratégias

| Cenário | Solução | Confiabilidade |
|---------|---------|----------------|
| Cookie `_ga` existe | Usar normalmente | Alta |
| Cookie bloqueado | Gerar ID via headers (IP + UA) | Média |
| ITP Safari (7 dias) | Cookie HttpOnly server-side `_lc_aid` | Alta |
| Máxima confiabilidade | Salvar no banco próprio | 100% |

---

## Implementação Recomendada

Combinar todas as estratégias em cascata:

```typescript
async function getAnalyticsSession(gaSessionId?: string): Promise<AnalyticsSession> {
  const headersList = await headers();
  const cookieStore = await cookies();

  // 1. Tentar cookie GA primeiro
  const gaCookie = cookieStore.get("_ga")?.value;
  let gaClientId = gaCookie?.split(".").slice(-2).join(".");

  // 2. Fallback: nosso cookie HttpOnly
  if (!gaClientId) {
    gaClientId = await getOrCreateAnalyticsId();
  }

  // 3. Último fallback: hash de headers
  if (!gaClientId || gaClientId.startsWith("fallback_")) {
    const userAgent = headersList.get("user-agent") || "";
    const acceptLang = headersList.get("accept-language") || "";
    const ip = headersList.get("x-forwarded-for")?.split(",")[0] || "";
    const fallbackData = `${userAgent}|${acceptLang}|${ip}`;
    gaClientId = `fallback_${hashString(fallbackData)}`;
  }

  return {
    ga_session_id: gaSessionId || `srv_${Date.now()}`,
    ga_client_id: gaClientId,
    user_agent: headersList.get("user-agent") || undefined,
    ip_address: headersList.get("x-forwarded-for")?.split(",")[0] ||
                headersList.get("x-real-ip") || undefined,
    source: gaCookie ? "ga_cookie" : "server_fallback", // para debug
  };
}
```

---

## Vantagem do Server Action

A grande vantagem é que **mesmo sem cookies do GA**, você ainda tem acesso via headers HTTP a:

- **IP Address** - `x-forwarded-for` ou `x-real-ip`
- **User-Agent** - navegador e dispositivo
- **Accept-Language** - idioma preferido

Esses dados permitem criar um identificador de fallback razoável, sem depender de nenhum cookie client-side.
