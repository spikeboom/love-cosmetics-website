import { NextRequest, NextResponse } from 'next/server';
import { hashPassword, createSession, setSessionCookie } from '@/lib/cliente/auth';
import { findClienteByCPF, updateClientePassword } from '@/lib/cliente/session';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cpf, token, novaSenha } = body;

    if (!cpf || !token || !novaSenha) {
      return NextResponse.json(
        { error: 'CPF, token e nova senha são obrigatórios' },
        { status: 400 }
      );
    }

    // Validar senha
    if (novaSenha.length < 6) {
      return NextResponse.json(
        { error: 'A senha deve ter pelo menos 6 caracteres' },
        { status: 400 }
      );
    }

    // Buscar cliente primeiro para validar CPF
    const cliente = await findClienteByCPF(cpf);

    if (!cliente) {
      return NextResponse.json(
        { error: 'Cliente não encontrado' },
        { status: 404 }
      );
    }

    // Validar token no banco de dados
    const tokenRegistro = await prisma.tokenRecuperacao.findFirst({
      where: {
        token,
        clienteId: cliente.id,
        usado: false,
        expiresAt: {
          gt: new Date()
        }
      }
    });

    console.log(`[Token Reset] Buscando token para cliente ${cliente.id}:`, tokenRegistro ? 'encontrado' : 'não encontrado');

    if (!tokenRegistro) {
      return NextResponse.json(
        { error: 'Token inválido ou expirado. Solicite um novo código.' },
        { status: 400 }
      );
    }

    // Hash da nova senha
    const passwordHash = await hashPassword(novaSenha);

    // Atualizar senha (isso também invalida todas as sessões)
    await updateClientePassword(cliente.id, passwordHash);

    // Marcar token como usado no banco de dados
    await prisma.tokenRecuperacao.update({
      where: { id: tokenRegistro.id },
      data: { usado: true }
    });

    // Criar nova sessão automaticamente
    const userAgent = request.headers.get('user-agent') || undefined;
    const ip = request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      undefined;

    const sessionToken = await createSession(
      cliente.id,
      cliente.email,
      userAgent,
      ip
    );

    // Definir cookie de sessão
    await setSessionCookie(sessionToken);

    return NextResponse.json({
      success: true,
      message: 'Senha alterada com sucesso!',
      cliente: {
        id: cliente.id,
        nome: cliente.nome,
        email: cliente.email
      }
    });

  } catch (error) {
    console.error('Erro ao resetar senha:', error);
    return NextResponse.json(
      { error: 'Erro ao alterar senha' },
      { status: 500 }
    );
  }
}
