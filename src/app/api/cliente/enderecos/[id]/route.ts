import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verificarAutenticacao } from '@/lib/cliente/auth';
import { z } from 'zod';

const enderecoUpdateSchema = z.object({
  apelido: z.string().min(1, 'Apelido é obrigatório').optional(),
  cep: z.string().regex(/^\d{5}-?\d{3}$/, 'CEP inválido').optional(),
  logradouro: z.string().min(1, 'Logradouro é obrigatório').optional(),
  numero: z.string().min(1, 'Número é obrigatório').optional(),
  complemento: z.string().nullable().optional(),
  bairro: z.string().min(1, 'Bairro é obrigatório').optional(),
  cidade: z.string().min(1, 'Cidade é obrigatória').optional(),
  estado: z.string().length(2, 'Estado deve ter 2 caracteres').optional(),
  pais: z.string().optional(),
  nomeDestinatario: z.string().nullable().optional(),
  telefone: z.string().nullable().optional(),
  principal: z.boolean().optional()
});

// GET - Buscar endereço específico
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cliente = await verificarAutenticacao(request);
    if (!cliente) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const endereco = await prisma.enderecoCliente.findFirst({
      where: {
        id,
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

    return NextResponse.json(endereco);
  } catch (error) {
    console.error('Erro ao buscar endereço:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar endereço' },
      { status: 500 }
    );
  }
}

// PUT - Atualizar endereço
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cliente = await verificarAutenticacao(request);
    if (!cliente) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const { id } = await params;
    
    // Verificar se o endereço pertence ao cliente
    const enderecoExistente = await prisma.enderecoCliente.findFirst({
      where: {
        id,
        clienteId: cliente.id,
        ativo: true
      }
    });

    if (!enderecoExistente) {
      return NextResponse.json(
        { error: 'Endereço não encontrado' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validatedData = enderecoUpdateSchema.parse(body);

    // Se este endereço será o principal, desmarcar outros
    if (validatedData.principal === true) {
      await prisma.enderecoCliente.updateMany({
        where: {
          clienteId: cliente.id,
          principal: true,
          id: { not: id }
        },
        data: {
          principal: false
        }
      });
    }

    const endereco = await prisma.enderecoCliente.update({
      where: { id },
      data: validatedData
    });

    return NextResponse.json(endereco);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Erro ao atualizar endereço:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar endereço' },
      { status: 500 }
    );
  }
}

// DELETE - Remover endereço (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cliente = await verificarAutenticacao(request);
    if (!cliente) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Verificar se o endereço pertence ao cliente
    const endereco = await prisma.enderecoCliente.findFirst({
      where: {
        id,
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

    // Soft delete - apenas marcar como inativo
    await prisma.enderecoCliente.update({
      where: { id },
      data: { ativo: false }
    });

    // Se era o endereço principal, marcar outro como principal
    if (endereco.principal) {
      const outroEndereco = await prisma.enderecoCliente.findFirst({
        where: {
          clienteId: cliente.id,
          ativo: true,
          id: { not: id }
        },
        orderBy: { createdAt: 'desc' }
      });

      if (outroEndereco) {
        await prisma.enderecoCliente.update({
          where: { id: outroEndereco.id },
          data: { principal: true }
        });
      }
    }

    return NextResponse.json({ message: 'Endereço removido com sucesso' });
  } catch (error) {
    console.error('Erro ao remover endereço:', error);
    return NextResponse.json(
      { error: 'Erro ao remover endereço' },
      { status: 500 }
    );
  }
}