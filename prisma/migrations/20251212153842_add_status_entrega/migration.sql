-- AlterTable
ALTER TABLE "Pedido" ADD COLUMN     "status_entrega" TEXT NOT NULL DEFAULT 'AGUARDANDO_PAGAMENTO';

-- CreateTable
CREATE TABLE "HistoricoStatusEntrega" (
    "id" TEXT NOT NULL,
    "pedidoId" TEXT NOT NULL,
    "statusAnterior" TEXT,
    "statusNovo" TEXT NOT NULL,
    "alteradoPor" TEXT NOT NULL,
    "observacao" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HistoricoStatusEntrega_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HistoricoStatusEntrega_pedidoId_idx" ON "HistoricoStatusEntrega"("pedidoId");

-- CreateIndex
CREATE INDEX "HistoricoStatusEntrega_createdAt_idx" ON "HistoricoStatusEntrega"("createdAt");

-- AddForeignKey
ALTER TABLE "HistoricoStatusEntrega" ADD CONSTRAINT "HistoricoStatusEntrega_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "Pedido"("id") ON DELETE CASCADE ON UPDATE CASCADE;
