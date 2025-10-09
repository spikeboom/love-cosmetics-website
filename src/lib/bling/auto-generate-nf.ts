import { getCurrentToken } from "./simple-auth";
import { createInvoice } from "./invoice";
import { createLogger } from "@/utils/logMessage";
import { prisma } from "@/lib/prisma";

const logMessage = createLogger();

interface PedidoItem {
  id: string | number;
  name: string;
  quantity: number;
  value: number;
  discount?: number;
  reference_id?: string | number;
  unit_amount?: number;
  preco?: number;
}

// Tenta gerar nota fiscal automaticamente para um pedido
export async function tryAutoGenerateNF(pedidoId: string): Promise<boolean> {
  try {
    // Verificar se há token disponível
    const accessToken = await getCurrentToken();
    if (!accessToken) {
      logMessage("Geração automática de NF ignorada - Token não disponível", { pedidoId });
      return false;
    }

    // Buscar dados do pedido
    const pedido = await prisma.pedido.findUnique({
      where: { id: pedidoId }
    });

    if (!pedido) {
      logMessage("Pedido não encontrado para geração de NF", { pedidoId });
      return false;
    }

    // Preparar dados do pedido para a NF
    const orderData = {
      id: pedido.id,
      items: pedido.items as unknown as PedidoItem[],
      additionalInfo: `Venda pela Internet. Pedido ${pedido.id}`,
      // Dados do cliente do formulário
      nome: pedido.nome,
      sobrenome: pedido.sobrenome,
      email: pedido.email,
      telefone: pedido.telefone,
      cpf: pedido.cpf,
      endereco: pedido.endereco,
      numero: pedido.numero,
      complemento: pedido.complemento || undefined,
      bairro: pedido.bairro,
      cep: pedido.cep,
      cidade: pedido.cidade,
      estado: pedido.estado
    };

    // Criar nota fiscal no Bling
    const blingResponse = await createInvoice(accessToken, orderData);

    if (blingResponse.errors && blingResponse.errors.length > 0) {
      logMessage("Erro do Bling ao gerar NF automaticamente", {
        pedidoId,
        errors: blingResponse.errors
      });
      return false;
    }

    logMessage("NF gerada automaticamente com sucesso", {
      pedidoId,
      blingId: blingResponse.data?.id,
      numero: blingResponse.data?.numero
    });

    return true;

  } catch (error) {
    logMessage("Erro na geração automática de NF", {
      pedidoId,
      error: error instanceof Error ? error.message : "Erro desconhecido"
    });
    return false;
  }
}