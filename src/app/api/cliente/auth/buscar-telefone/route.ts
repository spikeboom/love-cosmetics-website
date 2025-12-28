import { NextRequest, NextResponse } from 'next/server';
import { findClienteByCPF } from '@/lib/cliente/session';

// Mascarar telefone: mostra apenas os 4 últimos dígitos
function mascararTelefone(telefone: string): string {
  const limpo = telefone.replace(/\D/g, '');
  if (limpo.length >= 4) {
    return `(**) *****-${limpo.slice(-4)}`;
  }
  return '****';
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cpf } = body;

    if (!cpf) {
      return NextResponse.json(
        { error: 'CPF é obrigatório' },
        { status: 400 }
      );
    }

    // Buscar cliente pelo CPF
    const cliente = await findClienteByCPF(cpf);

    if (!cliente) {
      return NextResponse.json(
        { error: 'CPF não encontrado' },
        { status: 404 }
      );
    }

    if (!cliente.telefone) {
      return NextResponse.json(
        { error: 'Nenhum telefone cadastrado para este CPF' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      telefoneMascarado: mascararTelefone(cliente.telefone),
      nome: cliente.nome
    });

  } catch (error) {
    console.error('Erro ao buscar telefone:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar dados' },
      { status: 500 }
    );
  }
}
