-- CreateTable
CREATE TABLE "Cliente" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "sobrenome" TEXT NOT NULL,
    "cpf" TEXT,
    "telefone" TEXT,
    "passwordHash" TEXT NOT NULL,
    "cep" TEXT,
    "endereco" TEXT,
    "numero" TEXT,
    "complemento" TEXT,
    "bairro" TEXT,
    "cidade" TEXT,
    "estado" TEXT,
    "receberWhatsapp" BOOLEAN NOT NULL DEFAULT false,
    "receberEmail" BOOLEAN NOT NULL DEFAULT true,
    "emailVerificado" BOOLEAN NOT NULL DEFAULT false,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SessaoCliente" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SessaoCliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PedidoCliente" (
    "id" TEXT NOT NULL,
    "pedidoId" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PedidoCliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CupomUsado" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "cupom" TEXT NOT NULL,
    "valorDesconto" DOUBLE PRECISION NOT NULL,
    "pedidoId" TEXT,
    "usadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CupomUsado_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TokenRecuperacao" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usado" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TokenRecuperacao_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Cliente_email_key" ON "Cliente"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Cliente_cpf_key" ON "Cliente"("cpf");

-- CreateIndex
CREATE INDEX "Cliente_email_idx" ON "Cliente"("email");

-- CreateIndex
CREATE INDEX "Cliente_cpf_idx" ON "Cliente"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "SessaoCliente_token_key" ON "SessaoCliente"("token");

-- CreateIndex
CREATE INDEX "SessaoCliente_token_idx" ON "SessaoCliente"("token");

-- CreateIndex
CREATE INDEX "SessaoCliente_clienteId_idx" ON "SessaoCliente"("clienteId");

-- CreateIndex
CREATE INDEX "SessaoCliente_expiresAt_idx" ON "SessaoCliente"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "PedidoCliente_pedidoId_key" ON "PedidoCliente"("pedidoId");

-- CreateIndex
CREATE INDEX "PedidoCliente_clienteId_idx" ON "PedidoCliente"("clienteId");

-- CreateIndex
CREATE INDEX "CupomUsado_clienteId_idx" ON "CupomUsado"("clienteId");

-- CreateIndex
CREATE INDEX "CupomUsado_cupom_idx" ON "CupomUsado"("cupom");

-- CreateIndex
CREATE UNIQUE INDEX "TokenRecuperacao_token_key" ON "TokenRecuperacao"("token");

-- CreateIndex
CREATE INDEX "TokenRecuperacao_token_idx" ON "TokenRecuperacao"("token");

-- CreateIndex
CREATE INDEX "TokenRecuperacao_clienteId_idx" ON "TokenRecuperacao"("clienteId");

-- AddForeignKey
ALTER TABLE "SessaoCliente" ADD CONSTRAINT "SessaoCliente_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PedidoCliente" ADD CONSTRAINT "PedidoCliente_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PedidoCliente" ADD CONSTRAINT "PedidoCliente_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "Pedido"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CupomUsado" ADD CONSTRAINT "CupomUsado_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
