CREATE TABLE "landing_page_visits" (
  "id" TEXT NOT NULL,
  "visitorId" TEXT NOT NULL,
  "variant" TEXT,
  "proposal" TEXT,
  "assignmentSource" TEXT,
  "landingPath" TEXT,
  "landingUrl" TEXT,
  "referrer" TEXT,
  "userAgent" TEXT,
  "clientIpAddress" TEXT,
  "fbp" TEXT,
  "fbc" TEXT,
  "fbclid" TEXT,
  "utmSource" TEXT,
  "utmMedium" TEXT,
  "utmCampaign" TEXT,
  "utmContent" TEXT,
  "utmTerm" TEXT,
  "siteEnvironment" TEXT,
  "siteHost" TEXT,
  "siteOrigin" TEXT,
  "metaEventId" TEXT,
  "metaSentAt" TIMESTAMP(3),
  "metaResponse" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "landing_page_visits_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "landing_page_visits_visitorId_key"
  ON "landing_page_visits"("visitorId");

CREATE INDEX "landing_page_visits_visitorId_idx"
  ON "landing_page_visits"("visitorId");

CREATE INDEX "landing_page_visits_utmCampaign_idx"
  ON "landing_page_visits"("utmCampaign");

CREATE INDEX "landing_page_visits_utmContent_idx"
  ON "landing_page_visits"("utmContent");

CREATE INDEX "landing_page_visits_createdAt_idx"
  ON "landing_page_visits"("createdAt");
