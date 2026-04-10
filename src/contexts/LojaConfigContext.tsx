"use client";
import { createContext, useContext, ReactNode } from "react";
import { FREE_SHIPPING_THRESHOLD } from "@/core/pricing/shipping-constants";

interface LojaConfig {
  freteGratisValor: number;
}

const defaultValue: LojaConfig = { freteGratisValor: FREE_SHIPPING_THRESHOLD };
const LojaConfigContext = createContext<LojaConfig>(defaultValue);

export function LojaConfigProvider({
  value,
  children,
}: {
  value: LojaConfig;
  children: ReactNode;
}) {
  return (
    <LojaConfigContext.Provider value={value}>
      {children}
    </LojaConfigContext.Provider>
  );
}

export function useLojaConfig(): LojaConfig {
  return useContext(LojaConfigContext);
}
