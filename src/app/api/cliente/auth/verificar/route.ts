import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/cliente/auth';
import { getClientePedidos, getClienteCupons } from '@/lib/cliente/session';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Verificar sessão atual
    const session = await getCurrentSession();
    
    if (!session) {
      return NextResponse.json(
        { 
          authenticated: false,
          message: 'Não autenticado'
        },
        { status: 401 }
      );
    }
    
    // Buscar dados completos do cliente
    const cliente = await prisma.cliente.findUnique({
      where: { id: session.id },
      select: {
        id: true,
        email: true,
        nome: true,
        sobrenome: true,
        cpf: true,
        telefone: true,
        dataNascimento: true,
        emailVerificado: true,
        cep: true,
        endereco: true,
        numero: true,
        complemento: true,
        bairro: true,
        cidade: true,
        estado: true,
        receberWhatsapp: true,
        receberEmail: true,
        createdAt: true,
      }
    });
    
    if (!cliente) {
      return NextResponse.json(
        { 
          authenticated: false,
          message: 'Cliente não encontrado'
        },
        { status: 404 }
      );
    }
    
    // Buscar estatísticas do cliente (opcional)
    const { searchParams } = new URL(request.url);
    const includeStats = searchParams.get('stats') === 'true';
    
    let stats = null;
    if (includeStats) {
      const [pedidos, cupons] = await Promise.all([
        getClientePedidos(cliente.id, 5),
        getClienteCupons(cliente.id)
      ]);
      
      stats = {
        totalPedidos: pedidos.length,
        ultimoPedido: pedidos[0]?.pedido.createdAt || null,
        totalCuponsUsados: cupons.length,
        totalEconomizado: cupons.reduce((acc, c) => acc + c.valorDesconto, 0)
      };
    }
    
    return NextResponse.json({
      authenticated: true,
      cliente: {
        ...cliente,
        // Organizar endereço se existir
        endereco: cliente.cep ? {
          cep: cliente.cep,
          endereco: cliente.endereco,
          numero: cliente.numero,
          complemento: cliente.complemento,
          bairro: cliente.bairro,
          cidade: cliente.cidade,
          estado: cliente.estado,
        } : null,
      },
      stats
    });
    
  } catch (error) {
    console.error('Erro ao verificar sessão:', error);
    return NextResponse.json(
      { 
        authenticated: false,
        error: 'Erro ao verificar sessão'
      },
      { status: 500 }
    );
  }
}