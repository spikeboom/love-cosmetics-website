import { useState, useEffect, useCallback } from 'react';
import { FreightService } from '@/services/freight-service';
import { calculateFreight } from '@/app/actions/freight-actions';

interface UseFreightReturn {
  cep: string;
  setCep: (cep: string) => void;
  freightValue: number;
  deliveryTime: string;
  isLoading: boolean;
  error: string | null;
  calculateFreight: (cep: string) => Promise<void>;
  clearError: () => void;
  hasCalculated: boolean;
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

  // Carregar último CEP usado do localStorage
  useEffect(() => {
    const savedCep = localStorage.getItem(STORAGE_KEY);
    if (savedCep) {
      setCep(savedCep);
      // Calcular frete automaticamente se tiver CEP salvo
      if (FreightService.isValidCep(savedCep)) {
        calculateFreightInternal(savedCep);
      }
    }
  }, []);

  // Salvar CEP no localStorage quando mudar
  useEffect(() => {
    if (FreightService.isValidCep(cep)) {
      localStorage.setItem(STORAGE_KEY, cep);
    }
  }, [cep]);

  const calculateFreightInternal = useCallback(async (cepValue: string) => {
    if (!FreightService.isValidCep(cepValue)) {
      setError('CEP inválido. Digite um CEP com 8 dígitos.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await calculateFreight(cepValue);
      
      if ('Sucesso' in result) {
        const valor = parseFloat(result.Sucesso.valor);
        setFreightValue(isNaN(valor) ? DEFAULT_FREIGHT : valor);
        setDeliveryTime(FreightService.formatDeliveryTime(result.Sucesso.tempo));
        setHasCalculated(true);
        
        // Se houver observação sobre CEP fora da faixa
        if (result.Sucesso.obs) {
          console.warn('Aviso do serviço de frete:', result.Sucesso.obs);
        }
      } else {
        // Tratar erros específicos da API
        let errorMessage = 'Erro ao calcular frete.';
        
        switch (result.Erro) {
          case 'Token nao confere':
            errorMessage = 'Erro de configuração. Entre em contato com o suporte.';
            break;
          case 'Codigo do cliente nao confere':
            errorMessage = 'Erro de configuração. Entre em contato com o suporte.';
            break;
          case 'Para o tipo de calculo (tipoCalculo) não existe configuração.':
            errorMessage = 'CEP fora da área de entrega.';
            break;
          default:
            errorMessage = result.Erro || 'Erro ao calcular frete. Tente novamente.';
        }
        
        setError(errorMessage);
        // Usar valor padrão em caso de erro
        setFreightValue(DEFAULT_FREIGHT);
        setDeliveryTime('3-5 dias úteis');
        setHasCalculated(false);
      }
    } catch (err) {
      console.error('Erro ao calcular frete:', err);
      setError('Erro ao conectar com o serviço de frete. Tente novamente.');
      setFreightValue(DEFAULT_FREIGHT);
      setDeliveryTime('3-5 dias úteis');
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
  };
}