import { prisma } from '@/lib/prisma'
import { getCurrentSession } from '@/lib/cliente/auth'
import Link from 'next/link'

export default async function ServerComponentProtectedPage() {
  // Verificar autenticação no servidor
  const cliente = await getCurrentSession()
  
  if (!cliente) {
    return (
      <div className="container mx-auto p-8">
        <div className="mb-4">
          <Link 
            href="/admin/customer-emails" 
            className="text-blue-500 hover:underline"
          >
            ← Voltar para comparação dos 8 métodos
          </Link>
        </div>

        <h1 className="text-3xl font-bold mb-8">Server Component Protegido</h1>
        
        <div className="bg-white shadow-lg rounded-lg p-6">
          <div className="text-red-600">
            <p className="font-semibold">✗ Não Autenticado</p>
            <p>Faça login para acessar os dados protegidos via Server Component</p>
          </div>
        </div>

        <div className="mt-8 p-4 bg-gray-100 rounded-lg">
          <h3 className="font-semibold mb-2">Autenticação no Server Component:</h3>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Verificação de sessão executada no servidor</li>
            <li>Cookies lidos server-side</li>
            <li>Redirecionamento ou erro antes do render</li>
            <li>Nenhum JavaScript de autenticação no cliente</li>
          </ul>
        </div>
      </div>
    )
  }

  // Server Component verdadeiro com autenticação - async/await direto
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

  return (
    <div className="container mx-auto p-8">
      <div className="mb-4">
        <Link 
          href="/admin/customer-emails" 
          className="text-blue-500 hover:underline"
        >
          ← Voltar para comparação dos 8 métodos
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-8">Server Component Protegido</h1>
      
      <div className="bg-white shadow-lg rounded-lg p-6">
        <div className="mb-4 space-y-2">
          <p className="text-green-600 font-semibold">✓ Server Component Protegido (async/await)</p>
          <p>Total de clientes: {clientes.length}</p>
          <p className="text-blue-600">Autenticado como: {cliente.email}</p>
          <p className="text-blue-600 text-sm">
            * Autenticação e dados buscados no servidor
          </p>
          <p className="text-amber-600 text-sm">
            * Não pode ser renderizado dinamicamente dentro de Client Components
          </p>
        </div>
        
        {clientes.length > 0 ? (
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
                {clientes.map((cliente, index) => (
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

      <div className="mt-8 p-4 bg-gray-100 rounded-lg">
        <h3 className="font-semibold mb-2">Server Component Protegido:</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>Autenticação verificada no servidor (getCurrentSession)</li>
          <li>Acesso direto ao banco de dados após auth</li>
          <li>Cookies processados server-side</li>
          <li>Render condicional baseado em auth</li>
          <li>Zero JavaScript de auth no cliente</li>
          <li>Performance superior (dados + auth no servidor)</li>
        </ul>
      </div>
    </div>
  )
}