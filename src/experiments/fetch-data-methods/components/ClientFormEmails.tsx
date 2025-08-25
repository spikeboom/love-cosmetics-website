'use client'

import { useState, useTransition } from 'react'
import { getCustomerEmails } from '@/experiments/fetch-data-methods/actions/get-customer-emails'

interface CustomerData {
  email: string
  nome: string
  sobrenome: string
}

interface FormState {
  success: boolean
  count?: number
  data?: CustomerData[]
  error?: string
}

export default function ClientFormEmails() {
  const [state, setState] = useState<FormState | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleSubmit = () => {
    startTransition(() => {
      getCustomerEmails()
        .then(result => setState(result))
        .catch(() => setState({ 
          success: false, 
          error: 'Erro ao buscar dados' 
        }))
    })
  }

  return (
    <div>
      <button
        onClick={handleSubmit}
        disabled={isPending}
        className="bg-teal-500 hover:bg-teal-600 disabled:bg-gray-400 text-white font-bold py-4 px-6 rounded-lg transition-colors w-full"
      >
        {isPending ? 'Carregando...' : 'Client → Server Action (Form)'}
      </button>
      
      {state && (
        <div className="bg-white shadow-lg rounded-lg p-6 mt-4">
          {state.success ? (
            <>
              <div className="mb-4 space-y-2">
                <p className="text-green-600 font-semibold">✓ Client Form → Server Action</p>
                <p>Total de clientes: {state.count}</p>
              </div>
              
              {state.data && state.data.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full table-auto">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Nome
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {state.data.map((cliente, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {cliente.nome} {cliente.sobrenome}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {cliente.email}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500">Nenhum cliente encontrado.</p>
              )}
            </>
          ) : (
            <div className="text-red-600">
              <p className="font-semibold">✗ Erro</p>
              <p>{state.error || 'Erro desconhecido'}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}