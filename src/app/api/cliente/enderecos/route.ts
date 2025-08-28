import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verificarAutenticacao } from '@/lib/cliente/auth';
import { z } from 'zod';

const enderecoSchema = z.object({
  apelido: z.string().min(1, 'Apelido é obrigatório'),
  cep: z.string().regex(/^\d{5}-?\d{3}$/, 'CEP inválido'),
  logradouro: z.string().min(1, 'Logradouro é obrigatório'),
  numero: z.string().min(1, 'Número é obrigatório'),
  complemento: z.string().nullable().optional(),
  bairro: z.string().min(1, 'Bairro é obrigatório'),
  cidade: z.string().min(1, 'Cidade é obrigatória'),
  estado: z.string().length(2, 'Estado deve ter 2 caracteres'),
  pais: z.string().default('Brasil'),
  nomeDestinatario: z.string().nullable().optional(),
  telefone: z.string().nullable().optional(),
  principal: z.boolean().optional()
});

// GET - Listar endereços do cliente
export async function GET(request: NextRequest) {
  try {
    const cliente = await verificarAutenticacao(request);
    if (!cliente) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const enderecos = await prisma.enderecoCliente.findMany({
      where: {
        clienteId: cliente.id,
        ativo: true
      },
      orderBy: [
        { principal: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    return NextResponse.json(enderecos);
  } catch (error) {
    console.error('Erro ao buscar endereços:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar endereços' },
      { status: 500 }
    );
  }
}

// POST - Criar novo endereço
export async function POST(request: NextRequest) {
  try {
    const cliente = await verificarAutenticacao(request);
    if (!cliente) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = enderecoSchema.parse(body);

    // Se este endereço será o principal, desmarcar outros
    if (validatedData.principal) {
      await prisma.enderecoCliente.updateMany({
        where: {
          clienteId: cliente.id,
          principal: true
        },
        data: {
          principal: false
        }
      });
    }

    // Se não houver nenhum endereço, este será o principal
    const totalEnderecos = await prisma.enderecoCliente.count({
      where: {
        clienteId: cliente.id,
        ativo: true
      }
    });

    const endereco = await prisma.enderecoCliente.create({
      data: {
        ...validatedData,
        clienteId: cliente.id,
        principal: validatedData.principal || totalEnderecos === 0
      }
    });

    return NextResponse.json(endereco, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Erro ao criar endereço:', error);
    return NextResponse.json(
      { error: 'Erro ao criar endereço' },
      { status: 500 }
    );
  }
}