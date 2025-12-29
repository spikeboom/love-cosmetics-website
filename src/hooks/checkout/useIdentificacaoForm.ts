import { useState, useEffect, useCallback } from "react";
import { identificacaoSchema } from "@/lib/checkout/validation";
import { validacoes } from "@/lib/checkout/validation";
import { formatCPF, formatDateInput, formatTelefone } from "@/lib/formatters";

export interface IdentificacaoFormData {
  cpf: string;
  dataNascimento: string;
  nome: string;
  email: string;
  telefone: string;
}

const STORAGE_KEY = "checkoutIdentificacao";

export function useIdentificacaoForm() {
  const [formData, setFormData] = useState<IdentificacaoFormData>({
    cpf: "",
    dataNascimento: "",
    nome: "",
    email: "",
    telefone: "",
  });
  const [errors, setErrors] = useState<Partial<IdentificacaoFormData>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Carregar dados: primeiro do usuario logado, depois do localStorage
  useEffect(() => {
    const loadData = async () => {
      try {
        // Tentar buscar dados do usuario logado
        const response = await fetch("/api/cliente/auth/verificar", {
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          if (data.authenticated && data.cliente) {
            const cliente = data.cliente;
            // Formatar data de nascimento se existir
            let dataNascimentoFormatada = "";
            if (cliente.dataNascimento) {
              const date = new Date(cliente.dataNascimento);
              dataNascimentoFormatada = `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1).toString().padStart(2, "0")}/${date.getFullYear()}`;
            }

            setFormData({
              cpf: cliente.cpf ? formatCPF(cliente.cpf) : "",
              dataNascimento: dataNascimentoFormatada,
              nome: `${cliente.nome || ""} ${cliente.sobrenome || ""}`.trim(),
              email: cliente.email || "",
              telefone: cliente.telefone ? formatTelefone(cliente.telefone) : "",
            });
            setIsLoading(false);
            return;
          }
        }
      } catch {
        // Erro ao buscar usuario logado, continuar para localStorage
      }

      // Fallback: carregar do localStorage
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setFormData(parsed);
        } catch {
          // Ignorar erro de parse
        }
      }
      setIsLoading(false);
    };

    loadData();
  }, []);

  const handleChange = useCallback((field: keyof IdentificacaoFormData, value: string) => {
    let formattedValue = value;

    if (field === "cpf") {
      formattedValue = formatCPF(value);
    } else if (field === "dataNascimento") {
      formattedValue = formatDateInput(value);
    } else if (field === "telefone") {
      formattedValue = formatTelefone(value);
    }

    setFormData((prev) => ({ ...prev, [field]: formattedValue }));

    // Limpar erro ao digitar
    setErrors((prev) => {
      if (prev[field]) {
        return { ...prev, [field]: undefined };
      }
      return prev;
    });
  }, []);

  const validateForm = useCallback(() => {
    const result = identificacaoSchema.safeParse(formData);

    if (!result.success) {
      const newErrors: Partial<IdentificacaoFormData> = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof IdentificacaoFormData;
        newErrors[field] = err.message;
      });
      setErrors(newErrors);
      return false;
    }

    // Validacao adicional de CPF com checksum
    if (!validacoes.cpf(formData.cpf)) {
      setErrors({ cpf: "CPF invalido" });
      return false;
    }

    setErrors({});
    return true;
  }, [formData]);

  const saveToStorage = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
  }, [formData]);

  const clearStorage = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    formData,
    errors,
    isLoading,
    handleChange,
    validateForm,
    saveToStorage,
    clearStorage,
  };
}
