-- CreateTable
CREATE TABLE "EnderecoCliente" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "apelido" TEXT NOT NULL,
    "principal" BOOLEAN NOT NULL DEFAULT false,
    "cep" TEXT NOT NULL,
    "logradouro" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "complemento" TEXT,
    "bairro" TEXT NOT NULL,
    "cidade" TEXT NOT NULL,
    "estado" TEXT NOT NULL,
    "pais" TEXT NOT NULL DEFAULT 'Brasil',
    "nomeDestinatario" TEXT,
    "telefone" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EnderecoCliente_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EnderecoCliente_clienteId_idx" ON "EnderecoCliente"("clienteId");

-- CreateIndex
CREATE INDEX "EnderecoCliente_principal_idx" ON "EnderecoCliente"("principal");

-- AddForeignKey
ALTER TABLE "EnderecoCliente" ADD CONSTRAINT "EnderecoCliente_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;
