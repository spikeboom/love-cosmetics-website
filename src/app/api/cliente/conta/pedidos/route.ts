import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/cliente/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação
    const session = await getCurrentSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Parâmetros de consulta
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    // Buscar pedidos do cliente
    
    const pedidos = await prisma.pedidoCliente.findMany({
      where: {
        clienteId: session.id
      },
      include: {
        pedido: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip: offset,
      take: limit
    });
    

    // Contar total de pedidos
    const totalPedidos = await prisma.pedidoCliente.count({
      where: {
        clienteId: session.id
      }
    });
    

    // Buscar informações de pagamento para cada pedido
    const pedidosFormatados = await Promise.all(
      pedidos.map(async (pedidoCliente) => {
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
        
        // Determinar status do pedido baseado no pagamento mais recente
        let status = 'Pendente';
        let statusColor = 'orange';
        
        if (pagamentos && pagamentos.length > 0) {
          const ultimoPagamento = pagamentos[0];
          const charge = ultimoPagamento?.info?.charges?.[0];
          
          if (charge?.status === 'PAID') {
            status = 'Pago';
            statusColor = 'green';
          } else if (charge?.status === 'IN_ANALYSIS') {
            status = 'Em Análise';
            statusColor = 'blue';
          } else if (charge?.status === 'DECLINED' || charge?.status === 'CANCELED') {
            status = 'Cancelado';
            statusColor = 'red';
          }
        }

        return {
          id: pedido.id,
          total: pedido.total_pedido,
          status,
          statusColor,
          items: pedido.items || [],
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
      })
    );

    return NextResponse.json({
      pedidos: pedidosFormatados,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalPedidos / limit),
        totalItems: totalPedidos,
        hasNext: offset + limit < totalPedidos,
        hasPrevious: page > 1
      }
    });

  } catch (error) {
    console.error('Erro ao buscar pedidos:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}