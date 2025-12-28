import { NextRequest, NextResponse } from 'next/server';
import { cadastroPosCheckoutSchema } from '@/lib/cliente/validation';
import { hashPassword, createSession, setSessionCookie } from '@/lib/cliente/auth';
import { cpfExists, emailExists, createCliente, vincularPedidoCliente } from '@/lib/cliente/session';
import { prisma } from '@/lib/prisma';
import { ZodError } from 'zod';

export async function POST(request: NextRequest) {
  try {
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Body da requisição inválido ou vazio' },
        { status: 400 }
      );
    }

    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Dados da requisição são obrigatórios' },
        { status: 400 }
      );
    }

    // Validar dados com Zod
    const validatedData = cadastroPosCheckoutSchema.parse(body);

    // Buscar o pedido
    const pedido = await prisma.pedido.findUnique({
      where: { id: validatedData.pedidoId },
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

    // Verificar se o pedido já está vinculado a um cliente
    if (pedido.pedidoCliente) {
      return NextResponse.json(
        { error: 'Este pedido já está vinculado a uma conta' },
        { status: 400 }
      );
    }

    // Verificar se CPF já existe
    if (await cpfExists(pedido.cpf)) {
      return NextResponse.json(
        {
          error: 'CPF já cadastrado. Faça login com sua senha.',
          cpfExistente: true
        },
        { status: 400 }
      );
    }

    // Verificar se email já existe
    if (await emailExists(pedido.email)) {
      return NextResponse.json(
        {
          error: 'Email já cadastrado. Faça login com sua senha.',
          emailExistente: true
        },
        { status: 400 }
      );
    }

    // Separar nome e sobrenome
    const nomeCompleto = pedido.nome;
    const sobrenome = pedido.sobrenome;

    // Hash da senha
    const passwordHash = await hashPassword(validatedData.password);

    // Criar cliente no banco com dados do pedido
    const cliente = await createCliente({
      email: pedido.email,
      nome: nomeCompleto || '',
      sobrenome: sobrenome || '',
      passwordHash,
      cpf: pedido.cpf,
      telefone: pedido.telefone,
      data_nascimento: pedido.data_nascimento
        ? `${pedido.data_nascimento.getDate().toString().padStart(2, '0')}/${(pedido.data_nascimento.getMonth() + 1).toString().padStart(2, '0')}/${pedido.data_nascimento.getFullYear()}`
        : undefined,
      receberWhatsapp: validatedData.receberComunicacoes,
      receberEmail: validatedData.receberComunicacoes,
      // Dados de endereço
      cep: pedido.cep || undefined,
      endereco: pedido.endereco || undefined,
      numero: pedido.numero || undefined,
      complemento: pedido.complemento || undefined,
      bairro: pedido.bairro || undefined,
      cidade: pedido.cidade || undefined,
      estado: pedido.estado || undefined,
    });

    // Vincular pedido ao cliente
    await vincularPedidoCliente(pedido.id, cliente.id);

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

    // Retornar sucesso com dados do cliente
    return NextResponse.json({
      success: true,
      cliente: {
        id: cliente.id,
        email: cliente.email,
        nome: cliente.nome,
        sobrenome: cliente.sobrenome,
        cpf: cliente.cpf,
      },
      message: 'Conta criada com sucesso!'
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
    console.error('Erro no cadastro pós-checkout:', error);
    return NextResponse.json(
      { error: 'Erro ao criar conta. Tente novamente.' },
      { status: 500 }
    );
  }
}

// GET - Verificar status do CPF do pedido (se já tem conta ou não)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pedidoId = searchParams.get('pedidoId');

    if (!pedidoId) {
      return NextResponse.json(
        { error: 'ID do pedido é obrigatório' },
        { status: 400 }
      );
    }

    // Buscar o pedido
    const pedido = await prisma.pedido.findUnique({
      where: { id: pedidoId },
      select: {
        id: true,
        cpf: true,
        nome: true,
        email: true,
        status_pagamento: true,
        pedidoCliente: {
          select: {
            clienteId: true
          }
        }
      }
    });

    if (!pedido) {
      return NextResponse.json(
        { error: 'Pedido não encontrado' },
        { status: 404 }
      );
    }

    // Verificar se pedido já está vinculado
    if (pedido.pedidoCliente) {
      return NextResponse.json({
        pedidoVinculado: true,
        message: 'Pedido já está vinculado a uma conta'
      });
    }

    // Verificar se CPF ou email já tem conta
    const cpfCadastrado = await cpfExists(pedido.cpf);
    const emailCadastrado = await emailExists(pedido.email);

    // Se CPF ou email já existem, o usuário deve fazer login
    const contaExistente = cpfCadastrado || emailCadastrado;

    return NextResponse.json({
      pedidoVinculado: false,
      cpfCadastrado: contaExistente, // true se CPF ou email já existe
      cpf: pedido.cpf, // CPF completo para fazer login
      cpfMascarado: pedido.cpf.replace(/(\d{3})\d{3}\d{3}(\d{2})/, '$1.***.***-$2'),
      nome: pedido.nome,
      email: pedido.email,
      statusPagamento: pedido.status_pagamento
    });

  } catch (error) {
    console.error('Erro ao verificar status:', error);
    return NextResponse.json(
      { error: 'Erro ao verificar status' },
      { status: 500 }
    );
  }
}
