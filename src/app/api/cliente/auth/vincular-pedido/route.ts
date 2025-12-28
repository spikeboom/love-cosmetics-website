import { NextRequest, NextResponse } from 'next/server';
import { verificarAutenticacao } from '@/lib/cliente/auth';
import { vincularPedidoCliente } from '@/lib/cliente/session';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    // Verificar se está autenticado
    const session = await verificarAutenticacao(request);

    if (!session) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { pedidoId } = body;

    if (!pedidoId) {
      return NextResponse.json(
        { error: 'ID do pedido é obrigatório' },
        { status: 400 }
      );
    }

    // Buscar o pedido
    const pedido = await prisma.pedido.findUnique({
      where: { id: pedidoId },
      include: {
        pedidoCliente: true
      }
    });

    if (!pedido) {
      return NextResponse.json(
        { error: 'Pedido não encontrado' },
        { status: 404 }
      );
    }

    // Verificar se o pedido já está vinculado
    if (pedido.pedidoCliente) {
      // Se já está vinculado ao mesmo cliente, tudo bem
      if (pedido.pedidoCliente.clienteId === session.id) {
        return NextResponse.json({
          success: true,
          message: 'Pedido já vinculado à sua conta'
        });
      }

      // Se está vinculado a outro cliente, erro
      return NextResponse.json(
        { error: 'Este pedido pertence a outra conta' },
        { status: 400 }
      );
    }

    // Buscar dados do cliente para verificar CPF
    const cliente = await prisma.cliente.findUnique({
      where: { id: session.id },
      select: { cpf: true }
    });

    // Verificar se o CPF do pedido bate com o CPF do cliente
    if (cliente?.cpf && pedido.cpf !== cliente.cpf) {
      return NextResponse.json(
        { error: 'O CPF deste pedido não corresponde ao da sua conta' },
        { status: 400 }
      );
    }

    // Vincular pedido ao cliente
    await vincularPedidoCliente(pedidoId, session.id);

    return NextResponse.json({
      success: true,
      message: 'Pedido vinculado com sucesso!'
    });

  } catch (error) {
    console.error('Erro ao vincular pedido:', error);
    return NextResponse.json(
      { error: 'Erro ao vincular pedido' },
      { status: 500 }
    );
  }
}
