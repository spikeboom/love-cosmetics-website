"use client";

import { useState, useEffect } from "react";
import { X, MapPin, User, Phone } from "lucide-react";
import { toast } from "react-hot-toast";

interface Endereco {
  id?: string;
  apelido: string;
  principal?: boolean;
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

interface EnderecoFormProps {
  endereco?: Endereco;
  onClose: () => void;
  onSuccess: () => void;
}

const ESTADOS = [
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
];

export default function EnderecoForm({
  endereco,
  onClose,
  onSuccess,
}: EnderecoFormProps) {
  const [loading, setLoading] = useState(false);
  const [buscandoCep, setBuscandoCep] = useState(false);
  const [formData, setFormData] = useState<Endereco>({
    apelido: "",
    cep: "",
    logradouro: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    estado: "SP",
    pais: "Brasil",
    nomeDestinatario: "",
    telefone: "",
    principal: false,
    ...endereco,
  });

  const isEdicao = !!endereco?.id;

  const buscarCep = async (cep: string) => {
    if (cep.length !== 8) return;

    setBuscandoCep(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();

      if (data.erro) {
        toast.error("CEP não encontrado");
        return;
      }

      setFormData((prev) => ({
        ...prev,
        logradouro: data.logradouro || prev.logradouro,
        bairro: data.bairro || prev.bairro,
        cidade: data.localidade || prev.cidade,
        estado: data.uf || prev.estado,
      }));
    } catch (error) {
      toast.error("Erro ao buscar CEP");
    } finally {
      setBuscandoCep(false);
    }
  };

  const handleCepChange = (cep: string) => {
    const cepNumerico = cep.replace(/\D/g, "");
    setFormData((prev) => ({ ...prev, cep: cepNumerico }));

    if (cepNumerico.length === 8) {
      buscarCep(cepNumerico);
    }
  };

  const formatarCep = (cep: string) => {
    const numerico = cep.replace(/\D/g, "");
    return numerico.replace(/(\d{5})(\d{3})/, "$1-$2");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = isEdicao
        ? `/api/cliente/enderecos/${endereco.id}`
        : "/api/cliente/enderecos";

      const method = isEdicao ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          complemento: formData.complemento || null,
          nomeDestinatario: formData.nomeDestinatario || null,
          telefone: formData.telefone || null,
        }),
      });

      if (response.ok) {
        toast.success(
          isEdicao
            ? "Endereço atualizado com sucesso"
            : "Endereço cadastrado com sucesso",
        );
        onSuccess();
        onClose();
      } else {
        const error = await response.json();
        if (error.details && Array.isArray(error.details)) {
          // Mostrar primeiro erro de validação
          const firstError = error.details[0];
          toast.error(firstError.message || "Dados inválidos");
        } else {
          toast.error(error.error || "Erro ao salvar endereço");
        }
      }
    } catch (error) {
      console.error("Erro ao salvar endereço:", error);
      toast.error("Erro ao salvar endereço");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex w-full items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white">
        <div className="flex items-center justify-between border-b p-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {isEdicao ? "Editar Endereço" : "Novo Endereço"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-600 transition-colors hover:text-gray-800"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              <MapPin className="mr-1 inline h-4 w-4" />
              Apelido do Endereço *
            </label>
            <input
              type="text"
              value={formData.apelido}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, apelido: e.target.value }))
              }
              placeholder="Ex: Casa, Trabalho, Casa dos Pais"
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#6B4C4C]"
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                CEP *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formatarCep(formData.cep)}
                  onChange={(e) => handleCepChange(e.target.value)}
                  placeholder="00000-000"
                  maxLength={9}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#6B4C4C]"
                  required
                />
                {buscandoCep && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 transform">
                    <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-[#6B4C4C]"></div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Estado *
              </label>
              <select
                value={formData.estado}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, estado: e.target.value }))
                }
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#6B4C4C]"
                required
              >
                {ESTADOS.map((estado) => (
                  <option key={estado} value={estado}>
                    {estado}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Logradouro *
            </label>
            <input
              type="text"
              value={formData.logradouro}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, logradouro: e.target.value }))
              }
              placeholder="Rua, Avenida, etc."
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#6B4C4C]"
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Número *
              </label>
              <input
                type="text"
                value={formData.numero}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, numero: e.target.value }))
                }
                placeholder="123"
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#6B4C4C]"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Complemento
              </label>
              <input
                type="text"
                value={formData.complemento}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    complemento: e.target.value,
                  }))
                }
                placeholder="Apto, Casa, Bloco, etc."
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#6B4C4C]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Bairro *
              </label>
              <input
                type="text"
                value={formData.bairro}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, bairro: e.target.value }))
                }
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#6B4C4C]"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Cidade *
              </label>
              <input
                type="text"
                value={formData.cidade}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, cidade: e.target.value }))
                }
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#6B4C4C]"
                required
              />
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="mb-3 text-sm font-medium text-gray-700">
              <User className="mr-1 inline h-4 w-4" />
              Informações do Destinatário (Opcional)
            </h3>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Nome do Destinatário
                </label>
                <input
                  type="text"
                  value={formData.nomeDestinatario}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      nomeDestinatario: e.target.value,
                    }))
                  }
                  placeholder="Nome de quem vai receber"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#6B4C4C]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  <Phone className="mr-1 inline h-4 w-4" />
                  Telefone
                </label>
                <input
                  type="tel"
                  value={formData.telefone}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      telefone: e.target.value,
                    }))
                  }
                  placeholder="(11) 99999-9999"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#6B4C4C]"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="principal"
              checked={formData.principal}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  principal: e.target.checked,
                }))
              }
              className="mr-2 h-4 w-4 rounded border-gray-300 text-[#6B4C4C] focus:ring-[#6B4C4C]"
            />
            <label htmlFor="principal" className="text-sm text-gray-700">
              Definir como endereço principal
            </label>
          </div>

          <div className="flex gap-3 border-t pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-md border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 rounded-md bg-[#6B4C4C] px-4 py-2 text-white transition-colors hover:bg-[#5A3D3D] disabled:cursor-not-allowed disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Salvando..." : isEdicao ? "Atualizar" : "Cadastrar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
