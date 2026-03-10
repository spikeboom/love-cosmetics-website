import React, { useState, useEffect, useCallback } from 'react';
import { FreightService } from '@/services/freight-service';
import { calculateFreightFrenet } from '@/app/actions/freight-actions';
import { ucShippingCalculate } from '@/app/(figma)/_tracking/uc-ecommerce';
import type { CartProduct } from './useModalCart';

interface UseFreightReturn {
  cep: string;
  setCep: (cep: string) => void;
  freightValue: number;
  deliveryTime: string;
  isLoading: boolean;
  error: string | null;
  calculateFreight: (cep: string, cartItems?: CartProduct[], options?: { silent?: boolean }) => Promise<void>;
  clearError: () => void;
  hasCalculated: boolean;
  availableServices: Array<{
    carrier: string;
    service: string;
    price: number;
    deliveryTime: number;
    serviceCode: string;
  }>;
  setSelectedFreight: (price: number, deliveryTime: number, index?: number) => void;
  resetFreight: () => void;
  getSelectedFreightData: () => {
    frete_calculado: number;
    transportadora_nome: string | null;
    transportadora_servico: string | null;
    transportadora_prazo: number | null;
  };
  selectedServiceIndex: number;
  addressLabel: string | null;
}

const STORAGE_KEY = 'love_cosmetics_last_cep';
const FREIGHT_DATA_KEY = 'love_cosmetics_freight_data';
const DEFAULT_FREIGHT = 15; // Valor padrão de frete

export function useFreight(): UseFreightReturn {
  const [cep, setCep] = useState<string>('');
  const [freightValue, setFreightValue] = useState<number>(DEFAULT_FREIGHT);
  const [deliveryTime, setDeliveryTime] = useState<string>('3-5 dias úteis');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasCalculated, setHasCalculated] = useState<boolean>(false);
  const [availableServices, setAvailableServices] = useState<Array<{
    carrier: string;
    service: string;
    price: number;
    deliveryTime: number;
    serviceCode: string;
  }>>([]);
  const [selectedServiceIndex, setSelectedServiceIndex] = useState<number>(0);
  const [addressLabel, setAddressLabel] = useState<string | null>(null);

  // Carregar dados salvos do localStorage
  useEffect(() => {
    const savedCep = localStorage.getItem(STORAGE_KEY);
    const savedFreightData = localStorage.getItem(FREIGHT_DATA_KEY);

    if (savedCep) {
      setCep(savedCep);
    }

    if (savedFreightData) {
      try {
        const data = JSON.parse(savedFreightData);
        setFreightValue(data.freightValue || DEFAULT_FREIGHT);
        setDeliveryTime(data.deliveryTime || '3-5 dias úteis');
        setAvailableServices(data.availableServices || []);
        setSelectedServiceIndex(data.selectedServiceIndex || 0);
        setHasCalculated(data.hasCalculated || false);
        setAddressLabel(data.addressLabel || null);
      } catch (error) {
        console.error('Erro ao carregar dados de frete:', error);
      }
    }
  }, []);

  // Salvar dados no localStorage quando mudarem
  useEffect(() => {
    if (FreightService.isValidCep(cep)) {
      localStorage.setItem(STORAGE_KEY, cep);
    }
  }, [cep]);

  useEffect(() => {
    if (hasCalculated) {
      const freightData = {
        freightValue,
        deliveryTime,
        availableServices,
        selectedServiceIndex,
        hasCalculated,
        addressLabel
      };
      localStorage.setItem(FREIGHT_DATA_KEY, JSON.stringify(freightData));
    }
  }, [freightValue, deliveryTime, availableServices, selectedServiceIndex, hasCalculated, addressLabel]);

  // Guard contra chamadas concorrentes de calculateFreight
  const calculateInFlightRef = React.useRef<string | null>(null);

  const calculateFreightInternal = useCallback(async (cepValue: string, cartItems?: CartProduct[], options?: { silent?: boolean }) => {
    const cleanCepInput = cepValue.replace(/\D/g, '');

    if (!FreightService.isValidCep(cepValue)) {
      if (!options?.silent) {
        setError('CEP inválido. Digite um CEP com 8 dígitos.');
      }
      return;
    }

    // Se não houver itens, não calcular
    if (!cartItems || cartItems.length === 0) {
      return;
    }

    // Guard: se já tem uma chamada em andamento para o mesmo CEP, ignorar
    if (calculateInFlightRef.current === cleanCepInput) {
      console.log(`🔒 [CEP-TRACK] calculateFreight BLOQUEADO — já em andamento para ${cleanCepInput}`);
      return;
    }
    calculateInFlightRef.current = cleanCepInput;

    console.log(`📦 [CEP-TRACK] calculateFreight INICIADO — CEP: ${cleanCepInput}, silent: ${!!options?.silent}, itens: ${cartItems.length}`);

    if (!options?.silent) {
      setIsLoading(true);
    }
    setError(null);

    try {
      // Mapear itens do carrinho para o formato da API Frenet
      const items = cartItems.map(item => ({
        quantity: item.quantity,
        peso_gramas: item.peso_gramas,
        altura: item.altura,
        largura: item.largura,
        comprimento: item.comprimento,
        bling_number: item.bling_number,
        preco: item.preco
      }));

      const result = await calculateFreightFrenet(cepValue, items);

      if (result.success) {
        const cheapestIndex = result.services.reduce((minIndex, service, index) => {
          const min = result.services[minIndex];
          return service.price < min.price ? index : minIndex;
        }, 0);

        // Tentar manter o serviço selecionado anteriormente se ainda existir
        const previousService = availableServices[selectedServiceIndex];
        let newSelectedIndex = cheapestIndex; // Padrão: mais barato

        if (previousService) {
          // Procurar serviço equivalente (mesmo carrier e serviceCode)
          const equivalentIndex = result.services.findIndex(
            s => s.carrier === previousService.carrier && s.serviceCode === previousService.serviceCode
          );

          if (equivalentIndex !== -1) {
            newSelectedIndex = equivalentIndex;
          }
        }

        const selectedService = result.services[newSelectedIndex];
        setFreightValue(selectedService.price);
        setDeliveryTime(`${selectedService.deliveryTime} ${selectedService.deliveryTime === 1 ? 'dia útil' : 'dias úteis'}`);
        setAvailableServices(result.services);
        setSelectedServiceIndex(newSelectedIndex);
        setHasCalculated(true);

        // Buscar endereço resumido via ViaCEP
        const cleanCepValue = cepValue.replace(/\D/g, '');
        let viaCepBairro: string | undefined;
        let viaCepCidade: string | undefined;
        let viaCepUf: string | undefined;
        try {
          const viaCepRes = await fetch(`https://viacep.com.br/ws/${cleanCepValue}/json/`);
          const viaCepData = await viaCepRes.json();
          if (!viaCepData.erro) {
            viaCepBairro = viaCepData.bairro;
            viaCepCidade = viaCepData.localidade;
            viaCepUf = viaCepData.uf;
            const parts: string[] = [];
            if (viaCepData.logradouro) parts.push(viaCepData.logradouro);
            if (viaCepData.bairro) parts.push(viaCepData.bairro);
            let label = '';
            if (parts.length > 0) {
              label = `${parts.join(' – ')}, ${viaCepData.localidade} – ${viaCepData.uf}`;
            } else {
              label = `${viaCepData.localidade} – ${viaCepData.uf}`;
            }
            setAddressLabel(label);
          }
        } catch {
          // Falha silenciosa
        }

        // Tracking: registrar consulta de CEP
        // Só dispara quando o CEP MUDA (não em recálculos do mesmo CEP por mudança de quantidade, etc)
        const LAST_TRACKED_CEP_KEY = "cep_last_tracked";
        const lastTrackedCep = (() => {
          try { return sessionStorage.getItem(LAST_TRACKED_CEP_KEY) || ""; } catch { return ""; }
        })();
        const alreadyTracked = lastTrackedCep === cleanCepValue;

        console.log(`📊 [CEP-TRACK] CEP ${cleanCepValue} — lastTracked: ${lastTrackedCep || "nenhum"}, alreadyTracked: ${alreadyTracked}`);

        if (alreadyTracked) {
          console.log(`⏭️ [CEP-TRACK] PULANDO tracking — CEP ${cleanCepValue} é o mesmo do último tracking`);
        } else {
          // Marcar ANTES de enviar para evitar race conditions
          try { sessionStorage.setItem(LAST_TRACKED_CEP_KEY, cleanCepValue); } catch { /* ignore */ }

          // Obter sessionId
          let sessionId: string | undefined;
          try {
            sessionId = sessionStorage.getItem("checkout_session_id") || undefined;
            if (!sessionId) {
              const sid: string =
                (window as any)?.crypto?.randomUUID?.() ??
                `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
              sessionId = sid;
              sessionStorage.setItem("checkout_session_id", sid);
            }
          } catch { /* ignore */ }

          // Dados pessoais do localStorage
          let trackEmail: string | undefined;
          let trackNome: string | undefined;
          let trackTelefone: string | undefined;
          let trackCpf: string | undefined;
          try {
            const idStr = localStorage.getItem("checkoutIdentificacao");
            if (idStr) {
              const id = JSON.parse(idStr);
              trackEmail = id.email;
              trackNome = id.nome;
              trackTelefone = id.telefone;
              trackCpf = id.cpf;
            }
          } catch { /* ignore */ }

          const w = typeof window !== "undefined" ? window.innerWidth : 1024;
          const device = w < 768 ? "mobile" : w < 1024 ? "tablet" : "desktop";
          const menorFrete = result.services[cheapestIndex];

          const origemValue = typeof window !== "undefined" && window.location.pathname.includes("/checkout/entrega")
            ? "entrega"
            : typeof window !== "undefined" && window.location.pathname.includes("/checkout/identificacao")
            ? "identificacao"
            : typeof window !== "undefined" && window.location.pathname.includes("/cart")
            ? "carrinho"
            : typeof window !== "undefined" && window.location.pathname.includes("/product")
            ? "pdp"
            : "outro";

          console.log(`✅ [CEP-TRACK] ENVIANDO tracking — CEP: ${cleanCepValue}, origem: ${origemValue}, sessionId: ${sessionId || "N/A"}`);

          ucShippingCalculate({
            cep: cleanCepValue,
            cidade: viaCepCidade,
            estado: viaCepUf,
            bairro: viaCepBairro,
            origem: origemValue,
            freteMinimo: menorFrete?.price,
            prazoMinimo: menorFrete?.deliveryTime,
            transportadora: menorFrete?.carrier,
            totalServicos: result.services.length,
          });

          fetch("/api/checkout/cep-track", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            keepalive: true,
            body: JSON.stringify({
              cep: cleanCepValue,
              bairro: viaCepBairro || null,
              cidade: viaCepCidade || null,
              estado: viaCepUf || null,
              origem: origemValue,
              sessionId,
              email: trackEmail,
              nome: trackNome,
              telefone: trackTelefone,
              cpf: trackCpf,
              freteMinimo: menorFrete?.price ?? null,
              prazoMinimo: menorFrete?.deliveryTime ?? null,
              transportadora: menorFrete?.carrier ?? null,
              totalServicos: result.services.length,
              device,
            }),
          }).then(() => {
            console.log(`💾 [CEP-TRACK] POST /api/checkout/cep-track OK — CEP: ${cleanCepValue}`);
          }).catch((err) => {
            console.warn(`❌ [CEP-TRACK] POST /api/checkout/cep-track FALHOU — CEP: ${cleanCepValue}`, err);
          });
        }
      } else {
        setError(result.error);
        // Usar valor padrão em caso de erro
        setFreightValue(DEFAULT_FREIGHT);
        setDeliveryTime('3-5 dias úteis');
        setAvailableServices([]);
        setHasCalculated(false);
      }
    } catch (err) {
      console.error('Erro ao calcular frete:', err);
      setError('Erro ao conectar com o serviço de frete. Tente novamente.');
      setFreightValue(DEFAULT_FREIGHT);
      setDeliveryTime('3-5 dias úteis');
      setAvailableServices([]);
      setHasCalculated(false);
    } finally {
      setIsLoading(false);
      calculateInFlightRef.current = null;
      console.log(`📦 [CEP-TRACK] calculateFreight FINALIZADO — CEP: ${cleanCepInput}`);
    }
  }, [availableServices, selectedServiceIndex]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const setSelectedFreight = useCallback((price: number, days: number, index?: number) => {
    setFreightValue(price);
    setDeliveryTime(`${days} ${days === 1 ? 'dia útil' : 'dias úteis'}`);
    if (index !== undefined) {
      setSelectedServiceIndex(index);
    }
  }, []);

  const resetFreight = useCallback(() => {
    setFreightValue(DEFAULT_FREIGHT);
    setDeliveryTime('3-5 dias úteis');
    setAvailableServices([]);
    setHasCalculated(false);
    setError(null);
    setSelectedServiceIndex(0);
    setAddressLabel(null);
  }, []);

  const getSelectedFreightData = useCallback(() => {
    const selectedService = availableServices[selectedServiceIndex];

    const data = {
      frete_calculado: freightValue,
      transportadora_nome: selectedService?.carrier || null,
      transportadora_servico: selectedService?.service || null,
      transportadora_prazo: selectedService?.deliveryTime || null,
    };

    console.log("📦 getSelectedFreightData chamado:", {
      freightValue,
      availableServices: availableServices.length,
      selectedServiceIndex,
      data
    });

    return data;
  }, [freightValue, availableServices, selectedServiceIndex]);

  const handleSetCep = useCallback((newCep: string) => {
    // Formatar CEP enquanto digita
    const formatted = newCep
      .replace(/\D/g, '') // Remove não números
      .slice(0, 8) // Limita a 8 dígitos
      .replace(/(\d{5})(\d)/, '$1-$2'); // Adiciona hífen

    setCep(formatted);

    const cleanCep = formatted.replace(/\D/g, '');

    // Se CEP está incompleto (menos de 8 dígitos), limpar valores de frete
    if (cleanCep.length > 0 && cleanCep.length < 8 && hasCalculated) {
      resetFreight();
    }

    // Nota: O auto-cálculo quando tiver 8 dígitos será feito pelo componente
    // que tem acesso aos itens do carrinho (FreightSection)
  }, [hasCalculated, resetFreight]);

  return {
    cep,
    setCep: handleSetCep,
    freightValue,
    deliveryTime,
    isLoading,
    error,
    calculateFreight: calculateFreightInternal,
    clearError,
    hasCalculated,
    availableServices,
    setSelectedFreight,
    resetFreight,
    getSelectedFreightData,
    selectedServiceIndex,
    addressLabel,
  };
}
