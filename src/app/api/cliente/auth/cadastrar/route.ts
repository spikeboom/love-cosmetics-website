import { NextRequest, NextResponse } from 'next/server';
import { cadastroClienteSchema } from '@/lib/cliente/validation';
import { hashPassword, createSession, setSessionCookie } from '@/lib/cliente/auth';
import { cpfExists, createCliente } from '@/lib/cliente/session';
import { ZodError } from 'zod';

export async function POST(request: NextRequest) {
  try {
    // Parse do body
    const body = await request.json();

    // Validar dados com Zod
    const validatedData = cadastroClienteSchema.parse(body);

    // Verificar se CPF já existe
    if (await cpfExists(validatedData.cpf)) {
      return NextResponse.json(
        {
          error: 'CPF já cadastrado. Faça login com sua senha.',
          field: 'cpf'
        },
        { status: 400 }
      );
    }

    // Hash da senha
    const passwordHash = await hashPassword(validatedData.password);

    // Criar cliente no banco
    const cliente = await createCliente({
      email: validatedData.email,
      nome: validatedData.nome,
      sobrenome: validatedData.sobrenome,
      passwordHash,
      cpf: validatedData.cpf,
      telefone: validatedData.telefone || undefined,
      data_nascimento: validatedData.data_nascimento || undefined,
      receberWhatsapp: validatedData.receberWhatsapp,
      receberEmail: validatedData.receberEmail,
      // Dados de endereço (opcionais)
      cep: validatedData.cep || undefined,
      endereco: validatedData.endereco || undefined,
      numero: validatedData.numero || undefined,
      complemento: validatedData.complemento || undefined,
      bairro: validatedData.bairro || undefined,
      cidade: validatedData.cidade || undefined,
      estado: validatedData.estado || undefined,
    });
    
    // Criar sessão
    const userAgent = request.headers.get('user-agent') || undefined;
    const ip = request.headers.get('x-forwarded-for') || 
                request.headers.get('x-real-ip') || 
                undefined;
    
    const token = await createSession(
      cliente.id, 
      cliente.email,
      userAgent,
      ip
    );
    
    // Definir cookie de sessão
    await setSessionCookie(token);
    
    // Retornar sucesso com dados do cliente (sem dados sensíveis)
    return NextResponse.json({
      success: true,
      cliente: {
        id: cliente.id,
        email: cliente.email,
        nome: cliente.nome,
        sobrenome: cliente.sobrenome,
      },
      message: 'Cadastro realizado com sucesso!'
    });
    
  } catch (error) {
    // Erro de validação Zod
    if (error instanceof ZodError) {
      const firstError = error.errors[0];
      return NextResponse.json(
        { 
          error: firstError.message,
          field: firstError.path.join('.'),
          errors: error.errors
        },
        { status: 400 }
      );
    }
    
    // Erro genérico
    console.error('Erro no cadastro:', error);
    return NextResponse.json(
      { error: 'Erro ao processar cadastro. Tente novamente.' },
      { status: 500 }
    );
  }
}

// Opção para verificar disponibilidade de CPF sem criar conta
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cpf = searchParams.get('cpf');

    const result: Record<string, boolean> = {};

    if (cpf) {
      result.cpfDisponivel = !(await cpfExists(cpf));
    }

    return NextResponse.json(result);

  } catch {
    return NextResponse.json(
      { error: 'Erro ao verificar disponibilidade' },
      { status: 500 }
    );
  }
}