-- AlterTable
ALTER TABLE "Pedido" ADD COLUMN     "pagbank_charge_id" TEXT,
ADD COLUMN     "pagbank_error" TEXT,
ADD COLUMN     "pagbank_order_id" TEXT,
ADD COLUMN     "payment_card_info" TEXT,
ADD COLUMN     "payment_method" TEXT,
ADD COLUMN     "pix_expiration" TEXT,
ADD COLUMN     "pix_qr_code" TEXT,
ADD COLUMN     "pix_qr_code_url" TEXT,
ADD COLUMN     "status_pagamento" TEXT;
