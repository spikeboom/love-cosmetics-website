import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Buscar dados do pedido para exibição na tela de sucesso
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'ID do pedido é obrigatório' },
        { status: 400 }
      );
    }

    // Buscar o pedido completo
    const pedido = await prisma.pedido.findUnique({
      where: { id },
      select: {
        id: true,
        nome: true,
        sobrenome: true,
        email: true,
        telefone: true,
        cpf: true,
        endereco: true,
        numero: true,
        complemento: true,
        bairro: true,
        cidade: true,
        estado: true,
        cep: true,
        items: true,
        total_pedido: true,
        descontos: true,
        frete_calculado: true,
        transportadora_nome: true,
        transportadora_servico: true,
        transportadora_prazo: true,
        status_pagamento: true,
        status_entrega: true,
        payment_method: true,
        createdAt: true,
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

    // Calcular subtotal dos produtos (sem frete e sem descontos)
    const subtotalProdutos = pedido.items.reduce((acc: number, item: unknown) => {
      const typedItem = item as { quantity?: number; preco?: number; unit_amount?: number; price?: number };
      const quantidade = typedItem.quantity || 1;
      // Tentar diferentes campos de preço: preco, unit_amount, price
      const preco = typedItem.preco || typedItem.unit_amount || typedItem.price || 0;
      return acc + (preco * quantidade);
    }, 0);

    // Formatar endereço completo
    const enderecoCompleto = [
      pedido.endereco,
      pedido.numero,
      pedido.complemento,
      pedido.bairro
    ].filter(Boolean).join(', ');

    // Extrair nomes dos produtos
    const produtosNomes = pedido.items.map((item: unknown) => {
      const typedItem = item as { name?: string; productName?: string; title?: string; quantity?: number };
      const nome = typedItem.name || typedItem.productName || typedItem.title || 'Produto';
      const quantidade = typedItem.quantity || 1;
      return quantidade > 1 ? `${nome} (x${quantidade})` : nome;
    });

    return NextResponse.json({
      id: pedido.id,
      cliente: {
        nome: pedido.nome,
        sobrenome: pedido.sobrenome,
        email: pedido.email,
        telefone: pedido.telefone,
        cpf: pedido.cpf.replace(/(\d{3})\d{3}\d{3}(\d{2})/, '$1.***.***-$2'),
      },
      endereco: {
        completo: enderecoCompleto,
        cidade: pedido.cidade,
        estado: pedido.estado,
        cep: pedido.cep,
      },
      produtos: {
        nomes: produtosNomes,
        subtotal: subtotalProdutos,
      },
      entrega: {
        transportadora: pedido.transportadora_nome,
        servico: pedido.transportadora_servico,
        prazo: pedido.transportadora_prazo,
        valor: pedido.frete_calculado,
        gratis: pedido.frete_calculado === 0,
      },
      descontos: pedido.descontos,
      total: pedido.total_pedido,
      status: {
        pagamento: pedido.status_pagamento,
        entrega: pedido.status_entrega,
      },
      metodoPagamento: pedido.payment_method,
      vinculado: !!pedido.pedidoCliente,
      criadoEm: pedido.createdAt,
    });

  } catch (error) {
    console.error('Erro ao buscar pedido:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar dados do pedido' },
      { status: 500 }
    );
  }
}
