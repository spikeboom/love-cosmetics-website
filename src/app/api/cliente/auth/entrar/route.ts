import { NextRequest, NextResponse } from 'next/server';
import { loginClienteSchema } from '@/lib/cliente/validation';
import { verifyPassword, createSession, setSessionCookie } from '@/lib/cliente/auth';
import { findClienteByEmail, checkRateLimit, resetRateLimit } from '@/lib/cliente/session';
import { ZodError } from 'zod';

export async function POST(request: NextRequest) {
  try {
    console.log('[LOVE-AUTH-LOG] Iniciando processo de login');
    
    // Parse do body
    const body = await request.json();
    console.log('[LOVE-AUTH-LOG] Body recebido:', { email: body.email, hasPassword: !!body.password });
    
    // Validar dados com Zod
    const validatedData = loginClienteSchema.parse(body);
    console.log('[LOVE-AUTH-LOG] Dados validados com sucesso:', { email: validatedData.email });
    
    // Verificar rate limit por IP e email
    const ip = request.headers.get('x-forwarded-for') || 
                request.headers.get('x-real-ip') || 
                'unknown';
    
    const rateLimitKey = `${ip}:${validatedData.email}`;
    const rateLimit = checkRateLimit(rateLimitKey);
    console.log('[LOVE-AUTH-LOG] Rate limit verificado:', { ip, email: validatedData.email, allowed: rateLimit.allowed, remainingAttempts: rateLimit.remainingAttempts });
    
    if (!rateLimit.allowed) {
      console.log('[LOVE-AUTH-LOG] Rate limit excedido');
      return NextResponse.json(
        { 
          error: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
          remainingAttempts: 0
        },
        { status: 429 }
      );
    }
    
    // Buscar cliente por email
    console.log('[LOVE-AUTH-LOG] Buscando cliente por email:', validatedData.email);
    const cliente = await findClienteByEmail(validatedData.email);
    console.log('[LOVE-AUTH-LOG] Cliente encontrado:', { found: !!cliente, active: cliente?.ativo });
    
    // Verificar se cliente existe e senha está correta
    console.log('[LOVE-AUTH-LOG] Verificando credenciais...');
    const passwordValid = cliente ? await verifyPassword(cliente.passwordHash, validatedData.password) : false;
    console.log('[LOVE-AUTH-LOG] Resultado da verificação:', { clienteExists: !!cliente, passwordValid });
    
    if (!cliente || !passwordValid) {
      console.log('[LOVE-AUTH-LOG] Credenciais inválidas');
      return NextResponse.json(
        { 
          error: 'Email ou senha incorretos',
          remainingAttempts: rateLimit.remainingAttempts
        },
        { status: 401 }
      );
    }
    
    // Verificar se cliente está ativo
    if (!cliente.ativo) {
      console.log('[LOVE-AUTH-LOG] Cliente inativo');
      return NextResponse.json(
        { 
          error: 'Conta desativada. Entre em contato com o suporte.',
        },
        { status: 403 }
      );
    }
    
    // Resetar rate limit após login bem-sucedido
    console.log('[LOVE-AUTH-LOG] Login bem-sucedido, resetando rate limit');
    resetRateLimit(rateLimitKey);
    
    // Criar sessão
    const userAgent = request.headers.get('user-agent') || undefined;
    console.log('[LOVE-AUTH-LOG] Criando sessão para cliente:', { clienteId: cliente.id, email: cliente.email, ip, userAgent });
    const token = await createSession(
      cliente.id,
      cliente.email,
      userAgent,
      ip === 'unknown' ? undefined : ip
    );
    console.log('[LOVE-AUTH-LOG] Sessão criada com sucesso, token gerado');
    
    // Definir cookie de sessão
    console.log('[LOVE-AUTH-LOG] Definindo cookie de sessão');
    await setSessionCookie(token);
    console.log('[LOVE-AUTH-LOG] Cookie definido com sucesso');
    
    // Retornar sucesso com dados do cliente
    console.log('[LOVE-AUTH-LOG] Retornando resposta de sucesso');
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
      console.log('[LOVE-AUTH-LOG] Erro de validação Zod:', error.errors);
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
    console.error('[LOVE-AUTH-LOG] Erro genérico no login:', error);
    return NextResponse.json(
      { error: 'Erro ao processar login. Tente novamente.' },
      { status: 500 }
    );
  }
}