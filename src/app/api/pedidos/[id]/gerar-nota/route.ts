import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { createInvoice } from "@/lib/bling/invoice";

const prisma = new PrismaClient();

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const pedidoId = params.id;

    // Busca o pedido no banco
    const pedido = await prisma.pedido.findUnique({
      where: { id: pedidoId },
    });

    if (!pedido) {
      return NextResponse.json(
        { success: false, message: "Pedido não encontrado" },
        { status: 404 }
      );
    }

    // Verifica se já foi gerada nota fiscal
    if (pedido.notaFiscalGerada) {
      return NextResponse.json(
        {
          success: false,
          message: "Nota fiscal já foi gerada para este pedido",
          notaFiscalId: pedido.notaFiscalId
        },
        { status: 400 }
      );
    }

    // Prepara os dados do pedido para a criação da nota
    const orderData = {
      id: pedido.id,
      items: pedido.items as any[],
      nome: pedido.nome,
      sobrenome: pedido.sobrenome,
      cpf: pedido.cpf,
      endereco: pedido.endereco,
      numero: pedido.numero,
      complemento: pedido.complemento || undefined,
      bairro: pedido.bairro,
      cep: pedido.cep,
      cidade: pedido.cidade,
      estado: pedido.estado,
    };

    // Tenta criar a nota fiscal
    const blingResponse = await createInvoice("", orderData);

    if (blingResponse.errors && blingResponse.errors.length > 0) {
      // Salva o erro no banco
      await prisma.pedido.update({
        where: { id: pedidoId },
        data: {
          notaFiscalErro: blingResponse.errors.map(e => e.message).join(", "),
        },
      });

      return NextResponse.json(
        {
          success: false,
          message: "Erro ao gerar nota fiscal",
          errors: blingResponse.errors,
        },
        { status: 400 }
      );
    }

    // Atualiza o pedido com os dados da nota fiscal
    await prisma.pedido.update({
      where: { id: pedidoId },
      data: {
        notaFiscalGerada: true,
        notaFiscalId: String(blingResponse.data?.id || ""),
        notaFiscalErro: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Nota fiscal gerada com sucesso",
      notaFiscal: {
        id: blingResponse.data?.id,
        numero: blingResponse.data?.numero,
        serie: blingResponse.data?.serie,
      },
    });
  } catch (error: any) {
    console.error("Erro ao gerar nota fiscal:", error);

    // Tenta salvar o erro no banco
    try {
      await prisma.pedido.update({
        where: { id: params.id },
        data: {
          notaFiscalErro: error.message || "Erro desconhecido",
        },
      });
    } catch (dbError) {
      console.error("Erro ao salvar erro no banco:", dbError);
    }

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Erro ao gerar nota fiscal",
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
