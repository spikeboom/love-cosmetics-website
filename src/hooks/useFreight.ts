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
  }>;
}

const STORAGE_KEY = 'love_cosmetics_last_cep';
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
  }>>([]);

  // Carregar último CEP usado do localStorage
  useEffect(() => {
    const savedCep = localStorage.getItem(STORAGE_KEY);
    if (savedCep) {
      setCep(savedCep);
    }
  }, []);

  // Salvar CEP no localStorage quando mudar
  useEffect(() => {
    if (FreightService.isValidCep(cep)) {
      localStorage.setItem(STORAGE_KEY, cep);
    }
  }, [cep]);

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
        // Usar o serviço mais barato
        setFreightValue(result.cheapest.price);
        setDeliveryTime(`${result.cheapest.deliveryTime} ${result.cheapest.deliveryTime === 1 ? 'dia útil' : 'dias úteis'}`);
        setAvailableServices(result.services);
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
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const handleSetCep = useCallback((newCep: string) => {
    // Formatar CEP enquanto digita
    const formatted = newCep
      .replace(/\D/g, '') // Remove não números
      .slice(0, 8) // Limita a 8 dígitos
      .replace(/(\d{5})(\d)/, '$1-$2'); // Adiciona hífen
    
    setCep(formatted);
    
    // Auto-calcular quando tiver 8 dígitos
    const cleanCep = formatted.replace(/\D/g, '');
    if (cleanCep.length === 8) {
      calculateFreightInternal(formatted);
    }
  }, [calculateFreightInternal]);

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
  };
}