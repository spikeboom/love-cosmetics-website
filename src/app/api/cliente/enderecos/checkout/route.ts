import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verificarAutenticacao } from '@/lib/cliente/auth';

// GET - Buscar endereços para o checkout (formato simplificado)
export async function GET(request: NextRequest) {
  try {
    const cliente = await verificarAutenticacao(request);
    if (!cliente) {
      return NextResponse.json({ enderecos: [] });
    }

    const enderecos = await prisma.enderecoCliente.findMany({
      where: {
        clienteId: cliente.id,
        ativo: true
      },
      select: {
        id: true,
        apelido: true,
        principal: true,
        cep: true,
        logradouro: true,
        numero: true,
        complemento: true,
        bairro: true,
        cidade: true,
        estado: true,
        nomeDestinatario: true,
        telefone: true
      },
      orderBy: [
        { principal: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    // Transformar para formato compatível com o checkout
    const enderecosFormatados = enderecos.map(endereco => ({
      id: endereco.id,
      apelido: endereco.apelido,
      principal: endereco.principal,
      cep: endereco.cep,
      endereco: endereco.logradouro,
      numero: endereco.numero,
      complemento: endereco.complemento || '',
      bairro: endereco.bairro,
      cidade: endereco.cidade,
      estado: endereco.estado,
      destinatario: endereco.nomeDestinatario || '',
      telefone: endereco.telefone || ''
    }));

    return NextResponse.json({
      enderecos: enderecosFormatados,
      enderecoPrincipal: enderecosFormatados.find(e => e.principal) || enderecosFormatados[0] || null
    });
  } catch (error) {
    console.error('Erro ao buscar endereços para checkout:', error);
    return NextResponse.json({ enderecos: [] }, { status: 500 });
  }
}