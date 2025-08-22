import { redirect } from 'next/navigation';
import { getCurrentSession } from '@/lib/cliente/auth';

export default async function DadosPage() {
  // Verificar sessão
  const session = await getCurrentSession();
  
  if (!session) {
    redirect('/conta/entrar');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dados Pessoais</h1>
          <p className="mt-1 text-sm text-gray-500">
            Atualize suas informações pessoais
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">
              Funcionalidade em desenvolvimento
            </p>
            <a 
              href="/minha-conta" 
              className="text-pink-600 hover:text-pink-500 font-medium"
            >
              ← Voltar para Minha Conta
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}