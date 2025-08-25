import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifySession } from '@/lib/cliente/auth'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    // Verificar autenticação
    const cookieStore = await cookies()
    const token = cookieStore.get('cliente_token')?.value

    if (!token) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Token não encontrado. Faça login primeiro.' 
        },
        { status: 401 }
      )
    }

    const cliente = await verifySession(token)
    
    if (!cliente) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Token inválido ou expirado' 
        },
        { status: 401 }
      )
    }

    // Buscar emails se autenticado
    const clientes = await prisma.cliente.findMany({
      select: {
        email: true,
        nome: true,
        sobrenome: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      authenticatedAs: cliente.email,
      count: clientes.length,
      data: clientes
    })
  } catch (error) {
    console.error('Erro ao buscar emails (protegido):', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro ao buscar emails' 
      },
      { status: 500 }
    )
  }
}