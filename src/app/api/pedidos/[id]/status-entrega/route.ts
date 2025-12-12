import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Status de entrega disponíveis
export const STATUS_ENTREGA = {
  AGUARDANDO_PAGAMENTO: "Aguardando Pagamento",
  PAGAMENTO_CONFIRMADO: "Pagamento Confirmado",
  EM_SEPARACAO: "Em Separação",
  EMBALADO: "Embalado",
  ENVIADO: "Enviado",
  EM_TRANSITO: "Em Trânsito",
  SAIU_PARA_ENTREGA: "Saiu para Entrega",
  ENTREGUE: "Entregue",
  CANCELADO: "Cancelado",
  DEVOLVIDO: "Devolvido",
} as const;

// Usuários permitidos
export const USUARIOS_PERMITIDOS = [
  "Adriano",
  "Cassy",
  "Paulo",
  "Gerilza",
  "Isabelle",
] as const;

// GET - Buscar histórico de status de um pedido
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const historico = await prisma.historicoStatusEntrega.findMany({
      where: { pedidoId: id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      historico,
      statusDisponiveis: STATUS_ENTREGA,
      usuariosPermitidos: USUARIOS_PERMITIDOS,
    });
  } catch (error) {
    console.error("Erro ao buscar histórico de status:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao buscar histórico" },
      { status: 500 }
    );
  }
}

// POST - Alterar status de entrega
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { statusNovo, alteradoPor, observacao } = body;

    // Validações
    if (!statusNovo) {
      return NextResponse.json(
        { success: false, error: "Status é obrigatório" },
        { status: 400 }
      );
    }

    if (!alteradoPor) {
      return NextResponse.json(
        { success: false, error: "Usuário é obrigatório" },
        { status: 400 }
      );
    }

    if (!Object.keys(STATUS_ENTREGA).includes(statusNovo)) {
      return NextResponse.json(
        { success: false, error: "Status inválido" },
        { status: 400 }
      );
    }

    // Buscar pedido atual
    const pedido = await prisma.pedido.findUnique({
      where: { id },
      select: { status_entrega: true },
    });

    if (!pedido) {
      return NextResponse.json(
        { success: false, error: "Pedido não encontrado" },
        { status: 404 }
      );
    }

    // Atualizar status e criar histórico em uma transação
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
