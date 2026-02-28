-- AlterTable
ALTER TABLE "Pedido" ADD COLUMN "idempotency_key" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Pedido_idempotency_key_key" ON "Pedido"("idempotency_key");

-- CreateTable
CREATE TABLE "CupomReserva" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "pedidoId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'RESERVED',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CupomReserva_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CupomReserva_pedidoId_key" ON "CupomReserva"("pedidoId");

-- CreateIndex
CREATE INDEX "CupomReserva_codigo_idx" ON "CupomReserva"("codigo");

-- CreateIndex
CREATE INDEX "CupomReserva_status_idx" ON "CupomReserva"("status");

-- CreateIndex
CREATE INDEX "CupomReserva_expiresAt_idx" ON "CupomReserva"("expiresAt");

-- AddForeignKey
ALTER TABLE "CupomReserva" ADD CONSTRAINT "CupomReserva_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "Pedido"("id") ON DELETE CASCADE ON UPDATE CASCADE;

