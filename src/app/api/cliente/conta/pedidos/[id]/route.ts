import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/cliente/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // SEGURANÇA: Verificar se o cliente está autenticado
    // Retorna 401 se não houver sessão válida
    const session = await getCurrentSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const { id: pedidoId } = await params;

    // SEGURANÇA: Verificar se o pedido pertence ao cliente logado
    // A query busca na tabela pedidoCliente que vincula pedidos a clientes
    // Só retorna se AMBOS pedidoId E clienteId (da sessão) coincidirem
    // Isso impede que um cliente acesse pedidos de outro cliente
    const pedidoCliente = await prisma.pedidoCliente.findFirst({
      where: {
        pedidoId,
        clienteId: session.id // Garante que só retorna pedidos do cliente logado
      },
      include: {
        pedido: {
          include: {
            historicoStatusEntrega: {
              orderBy: {
                createdAt: 'asc'
              }
            }
          }
        }
      }
    });

    // Se não encontrou, ou o pedido não existe ou não pertence ao cliente
    // Retorna 404 em ambos os casos para não vazar informação
    if (!pedidoCliente) {
      return NextResponse.json(
        { error: 'Pedido não encontrado' },
        { status: 404 }
      );
    }

    const pedido = pedidoCliente.pedido;

    // Buscar pagamentos para este pedido
    const pagamentos = await prisma.statusPagamento.findMany({
      where: {
        info: {
          path: ['reference_id'],
          equals: pedido.id
        }
      },
      orderBy: {
        id: 'desc'
      }
    });

    // Determinar status do pagamento
    let status = 'Pendente';
    if (pagamentos && pagamentos.length > 0) {
      const ultimoPagamento = pagamentos[0];
      const paymentInfo = ultimoPagamento?.info as Record<string, unknown>;
      const charges = paymentInfo?.charges as Array<{ status: string }> | undefined;
      const charge = charges?.[0];

      if (charge?.status === 'PAID') {
        status = 'Pago';
      } else if (charge?.status === 'IN_ANALYSIS') {
        status = 'Em Análise';
      } else if (charge?.status === 'DECLINED' || charge?.status === 'CANCELED') {
        status = 'Cancelado';
      }
    }

    // Formatar itens
    const items = (pedido.items || []) as Array<{
      name?: string;
      image_url?: string;
      quantity?: number;
      preco?: number;
      unit_amount?: number;
    }>;

    const itemsFormatados = items.map((item) => ({
      name: item.name || 'Produto',
      image_url: item.image_url || '',
      quantity: item.quantity || 1,
      preco: item.preco || item.unit_amount || 0,
    }));

    // Formatar histórico de status
    const historicoStatus = pedido.historicoStatusEntrega.map((h) => ({
      status: h.statusNovo,
      data: h.createdAt,
      observacao: h.observacao,
    }));

    // Adicionar status inicial se não existir
    if (!historicoStatus.find(h => h.status === 'PEDIDO_REALIZADO')) {
      historicoStatus.unshift({
        status: 'PEDIDO_REALIZADO',
        data: pedido.createdAt,
        observacao: null,
      });
    }

    // Adicionar pagamento confirmado se pago
    if (status === 'Pago' && !historicoStatus.find(h => h.status === 'PAGAMENTO_CONFIRMADO')) {
      const dataIndex = historicoStatus.findIndex(h => h.status === 'PEDIDO_REALIZADO');
      historicoStatus.splice(dataIndex + 1, 0, {
        status: 'PAGAMENTO_CONFIRMADO',
        data: pedido.createdAt,
        observacao: null,
      });
    }

    const pedidoFormatado = {
      id: pedido.id,
      total: pedido.total_pedido,
      frete: pedido.frete_calculado,
      status,
      statusEntrega: pedido.status_entrega,
      historicoStatus,
      items: itemsFormatados,
      cupons: pedido.cupons || [],
      createdAt: pedido.createdAt,
      endereco: {
        cep: pedido.cep,
        endereco: pedido.endereco,
        numero: pedido.numero,
        complemento: pedido.complemento,
        bairro: pedido.bairro,
        cidade: pedido.cidade,
        estado: pedido.estado
      },
      pagamentos: pagamentos || []
    };

    return NextResponse.json({
      pedido: pedidoFormatado
    });

  } catch (error) {
    console.error('Erro ao buscar detalhes do pedido:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
