"use client";

import React, { createContext, useContext } from "react";
import { useFreight } from "@/deprecated/hooks/useFreight";
import type { ShippingContextType } from "./types";

const ShippingContext = createContext<ShippingContextType | null>(null);

interface ShippingProviderProps {
  children: React.ReactNode;
}

export const ShippingProvider = ({ children }: ShippingProviderProps) => {
  // Reutiliza toda a lógica do hook existente
  const freight = useFreight();

  const value: ShippingContextType = {
    cep: freight.cep,
    freightValue: freight.freightValue,
    deliveryTime: freight.deliveryTime,
    isLoading: freight.isLoading,
    error: freight.error,
    hasCalculated: freight.hasCalculated,
    availableServices: freight.availableServices,
    selectedServiceIndex: freight.selectedServiceIndex,
    setCep: freight.setCep,
    calculateFreight: freight.calculateFreight,
    clearError: freight.clearError,
    setSelectedFreight: freight.setSelectedFreight,
    resetFreight: freight.resetFreight,
    getSelectedFreightData: freight.getSelectedFreightData,
  };

  return <ShippingContext.Provider value={value}>{children}</ShippingContext.Provider>;
};

export const useShipping = (): ShippingContextType => {
  const context = useContext(ShippingContext);
  if (!context) {
    throw new Error("useShipping deve ser usado dentro de um ShippingProvider");
  }
  return context;
};

export { ShippingContext };
