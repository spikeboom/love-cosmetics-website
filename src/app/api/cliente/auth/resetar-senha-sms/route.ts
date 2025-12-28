import { NextRequest, NextResponse } from 'next/server';
import { hashPassword, createSession, setSessionCookie } from '@/lib/cliente/auth';
import { findClienteByCPF, updateClientePassword } from '@/lib/cliente/session';
import { tokensReset } from '@/lib/cliente/sms-storage';

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

    // Validar token
    const registro = tokensReset.get(token);

    if (!registro) {
      return NextResponse.json(
        { error: 'Token inválido ou expirado. Solicite um novo código.' },
        { status: 400 }
      );
    }

    if (registro.expiresAt < new Date()) {
      tokensReset.delete(token);
      return NextResponse.json(
        { error: 'Token expirado. Solicite um novo código.' },
        { status: 400 }
      );
    }

    if (registro.cpf !== cpf) {
      return NextResponse.json(
        { error: 'Token não corresponde ao CPF informado' },
        { status: 400 }
      );
    }

    // Buscar cliente
    const cliente = await findClienteByCPF(cpf);

    if (!cliente) {
      return NextResponse.json(
        { error: 'Cliente não encontrado' },
        { status: 404 }
      );
    }

    // Hash da nova senha
    const passwordHash = await hashPassword(novaSenha);

    // Atualizar senha (isso também invalida todas as sessões)
    await updateClientePassword(cliente.id, passwordHash);

    // Invalidar token usado
    tokensReset.delete(token);

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
