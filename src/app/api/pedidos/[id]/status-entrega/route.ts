import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { STATUS_ENTREGA, USUARIOS_PERMITIDOS } from "@/app/(admin)/pedidos/constants/statusEntrega";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const historico = await prisma.historicoStatusEntrega.findMany({
      where: { pedidoId: id },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    });

    return NextResponse.json({
      success: true,
      historico,
      statusDisponiveis: STATUS_ENTREGA,
      usuariosPermitidos: USUARIOS_PERMITIDOS,
    });
  } catch (error) {
    console.error("Erro ao buscar historico de status:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao buscar historico" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { statusNovo, alteradoPor, observacao } = body;

    if (!statusNovo) {
      return NextResponse.json(
        { success: false, error: "Status e obrigatorio" },
        { status: 400 }
      );
    }

    if (!alteradoPor) {
      return NextResponse.json(
        { success: false, error: "Usuario e obrigatorio" },
        { status: 400 }
      );
    }

    if (!USUARIOS_PERMITIDOS.includes(alteradoPor)) {
      return NextResponse.json(
        { success: false, error: "Usuario invalido" },
        { status: 400 }
      );
    }

    if (!Object.keys(STATUS_ENTREGA).includes(statusNovo)) {
      return NextResponse.json(
        { success: false, error: "Status invalido" },
        { status: 400 }
      );
    }

    const pedido = await prisma.pedido.findUnique({
      where: { id },
      select: { status_entrega: true },
    });

    if (!pedido) {
      return NextResponse.json(
        { success: false, error: "Pedido nao encontrado" },
        { status: 404 }
      );
    }

    const [pedidoAtualizado, historicoNovo] = await prisma.$transaction([
      prisma.pedido.update({
        where: { id },
        data: { status_entrega: statusNovo },
      }),
      prisma.historicoStatusEntrega.create({
        data: {
          pedidoId: id,
          statusAnterior: pedido.status_entrega,
          statusNovo,
          alteradoPor,
          observacao: observacao || null,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: "Status atualizado com sucesso",
      pedido: pedidoAtualizado,
      historico: historicoNovo,
    });
  } catch (error) {
    console.error("Erro ao atualizar status de entrega:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao atualizar status" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const historicoId = typeof body?.historicoId === "string" ? body.historicoId : "";

    if (!historicoId) {
      return NextResponse.json(
        { success: false, error: "historicoId e obrigatorio" },
        { status: 400 }
      );
    }

    const registro = await prisma.historicoStatusEntrega.findUnique({
      where: { id: historicoId },
      select: { id: true, pedidoId: true },
    });

    if (!registro || registro.pedidoId !== id) {
      return NextResponse.json(
        { success: false, error: "Registro de historico nao encontrado" },
        { status: 404 }
      );
    }

    const pedido = await prisma.pedido.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!pedido) {
      return NextResponse.json(
        { success: false, error: "Pedido nao encontrado" },
        { status: 404 }
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.historicoStatusEntrega.delete({
        where: { id: historicoId },
      });

      const ultimoHistorico = await tx.historicoStatusEntrega.findFirst({
        where: { pedidoId: id },
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        select: { statusNovo: true },
      });

      await tx.pedido.update({
        where: { id },
        data: {
          status_entrega: ultimoHistorico?.statusNovo || "AGUARDANDO_PAGAMENTO",
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: "Registro removido com sucesso",
    });
  } catch (error) {
    console.error("Erro ao remover status de entrega:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao remover status" },
      { status: 500 }
    );
  }
}
