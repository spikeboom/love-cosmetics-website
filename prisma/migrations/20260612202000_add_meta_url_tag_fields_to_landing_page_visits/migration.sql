ALTER TABLE "landing_page_visits"
  ADD COLUMN "utmId" TEXT,
  ADD COLUMN "metaAdId" TEXT,
  ADD COLUMN "metaAdsetId" TEXT;

UPDATE "landing_page_visits"
SET
  "utmId" = COALESCE(
    "utmId",
    NULLIF(substring("landingUrl" from '(?:[?&]utm_id=)([^&]+)'), '')
  ),
  "metaAdId" = COALESCE(
    "metaAdId",
    NULLIF(substring("landingUrl" from '(?:[?&]meta_ad_id=)([^&]+)'), '')
  ),
  "metaAdsetId" = COALESCE(
    "metaAdsetId",
    NULLIF(substring("landingUrl" from '(?:[?&]meta_adset_id=)([^&]+)'), '')
  )
WHERE "landingUrl" IS NOT NULL;

CREATE INDEX "landing_page_visits_utmId_idx"
  ON "landing_page_visits"("utmId");

CREATE INDEX "landing_page_visits_metaAdId_idx"
  ON "landing_page_visits"("metaAdId");

CREATE INDEX "landing_page_visits_metaAdsetId_idx"
  ON "landing_page_visits"("metaAdsetId");
