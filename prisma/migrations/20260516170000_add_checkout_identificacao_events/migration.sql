CREATE TABLE "checkout_identificacao_events" (
  "id" TEXT NOT NULL,
  "eventId" TEXT NOT NULL,
  "checkoutSessionId" TEXT,
  "pageInstanceId" TEXT NOT NULL,
  "sequenceNumber" INTEGER,
  "eventName" TEXT NOT NULL,
  "severity" TEXT NOT NULL DEFAULT 'info',
  "path" TEXT,
  "referrer" TEXT,
  "buildId" TEXT,
  "userAgent" TEXT,
  "ipHash" TEXT,
  "elapsedMs" INTEGER,
  "payload" JSONB NOT NULL DEFAULT '{}',
  "clientCreatedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "checkout_identificacao_events_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "checkout_identificacao_events_eventId_key"
  ON "checkout_identificacao_events"("eventId");

CREATE INDEX "checkout_identificacao_events_eventName_createdAt_idx"
  ON "checkout_identificacao_events"("eventName", "createdAt");

CREATE INDEX "checkout_identificacao_events_checkoutSessionId_createdAt_idx"
  ON "checkout_identificacao_events"("checkoutSessionId", "createdAt");

CREATE INDEX "checkout_identificacao_events_pageInstanceId_sequenceNumber_idx"
  ON "checkout_identificacao_events"("pageInstanceId", "sequenceNumber");
