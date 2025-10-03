'use client'

import { useState } from 'react'
import { clientActionWithPrisma } from '@/experiments/fetch-data-methods/actions/client-prisma-error'

export default function ClientActionPrismaError() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const tryClientActionPrisma = async () => {
    setLoading(true)
    setResult(null)

    try {
      // Chamando função que tenta usar Prisma (vai dar erro)
      const response = await clientActionWithPrisma()
      setResult(response)
    } catch (err: any) {
      setResult({
        success: false,
        error: 'Erro na chamada da função',
        details: err.message
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <button
        onClick={tryClientActionPrisma}
        disabled={loading}
        className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white font-bold py-4 px-6 rounded-lg transition-colors w-full"
      >
        {loading ? 'Tentando...' : '💥 Client Action + Prisma (VAI DAR ERRO)'}
      </button>

      {result && (
        <div className="bg-white shadow-lg rounded-lg p-6 mt-4">
          {result.success ? (
            <div className="text-green-600">
              <p className="font-semibold">✓ Funcionou?!</p>
              <p>Isso seria estranho... Client Action com Prisma funcionando</p>
              <p>Total: {result.count}</p>
            </div>
          ) : (
            <div className="text-red-600">
              <p className="font-semibold">✗ Erro Esperado!</p>
              <p className="text-sm mb-2">Client Action não pode usar Prisma:</p>
              <pre className="bg-red-50 p-2 rounded text-xs overflow-auto max-h-32">
                {JSON.stringify(result, null, 2)}
              </pre>
              <div className="mt-4 text-sm">
                <p className="font-semibold">Por que deu erro:</p>
                <ul className="list-disc list-inside space-y-1 mt-2">
                  <li>Função executada no contexto do cliente</li>
                  <li>Sem acesso às variáveis de ambiente do servidor</li>
                  <li>Sem conexão com banco de dados</li>
                  <li>Prisma Client não disponível no browser</li>
                  <li>Diferentes de Server Actions (que usam 'use server')</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}