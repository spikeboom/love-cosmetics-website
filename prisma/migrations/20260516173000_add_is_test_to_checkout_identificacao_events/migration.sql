ALTER TABLE "checkout_identificacao_events"
  ADD COLUMN "isTest" BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX "checkout_identificacao_events_isTest_createdAt_idx"
  ON "checkout_identificacao_events"("isTest", "createdAt");
