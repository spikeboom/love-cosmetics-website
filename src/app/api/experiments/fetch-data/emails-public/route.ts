import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
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
      count: clientes.length,
      data: clientes
    })
  } catch (error) {
    console.error('Erro ao buscar emails (público):', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro ao buscar emails' 
      },
      { status: 500 }
    )
  }
}