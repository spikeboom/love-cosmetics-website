-- AlterTable
ALTER TABLE "Pedido" ADD COLUMN     "items" JSONB[],
ADD COLUMN     "total_pedido" DOUBLE PRECISION NOT NULL DEFAULT 0;
