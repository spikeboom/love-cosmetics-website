"use client";

type DataLayer = Array<Record<string, unknown>>;

function getDataLayer(): DataLayer | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { dataLayer?: DataLayer };
  w.dataLayer = w.dataLayer || [];
  return w.dataLayer;
}

function getCheckoutSessionId(): string | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const existing = sessionStorage.getItem("checkout_session_id");
    if (existing) return existing;

    const uuid = (window as any)?.crypto?.randomUUID?.();
    const sid = uuid ?? `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    sessionStorage.setItem("checkout_session_id", sid);
    return sid;
  } catch {
    return undefined;
  }
}

function safeNumber(value: unknown): number | undefined {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : undefined;
}

function newEventId(prefix: string): string {
  const w = typeof window !== "undefined" ? (window as any) : null;
  const uuid =
    w?.crypto?.randomUUID?.() ??
    `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  return `${prefix}_${uuid}`;
}

export type UCEcommerceItem = {
  item_id: string;
  item_name: string;
  price?: number;
  quantity?: number;
  index?: number;
  item_list_id?: string;
  item_list_name?: string;
  item_category?: string;
  item_category2?: string;
  item_category3?: string;
  item_variant?: string;
};

export type UCCheckoutStep = "identificacao" | "entrega" | "pagamento";

type UCEcommercePayload = {
  currency?: string;
  value?: number;
  transaction_id?: string;
  shipping?: number;
  tax?: number;
  coupon?: string;
  items: UCEcommerceItem[];
};

function pushEcommerceEvent(
  event: string,
  ecommerce: UCEcommercePayload,
  extra?: Record<string, unknown>
) {
  const dl = getDataLayer();
  if (!dl) return;

  // Prevent GA4 from reusing previous ecommerce object.
  dl.push({ ecommerce: null });
  dl.push({
    event,
    event_id: newEventId(event),
    checkout_session_id: getCheckoutSessionId(),
    ecommerce,
    // Duplicate key fields at top level for Stape Data Tag → sGTM.
    // The Data Client does NOT flatten the GA4 ecommerce object,
    // so the Meta CAPI template needs these at the top level.
    items: ecommerce.items,
    currency: ecommerce.currency,
    value: ecommerce.value,
    transaction_id: ecommerce.transaction_id,
    shipping: ecommerce.shipping,
    tax: ecommerce.tax,
    coupon: ecommerce.coupon,
    num_items: ecommerce.items?.length,
    ...extra,
  });
}

const checkoutStepNumber: Record<UCCheckoutStep, number> = {
  identificacao: 1,
  entrega: 2,
  pagamento: 3,
};

export function ucViewItemList(args: {
  items: UCEcommerceItem[];
  listId?: string;
  listName?: string;
}) {
  const items = args.items.map((it) => ({
    ...it,
    item_list_id: it.item_list_id ?? args.listId,
    item_list_name: it.item_list_name ?? args.listName,
  }));

  const value = items.reduce((acc, it) => {
    const qty = safeNumber(it.quantity) ?? 1;
    const price = safeNumber(it.price) ?? 0;
    return acc + qty * price;
  }, 0);

  pushEcommerceEvent("view_item_list", { currency: "BRL", value, items });
}

export function ucViewItem(args: {
  item: UCEcommerceItem;
  currency?: string;
  value?: number;
}) {
  pushEcommerceEvent("view_item", {
    currency: args.currency ?? "BRL",
    value: safeNumber(args.value ?? args.item.price),
    items: [args.item],
  });
}

export function ucAddToCart(args: {
  item: UCEcommerceItem;
  currency?: string;
  value?: number;
}) {
  const qty = safeNumber(args.item.quantity) ?? 1;
  const price = safeNumber(args.item.price) ?? 0;

  pushEcommerceEvent("add_to_cart", {
    currency: args.currency ?? "BRL",
    value: safeNumber(args.value ?? price * qty),
    items: [{ ...args.item, quantity: qty, price }],
  });
}

export function ucViewCart(args: {
  items: UCEcommerceItem[];
  currency?: string;
  value?: number;
}) {
  const computed = args.items.reduce((acc, it) => {
    const qty = safeNumber(it.quantity) ?? 1;
    const price = safeNumber(it.price) ?? 0;
    return acc + qty * price;
  }, 0);

  pushEcommerceEvent("view_cart", {
    currency: args.currency ?? "BRL",
    value: safeNumber(args.value ?? computed),
    items: args.items,
  });
}

export function ucBeginCheckout(args: {
  items: UCEcommerceItem[];
  currency?: string;
  value?: number;
  coupon?: string;
  shipping?: number;
}) {
  const computed = args.items.reduce((acc, it) => {
    const qty = safeNumber(it.quantity) ?? 1;
    const price = safeNumber(it.price) ?? 0;
    return acc + qty * price;
  }, 0);

  pushEcommerceEvent("begin_checkout", {
    currency: args.currency ?? "BRL",
    value: safeNumber(args.value ?? computed),
    coupon: args.coupon,
    shipping: safeNumber(args.shipping),
    items: args.items,
  });
}

export function ucUserDataUpdate(args: {
  email?: string;
  phone_number?: string;
  first_name?: string;
  last_name?: string;
  address?: {
    city?: string;
    region?: string;
    postal_code?: string;
    country?: string;
    street?: string;
  };
}) {
  const dl = getDataLayer();
  if (!dl) return;

  const user_data: Record<string, unknown> = {};

  if (args.email) user_data.email_address = args.email;
  if (args.phone_number) user_data.phone_number = args.phone_number;

  if (args.first_name || args.last_name || args.address) {
    const address: Record<string, string> = {};
    if (args.first_name) address.first_name = args.first_name;
    if (args.last_name) address.last_name = args.last_name;
    if (args.address?.city) address.city = args.address.city;
    if (args.address?.region) address.region = args.address.region;
    if (args.address?.postal_code) address.postal_code = args.address.postal_code;
    address.country = args.address?.country || "BR";
    if (args.address?.street) address.street = args.address.street;
    user_data.address = address;
  }

  dl.push({
    event: "user_data_update",
    event_id: newEventId("user_data_update"),
    user_data,
    // Non-PII join key for warehouse/debug (avoid sending raw PII as GA4 event params).
    checkout_session_id: getCheckoutSessionId(),
    checkout_city: args.address?.city || undefined,
    checkout_region: args.address?.region || undefined,
    checkout_postal_code: args.address?.postal_code || undefined,
  });
}

export function ucCheckoutStep(args: { step: UCCheckoutStep }) {
  const dl = getDataLayer();
  if (!dl) return;

  dl.push({
    event: "checkout_step",
    event_id: newEventId("checkout_step"),
    checkout_session_id: getCheckoutSessionId(),
    checkout_step: args.step,
    checkout_step_number: checkoutStepNumber[args.step],
    url_pagina: window.location.href,
  });
}

export function ucViewSearchResults(args: {
  searchTerm: string;
  resultsCount?: number;
}) {
  const dl = getDataLayer();
  if (!dl) return;

  dl.push({
    event: "view_search_results",
    event_id: newEventId("view_search_results"),
    checkout_session_id: getCheckoutSessionId(),
    search_term: args.searchTerm,
    search_results_count: safeNumber(args.resultsCount),
    url_pagina: window.location.href,
  });
}

export function ucShippingCalculate(args: {
  cep: string;
  cidade?: string;
  estado?: string;
  bairro?: string;
  origem?: string;
  freteMinimo?: number;
  prazoMinimo?: number;
  transportadora?: string;
  totalServicos?: number;
}) {
  const dl = getDataLayer();
  if (!dl) return;

  dl.push({
    event: "shipping_calculate",
    event_id: newEventId("shipping_calculate"),
    checkout_session_id: getCheckoutSessionId(),
    shipping_cep: args.cep,
    shipping_cidade: args.cidade,
    shipping_estado: args.estado,
    shipping_bairro: args.bairro,
    shipping_origem: args.origem,
    shipping_frete_minimo: safeNumber(args.freteMinimo),
    shipping_prazo_minimo: safeNumber(args.prazoMinimo),
    shipping_transportadora: args.transportadora,
    shipping_total_servicos: safeNumber(args.totalServicos),
  });
}

export function ucAddShippingInfo(args: {
  items: UCEcommerceItem[];
  currency?: string;
  value?: number;
  coupon?: string;
  shipping?: number;
  shippingTier?: string;
  carrier?: string;
  service?: string;
  deliveryTime?: number;
  serviceCode?: string;
}) {
  const computedValue = args.items.reduce((acc, it) => {
    const qty = safeNumber(it.quantity) ?? 1;
    const price = safeNumber(it.price) ?? 0;
    return acc + qty * price;
  }, 0);

  pushEcommerceEvent(
    "add_shipping_info",
    {
      currency: args.currency ?? "BRL",
      value: safeNumber(args.value ?? computedValue),
      coupon: args.coupon,
      shipping: safeNumber(args.shipping),
      items: args.items,
    },
    {
      shipping_tier: args.shippingTier,
      shipping_carrier: args.carrier,
      shipping_service: args.service,
      shipping_delivery_time: safeNumber(args.deliveryTime),
      shipping_service_code: args.serviceCode,
    }
  );
}

export function ucAddPaymentInfo(args: {
  items: UCEcommerceItem[];
  paymentType: "pix" | "credit_card";
  currency?: string;
  value?: number;
  coupon?: string;
  shipping?: number;
}) {
  const computedValue = args.items.reduce((acc, it) => {
    const qty = safeNumber(it.quantity) ?? 1;
    const price = safeNumber(it.price) ?? 0;
    return acc + qty * price;
  }, 0);

  pushEcommerceEvent(
    "add_payment_info",
    {
      currency: args.currency ?? "BRL",
      value: safeNumber(args.value ?? computedValue),
      coupon: args.coupon,
      shipping: safeNumber(args.shipping),
      items: args.items,
    },
    { payment_type: args.paymentType }
  );
}

export function ucPurchase(args: {
  transactionId: string;
  items: UCEcommerceItem[];
  currency?: string;
  value: number;
  coupon?: string;
  shipping?: number;
  tax?: number;
  user_data?: Record<string, unknown>;
}) {
  pushEcommerceEvent(
    "purchase",
    {
      transaction_id: args.transactionId,
      currency: args.currency ?? "BRL",
      value: safeNumber(args.value) ?? 0,
      coupon: args.coupon,
      shipping: safeNumber(args.shipping),
      tax: safeNumber(args.tax),
      items: args.items,
    },
    args.user_data ? { user_data: args.user_data } : undefined
  );
}
