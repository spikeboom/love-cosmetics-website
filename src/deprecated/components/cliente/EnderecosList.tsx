'use client';

import { useState, useEffect } from 'react';
import { Trash2, Edit, MapPin, Plus, Home } from 'lucide-react';
import { toast } from 'react-hot-toast';

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

interface EnderecosListProps {
  onEdit: (endereco: Endereco) => void;
  onAdd: () => void;
  refresh?: number;
}

export default function EnderecosList({ onEdit, onAdd, refresh }: EnderecosListProps) {
  const [enderecos, setEnderecos] = useState<Endereco[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarEnderecos();
  }, [refresh]);

  const carregarEnderecos = async () => {
    try {
      const response = await fetch('/api/cliente/enderecos');
      if (response.ok) {
        const data = await response.json();
        setEnderecos(data);
      }
    } catch (error) {
      console.error('Erro ao carregar endereços:', error);
      toast.error('Erro ao carregar endereços');
    } finally {
      setLoading(false);
    }
  };

  const excluirEndereco = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este endereço?')) return;

    try {
      const response = await fetch(`/api/cliente/enderecos/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Endereço excluído com sucesso');
        carregarEnderecos();
      } else {
        toast.error('Erro ao excluir endereço');
      }
    } catch (error) {
      console.error('Erro ao excluir endereço:', error);
      toast.error('Erro ao excluir endereço');
    }
  };

  const definirComoPrincipal = async (enderecoId: string) => {
    try {
      const response = await fetch('/api/cliente/enderecos/principal', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enderecoId })
      });

      if (response.ok) {
        toast.success('Endereço principal atualizado');
        carregarEnderecos();
      } else {
        toast.error('Erro ao definir endereço principal');
      }
    } catch (error) {
      console.error('Erro ao definir endereço principal:', error);
      toast.error('Erro ao definir endereço principal');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6B4C4C]"></div>
      </div>
    );
  }

  if (enderecos.length === 0) {
    return (
      <div className="text-center py-12">
        <MapPin className="w-16 h-16 mx-auto text-gray-300 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Nenhum endereço cadastrado
        </h3>
        <p className="text-gray-500 mb-6">
          Adicione seu primeiro endereço para facilitar suas compras
        </p>
        <button
          onClick={onAdd}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#6B4C4C] text-white rounded-md hover:bg-[#5A3D3D] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Adicionar Endereço
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Meus Endereços</h2>
        <button
          onClick={onAdd}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#6B4C4C] text-white rounded-md hover:bg-[#5A3D3D] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Adicionar Endereço
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {enderecos.map((endereco) => (
          <div
            key={endereco.id}
            className={`border rounded-lg p-4 ${
              endereco.principal
                ? 'border-[#6B4C4C] bg-[#6B4C4C]/5'
                : 'border-gray-200 hover:border-gray-300'
            } transition-colors`}
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <Home className="w-4 h-4 text-gray-600" />
                <h3 className="font-medium text-gray-900">{endereco.apelido}</h3>
                {endereco.principal && (
                  <span className="px-2 py-1 text-xs bg-[#6B4C4C] text-white rounded-full">
                    Principal
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onEdit(endereco)}
                  className="p-1 text-gray-600 hover:text-[#6B4C4C] transition-colors"
                  title="Editar"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => excluirEndereco(endereco.id)}
                  className="p-1 text-gray-600 hover:text-red-600 transition-colors"
                  title="Excluir"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="text-sm text-gray-600 space-y-1">
              <p>
                {endereco.logradouro}, {endereco.numero}
                {endereco.complemento && ` - ${endereco.complemento}`}
              </p>
              <p>
                {endereco.bairro} - {endereco.cidade}/{endereco.estado}
              </p>
              <p>CEP: {endereco.cep}</p>
              {endereco.nomeDestinatario && (
                <p>Destinatário: {endereco.nomeDestinatario}</p>
              )}
              {endereco.telefone && <p>Telefone: {endereco.telefone}</p>}
            </div>

            {!endereco.principal && (
              <button
                onClick={() => definirComoPrincipal(endereco.id)}
                className="mt-3 text-sm text-[#6B4C4C] hover:text-[#5A3D3D] font-medium"
              >
                Definir como principal
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}