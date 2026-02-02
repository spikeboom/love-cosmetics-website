'use client';

import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import EnderecosList from '@/deprecated/components/cliente/EnderecosList';
import EnderecoForm from '@/deprecated/components/cliente/EnderecoForm';

interface Endereco {
  id: string;
  apelido: string;
  principal: boolean;
  cep: string;
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
  pais: string;
  nomeDestinatario?: string;
  telefone?: string;
}

export default function EnderecosPage() {
  const [showForm, setShowForm] = useState(false);
  const [enderecoEditando, setEnderecoEditando] = useState<Endereco | undefined>();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleEdit = (endereco: Endereco) => {
    setEnderecoEditando(endereco);
    setShowForm(true);
  };

  const handleAdd = () => {
    setEnderecoEditando(undefined);
    setShowForm(true);
  };

  const handleSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleClose = () => {
    setShowForm(false);
    setEnderecoEditando(undefined);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link
              href="/minha-conta"
              className="flex items-center gap-2 text-gray-600 hover:text-[#6B4C4C] transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Voltar
            </Link>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900">Meus Endereços</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gerencie seus endereços de entrega
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <EnderecosList
            onEdit={handleEdit}
            onAdd={handleAdd}
            refresh={refreshTrigger}
          />
        </div>
      </div>

      {showForm && (
        <EnderecoForm
          endereco={enderecoEditando}
          onClose={handleClose}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
}