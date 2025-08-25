'use client'

import { useState, useEffect } from 'react'

interface CustomerData {
  email: string
  nome: string
  sobrenome: string
}

export default function ServerComponentEmails() {
  const [data, setData] = useState<CustomerData[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/customers/emails-public')
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          setData(result.data)
        } else {
          setError(result.error)
        }
      })
      .catch(() => setError('Erro ao buscar dados'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="bg-white shadow-lg rounded-lg p-6">
        <p>Carregando dados simulando Server Component...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white shadow-lg rounded-lg p-6">
        <div className="text-red-600">
          <p className="font-semibold">✗ Erro simulando Server Component</p>
          <p>{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white shadow-lg rounded-lg p-6">
      <div className="mb-4 space-y-2">
        <p className="text-green-600 font-semibold">✓ Simulando Server Component</p>
        <p>Total de clientes: {data?.length || 0}</p>
        <p className="text-amber-600 text-sm">* Convertido para Client Component (Server Components não podem ser renderizados dinamicamente)</p>
      </div>
      
      {data && data.length > 0 ? (
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
              {data.map((cliente, index) => (
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
    </div>
  )
}