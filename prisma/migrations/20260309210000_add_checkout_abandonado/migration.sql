-- CreateTable
CREATE TABLE "CheckoutAbandonado" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "step" TEXT NOT NULL,
    "email" TEXT,
    "telefone" TEXT,
    "nome" TEXT,
    "cpf" TEXT,
    "cep" TEXT,
    "cidade" TEXT,
    "estado" TEXT,
    "items" JSONB,
    "valor" DOUBLE PRECISION,
    "cupons" TEXT[],
    "convertido" BOOLEAN NOT NULL DEFAULT false,
    "device" TEXT,
    "userAgent" TEXT,
    "ip" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CheckoutAbandonado_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CheckoutAbandonado_sessionId_idx" ON "CheckoutAbandonado"("sessionId");

-- CreateIndex
CREATE INDEX "CheckoutAbandonado_email_idx" ON "CheckoutAbandonado"("email");

-- CreateIndex
CREATE INDEX "CheckoutAbandonado_convertido_idx" ON "CheckoutAbandonado"("convertido");

-- CreateIndex
CREATE INDEX "CheckoutAbandonado_createdAt_idx" ON "CheckoutAbandonado"("createdAt");

-- CreateIndex
CREATE INDEX "CheckoutAbandonado_step_idx" ON "CheckoutAbandonado"("step");

