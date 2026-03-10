-- CreateTable
CREATE TABLE "ConsultaCep" (
    "id" TEXT NOT NULL,
    "cep" TEXT NOT NULL,
    "bairro" TEXT,
    "cidade" TEXT,
    "estado" TEXT,
    "origem" TEXT,
    "sessionId" TEXT,
    "email" TEXT,
    "nome" TEXT,
    "telefone" TEXT,
    "cpf" TEXT,
    "clienteId" TEXT,
    "freteMinimo" DOUBLE PRECISION,
    "prazoMinimo" INTEGER,
    "transportadora" TEXT,
    "totalServicos" INTEGER,
    "device" TEXT,
    "userAgent" TEXT,
    "ip" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConsultaCep_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ConsultaCep_cep_idx" ON "ConsultaCep"("cep");

-- CreateIndex
CREATE INDEX "ConsultaCep_estado_idx" ON "ConsultaCep"("estado");

-- CreateIndex
CREATE INDEX "ConsultaCep_sessionId_idx" ON "ConsultaCep"("sessionId");

-- CreateIndex
CREATE INDEX "ConsultaCep_email_idx" ON "ConsultaCep"("email");

-- CreateIndex
CREATE INDEX "ConsultaCep_createdAt_idx" ON "ConsultaCep"("createdAt");
