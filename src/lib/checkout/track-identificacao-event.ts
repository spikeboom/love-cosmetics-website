"use client";

type IdentificacaoEventSeverity = "info" | "warning" | "error";

export type IdentificacaoEventName =
  | "identificacao_page_viewed"
  | "identificacao_cart_loaded"
  | "identificacao_empty_cart_redirect"
  | "identificacao_form_prefilled"
  | "identificacao_first_interaction"
  | "identificacao_cep_completed"
  | "identificacao_cep_lookup_started"
  | "identificacao_cep_lookup_success"
  | "identificacao_cep_lookup_failed"
  | "identificacao_continue_clicked"
  | "identificacao_validation_failed"
  | "identificacao_validation_passed"
  | "identificacao_storage_save_started"
  | "identificacao_storage_save_success"
  | "identificacao_storage_save_failed"
  | "identificacao_sync_started"
  | "identificacao_sync_success"
  | "identificacao_sync_failed"
  | "identificacao_navigate_entrega_attempted"
  | "identificacao_navigate_entrega_called"
  | "identificacao_entrega_arrived"
  | "identificacao_runtime_error"
  | "identificacao_unhandled_rejection"
  | "identificacao_page_hidden";

interface TrackIdentificacaoEventArgs {
  eventName: IdentificacaoEventName;
  severity?: IdentificacaoEventSeverity;
  payload?: Record<string, unknown>;
}

const ENDPOINT = "/api/checkout/identificacao/events";
const SESSION_KEY = "checkout_session_id";
const PAGE_INSTANCE_KEY = "checkout_identificacao_page_instance_id";
const TEST_SESSION_PREFIX = "t_";

let pageInstanceId = "";
let sequenceNumber = 0;
let startedAt = 0;

function randomId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function isTestUserCookieEnabled() {
  try {
    const match = document.cookie.match(/(?:^|; )is_test_user=([^;]+)/);
    return !!(match && match[1] === "1");
  } catch {
    return false;
  }
}

function getOrCreateCheckoutSessionId() {
  try {
    const existing = sessionStorage.getItem(SESSION_KEY);
    const testMode = isTestUserCookieEnabled();
    if (existing) {
      const isPrefixed = existing.startsWith(TEST_SESSION_PREFIX);
      if (testMode === isPrefixed) return existing;
    }

    const next = `${testMode ? TEST_SESSION_PREFIX : ""}${randomId()}`;
    sessionStorage.setItem(SESSION_KEY, next);
    return next;
  } catch {
    return "";
  }
}

function getPageInstanceId() {
  if (pageInstanceId) return pageInstanceId;

  try {
    const existing = sessionStorage.getItem(PAGE_INSTANCE_KEY);
    if (existing) {
      pageInstanceId = existing;
      return pageInstanceId;
    }

    pageInstanceId = randomId();
    sessionStorage.setItem(PAGE_INSTANCE_KEY, pageInstanceId);
    return pageInstanceId;
  } catch {
    pageInstanceId = randomId();
    return pageInstanceId;
  }
}

export function resetIdentificacaoPageInstance() {
  pageInstanceId = randomId();
  sequenceNumber = 0;
  startedAt = Date.now();
  try {
    sessionStorage.setItem(PAGE_INSTANCE_KEY, pageInstanceId);
  } catch {
    // Tracking must never block checkout.
  }
  return pageInstanceId;
}

export function trackIdentificacaoEvent({
  eventName,
  severity = "info",
  payload = {},
}: TrackIdentificacaoEventArgs) {
  if (typeof window === "undefined") return;

  try {
    if (!startedAt) startedAt = Date.now();

    const body = JSON.stringify({
      event_id: randomId(),
      checkout_session_id: getOrCreateCheckoutSessionId(),
      page_instance_id: getPageInstanceId(),
      sequence_number: ++sequenceNumber,
      event_name: eventName,
      severity,
      is_test_user: isTestUserCookieEnabled(),
      path: window.location.href,
      referrer: document.referrer || undefined,
      elapsed_ms: Date.now() - startedAt,
      client_created_at: new Date().toISOString(),
      payload,
    });

    if (navigator.sendBeacon) {
      const blob = new Blob([body], { type: "application/json" });
      navigator.sendBeacon(ENDPOINT, blob);
      return;
    }

    fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      keepalive: true,
      body,
    }).catch(() => undefined);
  } catch {
    // Tracking must never block checkout.
  }
}
