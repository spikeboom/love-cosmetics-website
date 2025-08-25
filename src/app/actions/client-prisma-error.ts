// NOTA: Esta NÃO é uma Server Action de verdade
// É uma função que vai ser chamada no cliente para demonstrar o erro

import { prisma } from '@/lib/prisma'

export async function clientActionWithPrisma() {
  try {
    // ISTO VAI DAR ERRO! Tentando usar Prisma em uma função chamada do cliente
    const clientes = await prisma.cliente.findMany({
      select: {
        email: true,
        nome: true,
        sobrenome: true,
      },
      take: 5
    })
    
    return {
      success: true,
      data: clientes,
      count: clientes.length
    }
  } catch (error: any) {
    console.error('Erro esperado ao usar Prisma em client action:', error)
    return {
      success: false,
      error: error.message || 'Erro ao tentar usar Prisma em client action',
      details: {
        name: error.name,
        code: error.code,
        message: error.message
      }
    }
  }
}