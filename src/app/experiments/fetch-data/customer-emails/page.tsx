'use client'

import { useState, Suspense } from 'react'
import { getCustomerEmails, getCustomerEmailsProtected } from '@/experiments/fetch-data-methods/actions/get-customer-emails'
import ServerComponentEmails from '@/experiments/fetch-data-methods/components/ServerComponentEmails'
import ServerComponentEmailsProtected from '@/experiments/fetch-data-methods/components/ServerComponentEmailsProtected'
import ClientFormEmails from '@/experiments/fetch-data-methods/components/ClientFormEmails'
import ClientFormEmailsProtected from '@/experiments/fetch-data-methods/components/ClientFormEmailsProtected'
import ClientPrismaError from '@/experiments/fetch-data-methods/components/ClientPrismaError'
import ClientActionPrismaError from '@/experiments/fetch-data-methods/components/ClientActionPrismaError'

interface CustomerData {
  email: string
  nome: string
  sobrenome: string
}

interface ApiResponse {
  success: boolean
  count?: number
  data?: CustomerData[]
  error?: string
  authenticatedAs?: string
}

export default function CustomerEmailsPage() {
  const [loading, setLoading] = useState<string | null>(null)
  const [results, setResults] = useState<ApiResponse | null>(null)
  const [method, setMethod] = useState<string>('')
  const [showServerComponent, setShowServerComponent] = useState<string | null>(null)

  // Método 1: API Route Pública (Client → API)
  const fetchPublicAPI = async () => {
    setLoading('public-api')
    setMethod('Client Component → API Route Pública')
    setShowServerComponent(null)
    try {
      const response = await fetch('/api/experiments/fetch-data/emails-public')
      const data = await response.json()
      setResults(data)
    } catch (error) {
      setResults({ success: false, error: 'Erro ao buscar dados' })
    } finally {
      setLoading(null)
    }
  }

  // Método 2: API Route Protegida (Client → API)
  const fetchProtectedAPI = async () => {
    setLoading('protected-api')
    setMethod('Client Component → API Route Protegida')
    setShowServerComponent(null)
    try {
      const response = await fetch('/api/experiments/fetch-data/emails-protected')
      const data = await response.json()
      setResults(data)
    } catch (error) {
      setResults({ success: false, error: 'Erro ao buscar dados' })
    } finally {
      setLoading(null)
    }
  }

  // Método 3: Server Action Pública (Client → Server Action)
  const fetchServerAction = async () => {
    setLoading('server-action')
    setMethod('Client Component → Server Action Pública')
    setShowServerComponent(null)
    try {
      const data = await getCustomerEmails()
      setResults(data)
    } catch (error) {
      setResults({ success: false, error: 'Erro ao buscar dados' })
    } finally {
      setLoading(null)
    }
  }

  // Método 4: Server Action Protegida (Client → Server Action)
  const fetchServerActionProtected = async () => {
    setLoading('server-action-protected')
    setMethod('Client Component → Server Action Protegida')
    setShowServerComponent(null)
    try {
      const data = await getCustomerEmailsProtected()
      setResults(data)
    } catch (error) {
      setResults({ success: false, error: 'Erro ao buscar dados' })
    } finally {
      setLoading(null)
    }
  }

  // Método 5: Server Component (fetch direto)
  const showServerComp = () => {
    setShowServerComponent('server-component')
    setMethod('Server Component (fetch direto no servidor)')
    setResults(null)
    setLoading(null)
  }

  // Método 6: Server Component Protegido
  const showServerCompProtected = () => {
    setShowServerComponent('server-component-protected')
    setMethod('Server Component Protegido (fetch + auth no servidor)')
    setResults(null)
    setLoading(null)
  }

  // Método 7: Client Form → Server Action
  const showClientForm = () => {
    setShowServerComponent('client-form')
    setMethod('Client Form → Server Action')
    setResults(null)
    setLoading(null)
  }

  // Método 8: Client Form → Server Action Protegida
  const showClientFormProtected = () => {
    setShowServerComponent('client-form-protected')
    setMethod('Client Form → Server Action Protegida')
    setResults(null)
    setLoading(null)
  }

  // Método 9: Client + Prisma Direto (ERRO)
  const showClientPrismaError = () => {
    setShowServerComponent('client-prisma-error')
    setMethod('Client Component + Prisma Direto (ERRO DEMONSTRATIVO)')
    setResults(null)
    setLoading(null)
  }

  // Método 10: Client Action + Prisma (ERRO)
  const showClientActionPrismaError = () => {
    setShowServerComponent('client-action-prisma-error')
    setMethod('Client Action + Prisma (ERRO DEMONSTRATIVO)')
    setResults(null)
    setLoading(null)
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Lista de Emails de Clientes - 10 Métodos</h1>
      
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <h2 className="font-semibold mb-2">Server Components Verdadeiros:</h2>
        <div className="flex gap-4">
          <a 
            href="/experiments/fetch-data/customer-emails/server-component"
            className="text-blue-600 hover:underline"
          >
            → Server Component (async/await direto)
          </a>
          <a 
            href="/experiments/fetch-data/customer-emails/server-component-protected"
            className="text-blue-600 hover:underline"
          >
            → Server Component Protegido (async/await + auth)
          </a>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          * Server Components verdadeiros não podem ser renderizados dinamicamente, então criamos páginas separadas
        </p>
      </div>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Métodos Client → API */}
        <button
          onClick={fetchPublicAPI}
          disabled={loading === 'public-api'}
          className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-bold py-4 px-6 rounded-lg transition-colors"
        >
          {loading === 'public-api' ? 'Carregando...' : 'Client → API Pública'}
        </button>

        <button
          onClick={fetchProtectedAPI}
          disabled={loading === 'protected-api'}
          className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-bold py-4 px-6 rounded-lg transition-colors"
        >
          {loading === 'protected-api' ? 'Carregando...' : 'Client → API Protegida'}
        </button>

        {/* Métodos Client → Server Action */}
        <button
          onClick={fetchServerAction}
          disabled={loading === 'server-action'}
          className="bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 text-white font-bold py-4 px-6 rounded-lg transition-colors"
        >
          {loading === 'server-action' ? 'Carregando...' : 'Client → Server Action'}
        </button>

        <button
          onClick={fetchServerActionProtected}
          disabled={loading === 'server-action-protected'}
          className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white font-bold py-4 px-6 rounded-lg transition-colors"
        >
          {loading === 'server-action-protected' ? 'Carregando...' : 'Client → Server Action Protegida'}
        </button>

        {/* Métodos Server Component */}
        <button
          onClick={showServerComp}
          className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-4 px-6 rounded-lg transition-colors"
        >
          Server Component
        </button>

        <button
          onClick={showServerCompProtected}
          className="bg-pink-500 hover:bg-pink-600 text-white font-bold py-4 px-6 rounded-lg transition-colors"
        >
          Server Component Protegido
        </button>

        {/* Métodos Client Form → Server Action */}
        <button
          onClick={showClientForm}
          className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-4 px-6 rounded-lg transition-colors"
        >
          Client Form → Server Action
        </button>

        <button
          onClick={showClientFormProtected}
          className="bg-red-500 hover:bg-red-600 text-white font-bold py-4 px-6 rounded-lg transition-colors"
        >
          Client Form → Server Action Protegida
        </button>

        {/* Métodos de Erro - para demonstrar o que NÃO funciona */}
        <button
          onClick={showClientPrismaError}
          className="bg-red-800 hover:bg-red-900 text-white font-bold py-4 px-6 rounded-lg transition-colors"
        >
          💥 Client + Prisma Direto
        </button>

        <button
          onClick={showClientActionPrismaError}
          className="bg-orange-800 hover:bg-orange-900 text-white font-bold py-4 px-6 rounded-lg transition-colors"
        >
          💥 Client Action + Prisma
        </button>
      </div>

      <div className="mb-4 p-3 bg-red-50 rounded-lg border border-red-200">
        <p className="text-red-700 text-sm">
          <strong>💥 Botões com erro:</strong> Os últimos 2 botões são para demonstrar erros comuns - eles vão falhar propositalmente para mostrar por que certas abordagens não funcionam.
        </p>
      </div>

      {method && (
        <div className="mb-4 p-4 bg-gray-100 rounded-lg">
          <span className="font-semibold">Método usado:</span> {method}
        </div>
      )}

      {/* Resultados dos métodos Client → API/Server Action */}
      {results && (
        <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
          {results.success ? (
            <>
              <div className="mb-4 space-y-2">
                <p className="text-green-600 font-semibold">✓ Sucesso!</p>
                <p>Total de clientes: {results.count}</p>
                {results.authenticatedAs && (
                  <p className="text-blue-600">Autenticado como: {results.authenticatedAs}</p>
                )}
              </div>
              
              {results.data && results.data.length > 0 ? (
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
                      {results.data.map((cliente, index) => (
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
              <p>{results.error || 'Erro desconhecido'}</p>
            </div>
          )}
        </div>
      )}

      {/* Resultados dos Server Components */}
      {showServerComponent === 'server-component' && (
        <Suspense fallback={<div className="bg-white shadow-lg rounded-lg p-6"><p>Carregando Server Component...</p></div>}>
          <ServerComponentEmails />
        </Suspense>
      )}

      {showServerComponent === 'server-component-protected' && (
        <Suspense fallback={<div className="bg-white shadow-lg rounded-lg p-6"><p>Carregando Server Component Protegido...</p></div>}>
          <ServerComponentEmailsProtected />
        </Suspense>
      )}

      {showServerComponent === 'client-form' && (
        <ClientFormEmails />
      )}

      {showServerComponent === 'client-form-protected' && (
        <ClientFormEmailsProtected />
      )}

      {showServerComponent === 'client-prisma-error' && (
        <ClientPrismaError />
      )}

      {showServerComponent === 'client-action-prisma-error' && (
        <ClientActionPrismaError />
      )}
    </div>
  )
}