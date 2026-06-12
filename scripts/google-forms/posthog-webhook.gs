/**
 * Google Forms -> Next/PostHog webhook.
 *
 * Configure once in Apps Script project settings or run configureWebhook().
 * Required script properties:
 * - WEBHOOK_URL
 * - WEBHOOK_SECRET
 */

function configureWebhook() {
  PropertiesService.getScriptProperties().setProperties({
    WEBHOOK_URL: "PASTE_ENV_GOOGLE_FORMS_WEBHOOK_URL_HERE",
    WEBHOOK_SECRET: "PASTE_ENV_GOOGLE_FORMS_WEBHOOK_SECRET_HERE",
  });
}

function installSubmitTrigger() {
  const form = FormApp.getActiveForm();
  const existing = ScriptApp.getProjectTriggers();

  existing.forEach(function (trigger) {
    if (trigger.getHandlerFunction() === "onFormSubmitPostHog") {
      ScriptApp.deleteTrigger(trigger);
    }
  });

  ScriptApp.newTrigger("onFormSubmitPostHog").forForm(form).onFormSubmit().create();
}

function ensureTrackingFields() {
  const form = FormApp.getActiveForm();
  const legacyTrackingTitles = [
    "visitor_id",
    "variant",
    "tracking_context",
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_content",
    "utm_term",
  ];
  const trackingTitles = ["NAO PREENCHA - TRACKING_CONTEXT"];

  const existingTitles = {};
  form.getItems().forEach(function (item) {
    if (legacyTrackingTitles.indexOf(item.getTitle()) >= 0) {
      form.deleteItem(item);
      return;
    }
    existingTitles[item.getTitle()] = true;
  });

  trackingTitles.forEach(function (title) {
    if (!existingTitles[title]) {
      form
        .addTextItem()
        .setTitle(title)
        .setHelpText("Campo tecnico preenchido automaticamente pela Lovè.")
        .setRequired(false);
    }
  });
}

function logTrackingPrefillUrl() {
  ensureTrackingFields();

  const form = FormApp.getActiveForm();
  const values = {
    "NAO PREENCHA - TRACKING_CONTEXT": JSON.stringify({
      visitor_id: "VISITOR_ID_TEST",
      variant: "VARIANT_TEST",
      utm_source: "UTM_SOURCE_TEST",
      utm_medium: "UTM_MEDIUM_TEST",
      utm_campaign: "UTM_CAMPAIGN_TEST",
      utm_content: "UTM_CONTENT_TEST",
      utm_term: "UTM_TERM_TEST",
      return_url: "https://outmoded-clair-pectic.ngrok-free.dev/api/posthog/google-form-submit",
      site_environment: "local",
      site_host: "localhost:3000",
      site_origin: "http://localhost:3000",
    }),
  };

  const response = form.createResponse();
  form.getItems().forEach(function (item) {
    const title = item.getTitle();
    if (Object.prototype.hasOwnProperty.call(values, title)) {
      response.withItemResponse(item.asTextItem().createResponse(values[title]));
    }
  });

  Logger.log(response.toPrefilledUrl());
}

function getWebhookUrlFromAnswers(answers, fallbackUrl) {
  const rawTrackingContext = getTrackingContextFromAnswers(answers);
  if (!rawTrackingContext) return fallbackUrl;

  let trackingContext;
  try {
    trackingContext = JSON.parse(rawTrackingContext);
  } catch (error) {
    return fallbackUrl;
  }

  const returnUrl = String(trackingContext.return_url || "").trim();
  if (!returnUrl) return fallbackUrl;

  const allowedUrls = [
    "https://outmoded-clair-pectic.ngrok-free.dev/api/posthog/google-form-submit",
    "https://dev.lovecosmetics.com.br/api/posthog/google-form-submit",
    "https://www.lovecosmetics.com.br/api/posthog/google-form-submit",
  ];

  return allowedUrls.indexOf(returnUrl) >= 0 ? returnUrl : fallbackUrl;
}

function normalizeAnswerKey(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function getTrackingContextFromAnswers(answers) {
  const preferredKeys = [
    "NAO PREENCHA - TRACKING_CONTEXT",
    "tracking_context",
    "tracking context",
  ];

  for (let i = 0; i < preferredKeys.length; i += 1) {
    if (answers[preferredKeys[i]]) return answers[preferredKeys[i]];
  }

  const keys = Object.keys(answers);
  for (let j = 0; j < keys.length; j += 1) {
    const normalizedKey = normalizeAnswerKey(keys[j]);
    if (normalizedKey.indexOf("tracking_context") >= 0) {
      return answers[keys[j]];
    }
  }

  return undefined;
}

function onFormSubmitPostHog(event) {
  const props = PropertiesService.getScriptProperties();
  const defaultWebhookUrl = props.getProperty("WEBHOOK_URL");
  const webhookSecret = (props.getProperty("WEBHOOK_SECRET") || "").trim();

  if (!defaultWebhookUrl || !webhookSecret) {
    throw new Error("Missing WEBHOOK_URL or WEBHOOK_SECRET script property.");
  }

  const response = event.response;
  const itemResponses = response.getItemResponses();
  const answers = {};

  itemResponses.forEach(function (itemResponse) {
    const title = itemResponse.getItem().getTitle();
    answers[title] = itemResponse.getResponse();
  });

  const webhookUrl = getWebhookUrlFromAnswers(answers, defaultWebhookUrl);

  const payload = {
    secret: webhookSecret,
    form_id: event.source.getId(),
    form_title: event.source.getTitle(),
    response_id: response.getId(),
    submitted_at: response.getTimestamp().toISOString(),
    respondent_email: response.getRespondentEmail() || undefined,
    answers: answers,
  };

  const result = UrlFetchApp.fetch(webhookUrl, {
    method: "post",
    contentType: "application/json",
    muteHttpExceptions: true,
    headers: {
      "x-google-forms-webhook-secret": webhookSecret,
    },
    payload: JSON.stringify(payload),
  });

  const status = result.getResponseCode();
  if (status < 200 || status >= 300) {
    throw new Error(
      "PostHog webhook failed with " + status + ": " + result.getContentText(),
    );
  }
}
