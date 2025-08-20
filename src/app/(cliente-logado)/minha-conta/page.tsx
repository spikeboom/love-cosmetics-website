import { getCurrentSession } from '@/lib/cliente/auth';
import { getClientePedidos } from '@/lib/cliente/session';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function MinhaContaPage() {
  // Verificar sessão
  const session = await getCurrentSession();
  
  if (!session) {
    redirect('/conta/entrar');
  }

  // Buscar dados do cliente
  const cliente = await prisma.cliente.findUnique({
    where: { id: session.id },
    select: {
      nome: true,
      sobrenome: true,
      email: true,
      cpf: true,
      telefone: true,
      emailVerificado: true,
      createdAt: true,
      cep: true,
      endereco: true,
      numero: true,
      bairro: true,
      cidade: true,
      estado: true,
    }
  });

  if (!cliente) {
    redirect('/conta/entrar');
  }

  // Buscar últimos pedidos
  const pedidos = await getClientePedidos(session.id, 5);

  // Buscar estatísticas
  const stats = await prisma.$transaction(async (tx) => {
    const totalPedidos = await tx.pedidoCliente.count({
      where: { clienteId: session.id }
    });

    const cuponsUsados = await tx.cupomUsado.findMany({
      where: { clienteId: session.id }
    });

    const totalEconomizado = cuponsUsados.reduce((acc, c) => acc + c.valorDesconto, 0);

    return {
      totalPedidos,
      totalCupons: cuponsUsados.length,
      totalEconomizado
    };
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Olá, {cliente.nome}!
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Gerencie sua conta e acompanhe seus pedidos
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Cards de estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">Total de Pedidos</div>
            <div className="mt-2 text-3xl font-bold text-gray-900">{stats.totalPedidos}</div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">Cupons Usados</div>
            <div className="mt-2 text-3xl font-bold text-gray-900">{stats.totalCupons}</div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">Total Economizado</div>
            <div className="mt-2 text-3xl font-bold text-green-600">
              R$ {stats.totalEconomizado.toFixed(2)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Menu lateral */}
          <div className="lg:col-span-1">
            <nav className="bg-white rounded-lg shadow">
              <Link
                href="/minha-conta"
                className="block px-6 py-3 text-sm font-medium text-pink-600 border-l-4 border-pink-600 bg-pink-50"
              >
                Dashboard
              </Link>
              <Link
                href="/minha-conta/pedidos"
                className="block px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900"
              >
                Meus Pedidos
              </Link>
              <Link
                href="/minha-conta/enderecos"
                className="block px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900"
              >
                Endereços
              </Link>
              <Link
                href="/minha-conta/dados"
                className="block px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900"
              >
                Dados Pessoais
              </Link>
              <Link
                href="/minha-conta/seguranca"
                className="block px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900"
              >
                Segurança
              </Link>
              <Link
                href="/api/cliente/auth/sair"
                className="block px-6 py-3 text-sm font-medium text-red-600 hover:bg-red-50"
              >
                Sair
              </Link>
            </nav>
          </div>

          {/* Conteúdo principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informações da conta */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Informações da Conta</h2>
              
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Nome completo</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {cliente.nome} {cliente.sobrenome}
                  </dd>
                </div>
                
                <div>
                  <dt className="text-sm font-medium text-gray-500">Email</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {cliente.email}
                    {!cliente.emailVerificado && (
                      <span className="ml-2 text-xs text-yellow-600">(não verificado)</span>
                    )}
                  </dd>
                </div>
                
                <div>
                  <dt className="text-sm font-medium text-gray-500">CPF</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {cliente.cpf || 'Não informado'}
                  </dd>
                </div>
                
                <div>
                  <dt className="text-sm font-medium text-gray-500">Telefone</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {cliente.telefone || 'Não informado'}
                  </dd>
                </div>
                
                <div>
                  <dt className="text-sm font-medium text-gray-500">Membro desde</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {new Date(cliente.createdAt).toLocaleDateString('pt-BR')}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Endereço principal */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-900">Endereço Principal</h2>
                <Link
                  href="/minha-conta/enderecos"
                  className="text-sm text-pink-600 hover:text-pink-500"
                >
                  Editar
                </Link>
              </div>
              
              {cliente.cep ? (
                <address className="text-sm text-gray-600 not-italic">
                  {cliente.endereco}, {cliente.numero}<br />
                  {cliente.bairro}<br />
                  {cliente.cidade} - {cliente.estado}<br />
                  CEP: {cliente.cep}
                </address>
              ) : (
                <p className="text-sm text-gray-500">
                  Nenhum endereço cadastrado.{' '}
                  <Link href="/minha-conta/enderecos" className="text-pink-600 hover:text-pink-500">
                    Adicionar endereço
                  </Link>
                </p>
              )}
            </div>

            {/* Últimos pedidos */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-900">Últimos Pedidos</h2>
                {pedidos.length > 0 && (
                  <Link
                    href="/minha-conta/pedidos"
                    className="text-sm text-pink-600 hover:text-pink-500"
                  >
                    Ver todos
                  </Link>
                )}
              </div>
              
              {pedidos.length > 0 ? (
                <div className="space-y-3">
                  {pedidos.map((item) => (
                    <div key={item.id} className="border-b pb-3 last:border-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            Pedido #{item.pedido.id.slice(0, 8)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(item.pedido.createdAt).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        <p className="text-sm font-medium text-gray-900">
                          R$ {item.pedido.total_pedido.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  Você ainda não fez nenhum pedido.{' '}
                  <Link href="/" className="text-pink-600 hover:text-pink-500">
                    Começar a comprar
                  </Link>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}