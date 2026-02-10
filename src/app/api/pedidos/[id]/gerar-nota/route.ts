import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { createInvoice } from "@/lib/bling/invoice";

const prisma = new PrismaClient();

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: pedidoId } = await params;

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
    const body = await request.json().catch(() => ({}));
    const forceRegenerate = body?.force === true;

    if (pedido.notaFiscalGerada && !forceRegenerate) {
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
    // Heurística para detectar modelo antigo (cupom embutido no preco) vs novo (cupom no total)
    const items = pedido.items as any[];
    const cupomValor = pedido.cupom_valor ?? 0;
    const frete = pedido.frete_calculado ?? 0;
    const totalPedido = pedido.total_pedido ?? 0;
    const sumItemPrices = items.reduce(
      (acc: number, it: any) => acc + (it.preco ?? it.unit_amount ?? 0) * (it.quantity || 1),
      0,
    );

    let descontoTotal: number;
    if (pedido.origem === "admin") {
      // Admin sempre usa cupom_valor
      descontoTotal = cupomValor;
    } else if (cupomValor > 0 && Math.abs(sumItemPrices - cupomValor + frete - totalPedido) < 1) {
      // Modelo novo: items têm preço base, cupom_valor separado
      descontoTotal = cupomValor;
    } else {
      // Modelo antigo: cupom já está embutido nos preços dos itens
      descontoTotal = 0;
    }

    const orderData = {
      id: pedido.id,
      items,
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
      estado: pedido.estado,
      // Dados de frete
      frete_calculado: pedido.frete_calculado,
      transportadora_nome: pedido.transportadora_nome || undefined,
      transportadora_servico: pedido.transportadora_servico || undefined,
      transportadora_prazo: pedido.transportadora_prazo || undefined,
      // Desconto
      desconto_total: descontoTotal,
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
      const { id } = await params;
      await prisma.pedido.update({
        where: { id },
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
