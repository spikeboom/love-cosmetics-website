import { NextRequest, NextResponse } from 'next/server';
import { loginCpfSchema } from '@/lib/cliente/validation';
import { verifyPassword, createSession, setSessionCookie } from '@/lib/cliente/auth';
import { findClienteByCPF, checkRateLimit, resetRateLimit } from '@/lib/cliente/session';
import { ZodError } from 'zod';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validar dados com Zod
    const validatedData = loginCpfSchema.parse(body);

    // Verificar rate limit por IP e CPF
    const ip = request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown';

    const rateLimitKey = `${ip}:${validatedData.cpf}`;
    const rateLimit = await checkRateLimit(rateLimitKey);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
          remainingAttempts: 0
        },
        { status: 429 }
      );
    }

    // Buscar cliente por CPF
    const cliente = await findClienteByCPF(validatedData.cpf);

    // Verificar se cliente existe e senha está correta
    const passwordValid = cliente ? await verifyPassword(cliente.passwordHash, validatedData.password) : false;

    if (!cliente || !passwordValid) {
      return NextResponse.json(
        {
          error: 'CPF ou senha incorretos',
          remainingAttempts: rateLimit.remainingAttempts
        },
        { status: 401 }
      );
    }

    // Verificar se cliente está ativo
    if (!cliente.ativo) {
      return NextResponse.json(
        {
          error: 'Conta desativada. Entre em contato com o suporte.',
        },
        { status: 403 }
      );
    }

    // Resetar rate limit após login bem-sucedido
    await resetRateLimit(rateLimitKey);

    // Criar sessão
    const userAgent = request.headers.get('user-agent') || undefined;
    const token = await createSession(
      cliente.id,
      cliente.email,
      userAgent,
      ip === 'unknown' ? undefined : ip
    );

    // Definir cookie de sessão
    await setSessionCookie(token);

    // Retornar sucesso com dados do cliente
    return NextResponse.json({
      success: true,
      cliente: {
        id: cliente.id,
        email: cliente.email,
        nome: cliente.nome,
        sobrenome: cliente.sobrenome,
        cpf: cliente.cpf,
        telefone: cliente.telefone,
        emailVerificado: cliente.emailVerificado,
        // Dados do endereço se existirem
        endereco: cliente.cep ? {
          cep: cliente.cep,
          endereco: cliente.endereco,
          numero: cliente.numero,
          complemento: cliente.complemento,
          bairro: cliente.bairro,
          cidade: cliente.cidade,
          estado: cliente.estado,
        } : null,
        // Preferências
        receberWhatsapp: cliente.receberWhatsapp,
        receberEmail: cliente.receberEmail,
      },
      message: 'Login realizado com sucesso!'
    });

  } catch (error) {
    // Erro de validação Zod
    if (error instanceof ZodError) {
      const firstError = error.errors[0];
      return NextResponse.json(
        {
          error: firstError.message,
          field: firstError.path.join('.')
        },
        { status: 400 }
      );
    }

    // Erro genérico
    console.error('Erro no login por CPF:', error);
    return NextResponse.json(
      { error: 'Erro ao processar login. Tente novamente.' },
      { status: 500 }
    );
  }
}
