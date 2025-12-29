export interface FreightService {
  carrier: string;
  service: string;
  price: number;
  deliveryTime: number;
  serviceCode: string;
}

export interface ShippingState {
  cep: string;
  freightValue: number;
  deliveryTime: string;
  isLoading: boolean;
  error: string | null;
  hasCalculated: boolean;
  availableServices: FreightService[];
  selectedServiceIndex: number;
}

export interface ShippingOperations {
  setCep: (cep: string) => void;
  calculateFreight: (cep: string, cartItems?: any[]) => Promise<void>;
  clearError: () => void;
  setSelectedFreight: (price: number, deliveryTime: number, index?: number) => void;
  resetFreight: () => void;
  getSelectedFreightData: () => {
    frete_calculado: number;
    transportadora_nome: string | null;
    transportadora_servico: string | null;
    transportadora_prazo: number | null;
  };
}

export interface ShippingContextType extends ShippingState, ShippingOperations {}
