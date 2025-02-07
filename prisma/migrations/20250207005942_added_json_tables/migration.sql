-- CreateTable
CREATE TABLE "StatusCheckout" (
    "id" SERIAL NOT NULL,
    "info" JSONB NOT NULL,

    CONSTRAINT "StatusCheckout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StatusPagamento" (
    "id" SERIAL NOT NULL,
    "info" JSONB NOT NULL,

    CONSTRAINT "StatusPagamento_pkey" PRIMARY KEY ("id")
);
