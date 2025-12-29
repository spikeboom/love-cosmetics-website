import { useState, useEffect, useCallback } from 'react';
import { FreightService } from '@/services/freight-service';
import { calculateFreightFrenet } from '@/app/actions/freight-actions';
import type { CartProduct } from './useModalCart';

interface UseFreightReturn {
  cep: string;
  setCep: (cep: string) => void;
  freightValue: number;
  deliveryTime: string;
  isLoading: boolean;
  error: string | null;
  calculateFreight: (cep: string, cartItems?: CartProduct[]) => Promise<void>;
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
        hasCalculated
      };
      localStorage.setItem(FREIGHT_DATA_KEY, JSON.stringify(freightData));
    }
  }, [freightValue, deliveryTime, availableServices, selectedServiceIndex, hasCalculated]);

  const calculateFreightInternal = useCallback(async (cepValue: string, cartItems?: CartProduct[]) => {
    if (!FreightService.isValidCep(cepValue)) {
      setError('CEP inválido. Digite um CEP com 8 dígitos.');
      return;
    }

    // Se não houver itens no carrinho, usar valores padrão
    if (!cartItems || cartItems.length === 0) {
      setError('Carrinho vazio. Adicione produtos para calcular o frete.');
      return;
    }

    setIsLoading(true);
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
        // Tentar manter o serviço selecionado anteriormente se ainda existir
        const previousService = availableServices[selectedServiceIndex];
        let newSelectedIndex = 0; // Padrão: mais barato

        if (previousService) {
          // Procurar serviço equivalente (mesmo carrier e serviceCode)
          const equivalentIndex = result.services.findIndex(
            s => s.carrier === previousService.carrier && s.serviceCode === previousService.serviceCode
          );

          if (equivalentIndex !== -1) {
            newSelectedIndex = equivalentIndex;
            console.log(`📦 Mantendo seleção do serviço: ${previousService.carrier} - ${previousService.service}`);
          } else {
            console.log(`📦 Serviço anterior não disponível, selecionando mais barato`);
          }
        }

        const selectedService = result.services[newSelectedIndex];
        setFreightValue(selectedService.price);
        setDeliveryTime(`${selectedService.deliveryTime} ${selectedService.deliveryTime === 1 ? 'dia útil' : 'dias úteis'}`);
        setAvailableServices(result.services);
        setSelectedServiceIndex(newSelectedIndex);
        setHasCalculated(true);
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
  };
}