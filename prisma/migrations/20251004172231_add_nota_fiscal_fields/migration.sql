-- AlterTable
ALTER TABLE "Pedido" ADD COLUMN     "notaFiscalErro" TEXT,
ADD COLUMN     "notaFiscalGerada" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "notaFiscalId" TEXT;
