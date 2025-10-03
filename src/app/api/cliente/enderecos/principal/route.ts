import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verificarAutenticacao } from '@/lib/cliente/auth';

// PUT - Definir endereço como principal
export async function PUT(request: NextRequest) {
  try {
    const cliente = await verificarAutenticacao(request);
    if (!cliente) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const { enderecoId } = await request.json();

    if (!enderecoId) {
      return NextResponse.json(
        { error: 'ID do endereço é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar se o endereço pertence ao cliente
    const endereco = await prisma.enderecoCliente.findFirst({
      where: {
        id: enderecoId,
        clienteId: cliente.id,
        ativo: true
      }
    });

    if (!endereco) {
      return NextResponse.json(
        { error: 'Endereço não encontrado' },
        { status: 404 }
      );
    }

    // Desmarcar todos os outros endereços como principal
    await prisma.enderecoCliente.updateMany({
      where: {
        clienteId: cliente.id,
        principal: true,
        id: { not: enderecoId }
      },
      data: {
        principal: false
      }
    });

    // Marcar o endereço selecionado como principal
    const enderecoAtualizado = await prisma.enderecoCliente.update({
      where: { id: enderecoId },
      data: { principal: true }
    });

    return NextResponse.json(enderecoAtualizado);
  } catch (error) {
    console.error('Erro ao definir endereço principal:', error);
    return NextResponse.json(
      { error: 'Erro ao definir endereço principal' },
      { status: 500 }
    );
  }
}