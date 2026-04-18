-- CreateTable
CREATE TABLE "DreCache" (
    "id" TEXT NOT NULL,
    "mes" INTEGER NOT NULL,
    "ano" INTEGER NOT NULL,
    "resultado" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DreCache_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DreCache_mes_ano_idx" ON "DreCache"("mes", "ano");

-- CreateIndex
CREATE UNIQUE INDEX "DreCache_mes_ano_key" ON "DreCache"("mes", "ano");
