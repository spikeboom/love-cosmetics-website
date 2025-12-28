import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// APENAS PARA DESENVOLVIMENTO - Excluir cliente pelo CPF
export async function DELETE(request: NextRequest) {
  // Bloquear em produção
  if (process.env.NODE_ENV === 'production' || process.env.STAGE === 'PRODUCTION') {
    return NextResponse.json(
      { error: 'Esta rota não está disponível em produção' },
      { status: 403 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const cpf = searchParams.get('cpf');

    if (!cpf) {
      return NextResponse.json(
        { error: 'CPF é obrigatório' },
        { status: 400 }
      );
    }

    // Limpar CPF
    const cpfLimpo = cpf.replace(/\D/g, '');

    // Buscar cliente
    const cliente = await prisma.cliente.findFirst({
      where: { cpf: cpfLimpo }
    });

    if (!cliente) {
      return NextResponse.json(
        { error: 'Cliente não encontrado' },
        { status: 404 }
      );
    }

    // Excluir sessões primeiro (foreign key)
    await prisma.sessaoCliente.deleteMany({
      where: { clienteId: cliente.id }
    });

    // Excluir cliente
    await prisma.cliente.delete({
      where: { id: cliente.id }
    });

    console.log(`[DEV] Cliente excluído: ${cliente.nome} (CPF: ${cpfLimpo})`);

    return NextResponse.json({
      success: true,
      message: `Cliente ${cliente.nome} excluído com sucesso`,
      cliente: {
        id: cliente.id,
        nome: cliente.nome,
        email: cliente.email
      }
    });

  } catch (error) {
    console.error('Erro ao excluir cliente:', error);
    return NextResponse.json(
      { error: 'Erro ao excluir cliente' },
      { status: 500 }
    );
  }
}
