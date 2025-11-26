"use client";

import { useState, useCallback } from "react";

interface ViaCepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

interface EnderecoData {
  rua: string;
  bairro: string;
  cidade: string;
  estado: string;
}

interface UseViaCepReturn {
  buscarCep: (cep: string) => Promise<EnderecoData | null>;
  loading: boolean;
  error: string | null;
  endereco: EnderecoData | null;
  limparEndereco: () => void;
}

export function useViaCep(): UseViaCepReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [endereco, setEndereco] = useState<EnderecoData | null>(null);

  const limparEndereco = useCallback(() => {
    setEndereco(null);
    setError(null);
  }, []);

  const buscarCep = useCallback(async (cep: string): Promise<EnderecoData | null> => {
    const cepLimpo = cep.replace(/\D/g, "");

    if (cepLimpo.length !== 8) {
      setError("CEP invalido. Digite os 8 numeros.");
      setEndereco(null);
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data: ViaCepResponse = await response.json();

      if (data.erro) {
        setError("CEP nao encontrado.");
        setEndereco(null);
        return null;
      }

      const enderecoData: EnderecoData = {
        rua: data.logradouro || "",
        bairro: data.bairro || "",
        cidade: data.localidade || "",
        estado: data.uf || "",
      };

      setEndereco(enderecoData);
      return enderecoData;
    } catch (err) {
      setError("Erro ao buscar endereco pelo CEP.");
      setEndereco(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    buscarCep,
    loading,
    error,
    endereco,
    limparEndereco,
  };
}
