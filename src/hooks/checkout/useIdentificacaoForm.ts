import { useState, useEffect, useCallback, useRef } from "react";
import { identificacaoSchema } from "@/lib/checkout/validation";
import { validacoes } from "@/lib/checkout/validation";
import { formatCPF, formatTelefone, formatCEP } from "@/lib/formatters";

export interface IdentificacaoFormData {
  cpf: string;
  nome: string;
  email: string;
  telefone: string;
  cep: string;
}

const STORAGE_KEY = "checkoutIdentificacao";

function safeString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

export function useIdentificacaoForm(overrideCep?: string) {
  const normalizedOverrideCep = overrideCep ? formatCEP(overrideCep) : "";
  const overrideCepRef = useRef<string>("");
  overrideCepRef.current = normalizedOverrideCep;

  const cepDirtyRef = useRef(false);

  const [formData, setFormData] = useState<IdentificacaoFormData>({
    cpf: "",
    nome: "",
    email: "",
    telefone: "",
    cep: "",
  });
  const [errors, setErrors] = useState<Partial<IdentificacaoFormData>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Prioridade de CEP: shipping context (override) > localStorage (checkoutIdentificacao) > cliente logado (API)
  // Sem race conditions: o fetch async nao pode sobrescrever um CEP que chegou depois via shipping context.
  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      // Ler localStorage antes do fetch (mesmo para logados), pois tem prioridade sobre o CEP do cliente logado.
      let storageData: Partial<IdentificacaoFormData> | null = null;
      let storageCep = "";
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && typeof parsed === "object") {
            const parsedObj = parsed as Record<string, unknown>;
            storageData = parsedObj as Partial<IdentificacaoFormData>;
            storageCep = formatCEP(safeString(parsedObj.cep));
          }
        }
      } catch {
        // ignore
      }

      try {
        const response = await fetch("/api/cliente/auth/verificar", {
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          if (data.authenticated && data.cliente) {
            const cliente = data.cliente;
            const enderecoData = cliente.endereco;
            const clienteCep = enderecoData?.cep ? formatCEP(enderecoData.cep) : "";

            const finalCep = overrideCepRef.current || storageCep || clienteCep;

            if (cancelled) return;

            setFormData((prev) => ({
              cpf: cliente.cpf ? formatCPF(cliente.cpf) : storageData?.cpf || prev.cpf || "",
              nome:
                `${cliente.nome || ""} ${cliente.sobrenome || ""}`.trim() ||
                storageData?.nome ||
                prev.nome ||
                "",
              email: cliente.email || storageData?.email || prev.email || "",
              telefone: cliente.telefone
                ? formatTelefone(cliente.telefone)
                : storageData?.telefone || prev.telefone || "",
              cep: finalCep || prev.cep || "",
            }));

            console.log(
              `[ID-FORM] Dados carregados (cliente) - CEP final: ${finalCep || "N/A"} (override: ${
                overrideCepRef.current || "N/A"
              }, storage: ${storageCep || "N/A"}, cliente: ${clienteCep || "N/A"})`
            );

            setIsLoggedIn(true);
            setIsLoading(false);
            return;
          }
        }
      } catch {
        // ignore
      }

      if (cancelled) return;

      if (storageData) {
        const finalCep = overrideCepRef.current || storageCep;
        setFormData({
          cpf: storageData.cpf || "",
          nome: storageData.nome || "",
          email: storageData.email || "",
          telefone: storageData.telefone || "",
          cep: finalCep || "",
        });

        console.log(
          `[ID-FORM] Dados carregados (localStorage) - CEP final: ${finalCep || "N/A"} (override: ${
            overrideCepRef.current || "N/A"
          }, storage: ${storageCep || "N/A"})`
        );
      } else if (overrideCepRef.current) {
        setFormData((prev) => ({ ...prev, cep: overrideCepRef.current }));
        console.log(`[ID-FORM] Sem dados salvos - CEP override: ${overrideCepRef.current}`);
      }

      setIsLoading(false);
    };

    loadData();

    return () => {
      cancelled = true;
    };
  }, []);

  // Se o shipping context atualizar o CEP depois do carregamento, aplicar sem sobrescrever digitacao do usuario.
  useEffect(() => {
    if (!normalizedOverrideCep) return;
    if (cepDirtyRef.current) return;

    setFormData((prev) => {
      if (prev.cep === normalizedOverrideCep) return prev;
      return { ...prev, cep: normalizedOverrideCep };
    });
  }, [normalizedOverrideCep]);

  const handleChange = useCallback((field: keyof IdentificacaoFormData, value: string) => {
    let formattedValue = value;

    if (field === "cpf") {
      formattedValue = formatCPF(value);
    } else if (field === "cep") {
      formattedValue = formatCEP(value);
      cepDirtyRef.current = true;
    } else if (field === "telefone") {
      formattedValue = formatTelefone(value);
    }

    setFormData((prev) => ({ ...prev, [field]: formattedValue }));

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
    isLoggedIn,
    handleChange,
    validateForm,
    saveToStorage,
    clearStorage,
  };
}
