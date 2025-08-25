'use server'

import { prisma } from '@/lib/prisma'
import { verifySession } from '@/lib/cliente/auth'
import { cookies } from 'next/headers'

export async function getCustomerEmails() {
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

    return {
      success: true,
      count: clientes.length,
      data: clientes
    }
  } catch (error) {
    console.error('Erro ao buscar emails (server action):', error)
    return { 
      success: false, 
      error: 'Erro ao buscar emails' 
    }
  }
}

export async function getCustomerEmailsProtected() {
  try {
    // Verificar autenticação
    const cookieStore = await cookies()
    const token = cookieStore.get('cliente_token')?.value

    if (!token) {
      return {
        success: false,
        error: 'Token não encontrado. Faça login primeiro.'
      }
    }

    const cliente = await verifySession(token)
    
    if (!cliente) {
      return {
        success: false,
        error: 'Token inválido ou expirado'
      }
    }

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

    return {
      success: true,
      authenticatedAs: cliente.email,
      count: clientes.length,
      data: clientes
    }
  } catch (error) {
    console.error('Erro ao buscar emails protegido (server action):', error)
    return { 
      success: false, 
      error: 'Erro ao buscar emails' 
    }
  }
}