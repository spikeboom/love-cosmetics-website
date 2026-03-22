# Sistema de Analytics via Server Actions para `/figma`

## Situação Atual

### Como os eventos estão sendo enviados hoje:
- **Client-side** via `window.dataLayer.push()` (GTM)
- Dependem do GTM/GA4 carregar no browser
- Usam `waitForGTMReady()` para aguardar inicialização

### Arquivos de tracking existentes:
| Arquivo | Eventos |
|---------|---------|
| `src/core/tracking/product-tracking.ts` | `add_to_cart`, `remove_coupon` |
| `src/components/common/EventViewContent/event-view-content.tsx` | `ViewContent` |
| `src/app/(global)/(main)/checkout/PushInitiateCheckout.tsx` | `InitiateCheckout` |

---

## Proposta: Tracking via Server Actions

### Vantagens de Server Actions para Analytics:
1. **Mais confiável** - não depende de ad blockers ou erros de JS
2. **Dados de sessão seguros** - acesso direto a cookies HttpOnly
3. **Dados de usuário logado** - acesso ao `cliente_token` JWT
4. **Enriquecimento de dados** - pode consultar DB antes de enviar
5. **Deduplicação** - controle server-side de eventos duplicados

---

## Variáveis Extraídas dos Cookies

### `extractGaSessionData()` (get-ga-cookie-info.ts)
Do cookie `_ga_SXLFK0Y830`:
- **`ga_session_id`** - ID único da sessão GA4
- **`ga_session_number`** - Número sequencial da sessão do usuário

### `getAnalyticsSession()` (proposta server-side)
Do cookie `_ga`:
- **`ga_client_id`** - ID único do visitante (ex: `1234567890.1699999999`)

Do cookie `cliente_token` (JWT HttpOnly):
- **`clienteId`** - ID do cliente no banco
- **`email`** - Email do cliente logado
- **`nome`** / **`sobrenome`** - Nome completo

Além disso, dos headers HTTP:
- **`user_agent`** - Navegador/dispositivo
- **`ip_address`** - IP do visitante

---

## Mapeamento de Eventos Principais no `/figma`

### Home / Listagem (`/figma`, `/figma/search`)
| Evento | Trigger | Dados Específicos |
|--------|---------|-------------------|
| `page_view` | Ao carregar página | `page_title`, `page_location` |
| `view_item_list` | Ao ver lista de produtos | `item_list_name`, `items[]` |
| `select_item` | Ao clicar em produto | `item_id`, `item_name`, `item_list_name` |

### Página de Produto (`/figma/product/[slug]`)
| Evento | Trigger | Dados Específicos |
|--------|---------|-------------------|
| `view_item` | Ao carregar PDP | `item_id`, `item_name`, `price`, `currency` |
| `add_to_cart` | Botão "Adicionar" | `item_id`, `item_name`, `price`, `quantity` |
| `share` | Botão compartilhar | `method`, `content_type`, `item_id` |

### Carrinho (`/figma/cart`)
| Evento | Trigger | Dados Específicos |
|--------|---------|-------------------|
| `view_cart` | Ao carregar carrinho | `currency`, `value`, `items[]` |
| `add_to_cart` | Aumentar quantidade | `item_id`, `quantity_delta` |
| `remove_from_cart` | Remover produto | `item_id`, `item_name`, `price` |
| `apply_coupon` | Aplicar cupom | `coupon_code` |
| `remove_coupon` | Remover cupom | `coupon_code` |
| `begin_checkout` | Botão "Finalizar" | `currency`, `value`, `items[]`, `coupon` |

### Checkout - Identificação (`/figma/checkout/identificacao`)
| Evento | Trigger | Dados Específicos |
|--------|---------|-------------------|
| `checkout_progress` | Ao avançar | `checkout_step: 1`, `checkout_option: "identificacao"` |
| `add_contact_info` | Form preenchido | `email_provided`, `phone_provided` |

### Checkout - Entrega (`/figma/checkout/entrega`)
| Evento | Trigger | Dados Específicos |
|--------|---------|-------------------|
| `checkout_progress` | Ao avançar | `checkout_step: 2`, `checkout_option: "entrega"` |
| `add_shipping_info` | Endereço preenchido | `shipping_tier`, `state`, `city` |
| `select_shipping` | Escolher frete | `shipping_tier`, `shipping_value` |

### Checkout - Pagamento (`/figma/checkout/pagamento`)
| Evento | Trigger | Dados Específicos |
|--------|---------|-------------------|
| `checkout_progress` | Ao carregar | `checkout_step: 3`, `checkout_option: "pagamento"` |
| `select_payment_method` | Escolher Pix/Cartão | `payment_type: "pix" \| "credit_card"` |
| `add_payment_info` | Dados de pagamento | `payment_type`, `card_brand` (se cartão) |

### Checkout - Confirmação (`/figma/checkout/confirmacao`)
| Evento | Trigger | Dados Específicos |
|--------|---------|-------------------|
| `purchase` | Pagamento confirmado | `transaction_id`, `value`, `currency`, `items[]`, `shipping`, `coupon` |

---

## Estrutura Proposta de Server Actions

### 1. Arquivo de Server Actions para Analytics
```
src/app/actions/analytics-actions.ts
```

### 2. Tipos e Interface
```typescript
// src/types/analytics.ts

export interface AnalyticsUser {
  clienteId?: string;
  email?: string;
  nome?: string;
  isLoggedIn: boolean;
}

export interface AnalyticsSession {
  ga_session_id?: string;
  ga_client_id?: string;
  user_agent?: string;
  ip_address?: string;
}

export interface BaseEventPayload {
  event_name: string;
  event_id: string;
  timestamp: string;
  user: AnalyticsUser;
  session: AnalyticsSession;
  page_url: string;
  page_title?: string;
}

export interface EcommerceItem {
  item_id: string;
  item_name: string;
  price: number;
  quantity: number;
  item_category?: string;
  item_brand?: string;
}
```

### 3. Server Action Principal
```typescript
// src/app/actions/analytics-actions.ts
"use server";

import { cookies, headers } from "next/headers";
import { verifySession } from "@/lib/cliente/auth";

// Obter dados do usuário logado (se houver)
async function getAnalyticsUser(): Promise<AnalyticsUser> {
  const cookieStore = await cookies();
  const token = cookieStore.get("cliente_token")?.value;

  if (!token) {
    return { isLoggedIn: false };
  }

  const session = await verifySession(token);
  if (!session) {
    return { isLoggedIn: false };
  }

  return {
    clienteId: session.id,
    email: session.email,
    nome: `${session.nome} ${session.sobrenome}`,
    isLoggedIn: true,
  };
}

// Obter dados de sessão do request
async function getAnalyticsSession(gaSessionId?: string): Promise<AnalyticsSession> {
  const headersList = await headers();
  const cookieStore = await cookies();

  // GA Client ID do cookie _ga
  const gaCookie = cookieStore.get("_ga")?.value;
  const gaClientId = gaCookie?.split(".").slice(-2).join(".");

  return {
    ga_session_id: gaSessionId,
    ga_client_id: gaClientId,
    user_agent: headersList.get("user-agent") || undefined,
    ip_address: headersList.get("x-forwarded-for")?.split(",")[0] ||
                headersList.get("x-real-ip") || undefined,
  };
}

// Gerar event_id único
function generateEventId(eventName: string): string {
  return `${eventName}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// EVENTOS ESPECÍFICOS

export async function trackViewItem(params: {
  itemId: string;
  itemName: string;
  price: number;
  category?: string;
  gaSessionId?: string;
  pageUrl: string;
}) {
  const user = await getAnalyticsUser();
  const session = await getAnalyticsSession(params.gaSessionId);

  const payload = {
    event_name: "view_item",
    event_id: generateEventId("view_item"),
    timestamp: new Date().toISOString(),
    user,
    session,
    page_url: params.pageUrl,
    ecommerce: {
      currency: "BRL",
      value: params.price,
      items: [{
        item_id: params.itemId,
        item_name: params.itemName,
        price: params.price,
        quantity: 1,
        item_category: params.category,
      }],
    },
  };

  // Enviar para GA4 Measurement Protocol ou armazenar no banco
  await sendToAnalytics(payload);

  return { success: true, event_id: payload.event_id };
}

export async function trackAddToCart(params: {
  itemId: string;
  itemName: string;
  price: number;
  quantity: number;
  gaSessionId?: string;
  pageUrl: string;
}) {
  const user = await getAnalyticsUser();
  const session = await getAnalyticsSession(params.gaSessionId);

  const payload = {
    event_name: "add_to_cart",
    event_id: generateEventId("add_to_cart"),
    timestamp: new Date().toISOString(),
    user,
    session,
    page_url: params.pageUrl,
    ecommerce: {
      currency: "BRL",
      value: params.price * params.quantity,
      items: [{
        item_id: params.itemId,
        item_name: params.itemName,
        price: params.price,
        quantity: params.quantity,
      }],
    },
  };

  await sendToAnalytics(payload);

  return { success: true, event_id: payload.event_id };
}

export async function trackBeginCheckout(params: {
  items: EcommerceItem[];
  value: number;
  coupon?: string;
  gaSessionId?: string;
  pageUrl: string;
}) {
  const user = await getAnalyticsUser();
  const session = await getAnalyticsSession(params.gaSessionId);

  const payload = {
    event_name: "begin_checkout",
    event_id: generateEventId("begin_checkout"),
    timestamp: new Date().toISOString(),
    user,
    session,
    page_url: params.pageUrl,
    ecommerce: {
      currency: "BRL",
      value: params.value,
      coupon: params.coupon,
      items: params.items,
    },
  };

  await sendToAnalytics(payload);

  return { success: true, event_id: payload.event_id };
}

export async function trackCheckoutProgress(params: {
  step: number;
  stepName: "identificacao" | "entrega" | "pagamento";
  gaSessionId?: string;
  pageUrl: string;
}) {
  const user = await getAnalyticsUser();
  const session = await getAnalyticsSession(params.gaSessionId);

  const payload = {
    event_name: "checkout_progress",
    event_id: generateEventId("checkout_progress"),
    timestamp: new Date().toISOString(),
    user,
    session,
    page_url: params.pageUrl,
    checkout_step: params.step,
    checkout_option: params.stepName,
  };

  await sendToAnalytics(payload);

  return { success: true, event_id: payload.event_id };
}

export async function trackPurchase(params: {
  transactionId: string;
  value: number;
  shipping: number;
  items: EcommerceItem[];
  coupon?: string;
  paymentMethod: "pix" | "credit_card";
  gaSessionId?: string;
  pageUrl: string;
}) {
  const user = await getAnalyticsUser();
  const session = await getAnalyticsSession(params.gaSessionId);

  const payload = {
    event_name: "purchase",
    event_id: generateEventId("purchase"),
    timestamp: new Date().toISOString(),
    user,
    session,
    page_url: params.pageUrl,
    ecommerce: {
      transaction_id: params.transactionId,
      currency: "BRL",
      value: params.value,
      shipping: params.shipping,
      coupon: params.coupon,
      payment_type: params.paymentMethod,
      items: params.items,
    },
  };

  await sendToAnalytics(payload);

  return { success: true, event_id: payload.event_id };
}

// Função para enviar ao GA4 Measurement Protocol
async function sendToAnalytics(payload: any) {
  const GA4_MEASUREMENT_ID = process.env.GA4_MEASUREMENT_ID || "G-SXLFK0Y830";
  const GA4_API_SECRET = process.env.GA4_API_SECRET; // Criar no GA4

  if (!GA4_API_SECRET) {
    // Fallback: salvar no banco para análise posterior
    console.log("[Analytics Server]", JSON.stringify(payload));
    return;
  }

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
            params: {
              ...payload.ecommerce,
              event_id: payload.event_id,
              session_id: payload.session.ga_session_id,
            },
          }],
        }),
      }
    );
  } catch (error) {
    console.error("[Analytics Error]", error);
  }
}
```

---

## Como Usar nos Componentes

### Exemplo 1: PDP - View Item
```typescript
// ProductPageClient.tsx
import { trackViewItem } from "@/app/actions/analytics-actions";
import { extractGaSessionData } from "@/utils/get-ga-cookie-info";

useEffect(() => {
  const gaData = extractGaSessionData("G-SXLFK0Y830");

  trackViewItem({
    itemId: produto.id.toString(),
    itemName: produto.nome,
    price: produto.preco,
    category: produto.categoria?.nome,
    gaSessionId: gaData.ga_session_id,
    pageUrl: window.location.href,
  });
}, [produto]);
```

### Exemplo 2: Carrinho - Add to Cart
```typescript
// ProductActionButtons.tsx
const handleAddToCart = async () => {
  const gaData = extractGaSessionData("G-SXLFK0Y830");

  // Chamar Server Action em paralelo (não bloqueia UI)
  trackAddToCart({
    itemId: produto.id.toString(),
    itemName: produto.nome,
    price: produto.preco,
    quantity: 1,
    gaSessionId: gaData.ga_session_id,
    pageUrl: window.location.href,
  });

  // Lógica normal de adicionar ao carrinho
  addProductToCart(productData);
};
```

### Exemplo 3: Checkout Progress
```typescript
// IdentificacaoPageClient.tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (validateForm()) {
    const gaData = extractGaSessionData("G-SXLFK0Y830");

    trackCheckoutProgress({
      step: 1,
      stepName: "identificacao",
      gaSessionId: gaData.ga_session_id,
      pageUrl: window.location.href,
    });

    localStorage.setItem("checkoutIdentificacao", JSON.stringify(formData));
    router.push("/figma/checkout/entrega");
  }
};
```

---

## Variáveis de Ambiente Necessárias

```env
GA4_MEASUREMENT_ID=G-SXLFK0Y830
GA4_API_SECRET=xxx
```

> **Nota:** O `GA4_API_SECRET` deve ser criado no GA4 Admin > Data Streams > Measurement Protocol API Secrets

---

## Comparativo: Dados Client-Side vs Server Actions

| Dado | Client-Side | Server Action |
|------|-------------|---------------|
| GA Session ID | Cookie | via param |
| GA Client ID | Cookie | Cookie `_ga` |
| User ID (logado) | Não seguro | JWT HttpOnly |
| Email/Nome | Não disponível | Sessão DB |
| IP Address | Não disponível | Headers |
| User Agent | Disponível | Headers |
| Dados do carrinho | Context | via param |

---

## Arquivos a Criar

1. `src/types/analytics.ts` - Tipos TypeScript
2. `src/app/actions/analytics-actions.ts` - Server Actions

---

## Próximos Passos

1. Criar os arquivos de tipos e server actions
2. Configurar `GA4_API_SECRET` no ambiente
3. Implementar os eventos em cada componente
4. Testar o fluxo completo
5. Validar dados no GA4 DebugView
