"use client";

import React, { createContext, useState, useContext, useEffect, useCallback } from "react";
import { handleCupom as handleCupomUtil, handleAddCupom as handleAddCupomUtil } from "@/utils/coupon-operations";
import { StorageService } from "@/core/storage/storage-service";
import { useNotifications } from "@/core/notifications/NotificationContext";
import type { Coupon, CouponContextType } from "./types";

const CouponContext = createContext<CouponContextType | null>(null);

interface CouponProviderProps {
  children: React.ReactNode;
  cart?: Record<string, any>; // Recebe cart do CartContext
  setCart?: React.Dispatch<React.SetStateAction<Record<string, any>>>; // Para atualizar preços com cupom
}

export const CouponProvider = ({ children, cart = {}, setCart }: CouponProviderProps) => {
  const [cupons, setCupons] = useState<Coupon[]>([]);
  const { notify, closeSnackbar } = useNotifications();

  // Carregar cupons do localStorage
  useEffect(() => {
    const initialData = StorageService.initializeFromStorage();
    setCupons(initialData.cupons || []);
  }, []);

  const handleCupom = useCallback((cupom: Coupon) => {
    if (setCart) {
      handleCupomUtil(cupom, cupons, setCupons, cart, setCart);
    }
  }, [cupons, cart, setCart]);

  const handleAddCupom = useCallback(async (codigo: string) => {
    await handleAddCupomUtil(codigo, cupons, notify, closeSnackbar, handleCupom);
  }, [cupons, notify, closeSnackbar, handleCupom]);

  const clearCupons = useCallback(() => {
    setCupons([]);
    localStorage.removeItem("cupons");
  }, []);

  const value: CouponContextType = {
    cupons,
    setCupons,
    handleCupom,
    handleAddCupom,
    clearCupons,
  };

  return <CouponContext.Provider value={value}>{children}</CouponContext.Provider>;
};

export const useCoupon = (): CouponContextType => {
  const context = useContext(CouponContext);
  if (!context) {
    throw new Error("useCoupon deve ser usado dentro de um CouponProvider");
  }
  return context;
};

export { CouponContext };
