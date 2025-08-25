'use client'

import { useState } from 'react'
import { prisma } from '@/lib/prisma'

export default function ClientPrismaError() {
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const tryPrismaInClient = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      // ISTO VAI DAR ERRO! Client Component tentando usar Prisma
      const clientes = await prisma.cliente.findMany({
        select: {
          email: true,
          nome: true,
          sobrenome: true,
        },
        take: 5
      })
      
      setResult(clientes)
    } catch (err: any) {
      console.error('Erro esperado ao usar Prisma no cliente:', err)
      setError(err.message || 'Erro ao tentar usar Prisma no cliente')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <button
        onClick={tryPrismaInClient}
        disabled={loading}
        className="bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white font-bold py-4 px-6 rounded-lg transition-colors w-full"
      >
        {loading ? 'Tentando...' : '💥 Client + Prisma Direto (VAI DAR ERRO)'}
      </button>

      {(result || error) && (
        <div className="bg-white shadow-lg rounded-lg p-6 mt-4">
          {error ? (
            <div className="text-red-600">
              <p className="font-semibold">✗ Erro Esperado!</p>
              <p className="text-sm mb-2">Client Components não podem usar Prisma diretamente:</p>
              <pre className="bg-red-50 p-2 rounded text-xs overflow-auto">
                {error}
              </pre>
              <div className="mt-4 text-sm">
                <p className="font-semibold">Por que deu erro:</p>
                <ul className="list-disc list-inside space-y-1 mt-2">
                  <li>Prisma precisa de conexão com banco de dados</li>
                  <li>Client Components executam no browser</li>
                  <li>Browser não tem acesso ao banco de dados</li>
                  <li>Variáveis de ambiente do servidor não estão disponíveis</li>
                  <li>Prisma Client não funciona no ambiente do browser</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="text-green-600">
              <p className="font-semibold">✓ Funcionou?!</p>
              <p>Isso seria muito estranho... 🤔</p>
              <pre className="bg-gray-100 p-2 rounded text-xs">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  )
}