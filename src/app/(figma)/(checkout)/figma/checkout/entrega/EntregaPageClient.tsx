"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { CheckoutStepper } from "../CheckoutStepper";
import { BotaoVoltar } from "../pagamento/components/BotaoVoltar";
import { useViaCep } from "@/hooks/checkout";
import { useCheckoutSync } from "@/hooks/checkout/useCheckoutSync";
import { useShipping, useCart } from "@/contexts";
import { FreightOptions } from "@/components/figma-shared";
import { formatCEP } from "@/lib/formatters";
import { ucUserDataUpdate } from "../../../../_tracking/uc-ecommerce";

interface FormData {
  cep: string;
  rua: string;
  numero: string;
  semNumero: boolean;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
  selectedFreightIndex: number;
}

export function EntregaPageClient() {
  const router = useRouter();
  const { cart, isCartLoaded } = useCart();
  const { buscarCep, endereco } = useViaCep();
  const { syncToServer } = useCheckoutSync();
  const freight = useShipping();
  const shippingCepRef = useRef(freight.cep);
  shippingCepRef.current = freight.cep;

  const [formData, setFormData] = useState<FormData>({
    cep: "",
    rua: "",
    numero: "",
    semNumero: false,
    complemento: "",
    bairro: "",
    cidade: "",
    estado: "",
    selectedFreightIndex: 0,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Verificar se o usuario passou pela identificacao
  useEffect(() => {
    if (isCartLoaded && Object.keys(cart || {}).length === 0) {
      router.push("/figma/cart");
      return;
    }

    const identificacao = localStorage.getItem("checkoutIdentificacao");
    if (!identificacao) {
      router.push("/figma/checkout/identificacao");
      return;
    }
  }, [router, cart, isCartLoaded]);

  // Carregar dados do endereço: usuário logado > localStorage > identificação
  // O CEP do shipping context (carrinho/PDP) SEMPRE tem prioridade máxima
  useEffect(() => {
    const loadData = async () => {
      // Determinar o melhor CEP disponível (shipping context > identificação > salvo)
      let idCep = "";
      try {
        const idStr = localStorage.getItem("checkoutIdentificacao");
        if (idStr) {
          const idData = JSON.parse(idStr);
          idCep = idData.cep || "";
        }
      } catch { /* ignore */ }

      try {
        // Tentar buscar dados do usuário logado
        const response = await fetch("/api/cliente/auth/verificar", {
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          if (data.authenticated && data.cliente) {
            const cliente = data.cliente;
            const enderecoData = cliente.endereco;
            if (enderecoData && typeof enderecoData === "object" && enderecoData.cep) {
              const clienteCep = enderecoData.cep ? enderecoData.cep.replace(/(\d{5})(\d{3})/, "$1-$2") : "";
              const shippingCep = shippingCepRef.current;
              setFormData(prev => ({
                ...prev,
                // Prioridade: shipping context > identificação > cliente
                cep: shippingCep || idCep || clienteCep,
                rua: enderecoData.endereco || "",
                numero: enderecoData.numero || "",
                complemento: enderecoData.complemento || "",
                bairro: enderecoData.bairro || "",
                cidade: enderecoData.cidade || "",
                estado: enderecoData.estado || "",
              }));
              console.log(`📦 [ENTREGA] Dados carregados (cliente logado) — CEP final: ${shippingCep || idCep || clienteCep} (shipping: ${shippingCep}, id: ${idCep}, cliente: ${clienteCep})`);
              setIsLoading(false);
              return;
            }
          }
        }
      } catch {
        // Erro ao buscar usuário logado, continuar para localStorage
      }

      // Fallback: carregar do localStorage
      const saved = localStorage.getItem("checkoutEntrega");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          const { selectedFreightIndex: _ignored, cep: savedCep, ...restData } = parsed;
          void _ignored;
          const shippingCep = shippingCepRef.current;
          const finalCep = shippingCep || idCep || savedCep || "";
          setFormData(prev => ({
            ...prev,
            ...restData,
            cep: finalCep,
          }));
          console.log(`📦 [ENTREGA] Dados carregados (localStorage) — CEP final: ${finalCep} (shipping: ${shippingCep}, id: ${idCep}, saved: ${savedCep})`);
        } catch {
          // Ignorar erro
        }
      } else {
        // Sem dados salvos, usar CEP do shipping ou identificação
        const shippingCep = shippingCepRef.current;
        const finalCep = shippingCep || idCep || "";
        if (finalCep) {
          setFormData(prev => ({ ...prev, cep: finalCep }));
          console.log(`📦 [ENTREGA] Sem dados salvos — CEP final: ${finalCep} (shipping: ${shippingCep}, id: ${idCep})`);
        }
      }
      setIsLoading(false);
    };

    loadData();
  }, []);

  // Quando o shipping context atualizar o CEP (tem prioridade máxima SEMPRE)
  useEffect(() => {
    if (freight.cep) {
      setFormData(prev => {
        if (prev.cep !== freight.cep) {
          console.log(`📦 [ENTREGA] freight.cep mudou — de "${prev.cep}" para "${freight.cep}"`);
        }
        return {
          ...prev,
          cep: freight.cep,
          ...(freight.hasCalculated ? { selectedFreightIndex: freight.selectedServiceIndex } : {}),
        };
      });
    }
  }, [freight.cep, freight.hasCalculated, freight.selectedServiceIndex]);

  // Preencher campos quando endereco for buscado
  useEffect(() => {
    if (endereco) {
      setFormData((prev) => ({
        ...prev,
        rua: endereco.rua || prev.rua,
        bairro: endereco.bairro || prev.bairro,
        cidade: endereco.cidade || prev.cidade,
        estado: endereco.estado || prev.estado,
      }));
    }
  }, [endereco]);

  const handleChange = (field: keyof FormData, value: string | boolean) => {
    if (field === "cep" && typeof value === "string") {
      value = formatCEP(value);
    }

    setFormData((prev) => ({ ...prev, [field]: value }));

    // Limpar erro ao digitar
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  // Auto-buscar CEP e calcular frete quando completar 8 dígitos
  useEffect(() => {
    const cepLimpo = formData.cep.replace(/\D/g, "");
    if (cepLimpo.length === 8) {
      buscarCep(formData.cep);

      // Calcular frete sempre que o CEP mudar (pode ser um CEP novo)
      const cepMudou = freight.cep.replace(/\D/g, "") !== cepLimpo;
      console.log(`📦 [ENTREGA] useEffect CEP — cep: ${cepLimpo}, freight.cep: ${freight.cep}, hasCalculated: ${freight.hasCalculated}, cepMudou: ${cepMudou}`);
      if (!freight.hasCalculated || cepMudou) {
        const cartItems = Object.values(cart);
        if (cartItems.length > 0) {
          console.log(`📦 [ENTREGA] Chamando calculateFreight — CEP: ${formData.cep}, itens: ${cartItems.length}`);
          freight.calculateFreight(formData.cep, cartItems, { silent: true });
        }
      } else {
        console.log(`⏭️ [ENTREGA] Pulando calculateFreight — CEP não mudou e já calculou`);
      }
    }
  }, [formData.cep]);

  // Selecionar opcao de frete
  const handleSelectFreight = (index: number) => {
    const service = freight.availableServices[index];
    if (service) {
      setFormData((prev) => ({ ...prev, selectedFreightIndex: index }));
      // Atualizar o Context com a nova selecao
      freight.setSelectedFreight(service.price, service.deliveryTime, index);
    }
  };

  const validateForm = () => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (!formData.cep || formData.cep.replace(/\D/g, "").length !== 8) {
      newErrors.cep = "CEP invalido";
    }

    if (!formData.rua || formData.rua.trim().length < 3) {
      newErrors.rua = "Rua obrigatoria";
    }

    if (!formData.semNumero && (!formData.numero || formData.numero.trim().length === 0)) {
      newErrors.numero = "Numero obrigatorio";
    }

    if (!formData.bairro || formData.bairro.trim().length < 2) {
      newErrors.bairro = "Bairro obrigatorio";
    }

    if (!formData.cidade || formData.cidade.trim().length < 2) {
      newErrors.cidade = "Cidade obrigatoria";
    }

    if (!formData.estado || formData.estado.trim().length < 2) {
      newErrors.estado = "Estado obrigatorio";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      localStorage.setItem("checkoutEntrega", JSON.stringify(formData));
      syncToServer({ entrega: formData, step: "entrega" });

      // Disparar user_data_update com endereco completo
      // Recuperar dados de identificacao para enviar junto
      try {
        const identificacao = localStorage.getItem("checkoutIdentificacao");
        const idData = identificacao ? JSON.parse(identificacao) : {};
        const nomeCompleto = idData.nome?.trim() || "";
        const partes = nomeCompleto.split(/\s+/);

        ucUserDataUpdate({
          email: idData.email,
          phone_number: idData.telefone?.replace(/\D/g, "") || undefined,
          first_name: partes[0] || undefined,
          last_name: partes.length > 1 ? partes.slice(1).join(" ") : undefined,
          address: {
            city: formData.cidade,
            region: formData.estado,
            postal_code: formData.cep?.replace(/\D/g, "") || undefined,
            street: formData.rua,
          },
        });
      } catch {
        // ignore
      }

      router.push("/figma/checkout/pagamento");
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white flex flex-col w-full flex-1">
        <CheckoutStepper currentStep="entrega" />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-[#254333] border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  const handleVoltar = () => {
    router.push("/figma/checkout/identificacao");
  };

  return (
    <div className="bg-white flex flex-col w-full flex-1">
      <CheckoutStepper currentStep="entrega" />

      <div className="flex justify-center px-4 lg:px-[24px] pt-3 lg:pt-[12px] pb-8 lg:pb-[32px]">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 lg:gap-[32px] w-full max-w-[684px]">
          <BotaoVoltar onClick={handleVoltar} />

          <div className="flex flex-col gap-6 lg:gap-[32px] py-4 lg:py-[24px]">
            {/* Rua / Avenida */}
            <div className="flex flex-col gap-3 lg:gap-[16px] w-full">
              <label className="font-cera-pro font-bold text-[18px] lg:text-[20px] text-black">
                Rua / Avenida *
              </label>
              <input
                type="text"
                value={formData.rua}
                onChange={(e) => handleChange("rua", e.target.value)}
                placeholder=""
                className={`w-full h-[48px] px-4 bg-white border ${
                  errors.rua ? "border-red-500" : "border-[#d2d2d2]"
                } rounded-[8px] font-cera-pro font-light text-[18px] lg:text-[20px] text-black placeholder:text-[#8c8c8c] focus:outline-none focus:border-[#254333]`}
              />
              {errors.rua && (
                <span className="text-red-500 text-sm">{errors.rua}</span>
              )}
            </div>

            {/* Numero */}
            <div className="flex flex-col gap-3 lg:gap-[16px] w-full">
              <label className="font-cera-pro font-bold text-[18px] lg:text-[20px] text-black">
                Numero *
              </label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={formData.numero}
                  onChange={(e) => handleChange("numero", e.target.value)}
                  placeholder="000"
                  disabled={formData.semNumero}
                  className={`w-full h-[48px] px-4 bg-white border ${
                    errors.numero ? "border-red-500" : "border-[#d2d2d2]"
                  } rounded-[8px] font-cera-pro font-light text-[18px] lg:text-[20px] text-black placeholder:text-[#8c8c8c] focus:outline-none focus:border-[#254333] ${
                    formData.semNumero ? "bg-gray-100" : ""
                  }`}
                />
                <div className="absolute right-4 flex items-center gap-2">
                  <span className="font-cera-pro font-light text-[14px] lg:text-[16px] text-[#333333]">
                    Sem numero
                  </span>
                  <input
                    type="checkbox"
                    checked={formData.semNumero}
                    onChange={(e) => handleChange("semNumero", e.target.checked)}
                    className="w-[18px] h-[18px] border-2 border-[#333333] rounded-sm cursor-pointer accent-[#254333]"
                  />
                </div>
              </div>
              {errors.numero && (
                <span className="text-red-500 text-sm">{errors.numero}</span>
              )}
            </div>

            {/* Complemento */}
            <div className="flex flex-col gap-3 lg:gap-[16px] w-full">
              <label className="font-cera-pro font-bold text-[18px] lg:text-[20px] text-black">
                Complemento (opcional)
              </label>
              <input
                type="text"
                value={formData.complemento}
                onChange={(e) => handleChange("complemento", e.target.value)}
                placeholder="Apartamento ou bloco"
                className={`w-full h-[48px] px-4 bg-white border ${
                  errors.complemento ? "border-red-500" : "border-[#d2d2d2]"
                } rounded-[8px] font-cera-pro font-light text-[18px] lg:text-[20px] text-black placeholder:text-[#8c8c8c] focus:outline-none focus:border-[#254333]`}
              />
              {errors.complemento && (
                <span className="text-red-500 text-sm">{errors.complemento}</span>
              )}
            </div>

            {/* Opcoes de Frete (Frenet) */}
            <div className="flex flex-col gap-3 lg:gap-[16px] w-full">
              <label className="font-cera-pro font-bold text-[18px] lg:text-[20px] text-black">
                Selecione a forma de envio
              </label>
              {freight.isLoading ? (
                <div className="flex items-center gap-2 py-4">
                  <div className="w-5 h-5 border-2 border-[#254333] border-t-transparent rounded-full animate-spin" />
                  <span className="font-cera-pro font-light text-[14px] text-[#666]">
                    Calculando opções de frete...
                  </span>
                </div>
              ) : freight.availableServices.length > 0 ? (
                <FreightOptions
                  services={freight.availableServices}
                  selectedIndex={formData.selectedFreightIndex}
                  onSelect={handleSelectFreight}
                  radioName="freight-option-checkout"
                />
              ) : (
                <p className="font-cera-pro font-light text-[14px] text-[#666] py-2">
                  Nenhuma opção de frete disponível. Verifique o CEP informado.
                </p>
              )}
            </div>
          </div>

          {/* Botao Continuar */}
          <button
            type="submit"
            className="w-full h-[60px] bg-[#254333] rounded-[8px] flex items-center justify-center hover:bg-[#1a2e24] transition-colors"
          >
            <span className="font-cera-pro font-bold text-[20px] lg:text-[24px] text-white">
              Continuar
            </span>
          </button>
        </form>
      </div>
    </div>
  );
}
