-- AlterTable
ALTER TABLE "Pedido" ADD COLUMN     "cupons" TEXT[],
ADD COLUMN     "descontos" DOUBLE PRECISION NOT NULL DEFAULT 0;
