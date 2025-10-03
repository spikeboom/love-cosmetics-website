"use client";

import { createContext, useState, useContext } from "react";

interface UIContextType {
  // Modal state
  sidebarMounted: boolean;
  setSidebarMounted: (value: boolean) => void;
  
  // Menu state  
  menuMounted: boolean;
  setMenuMounted: (value: boolean) => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const UIContextProvider = ({ children }: { children: any }) => {
  // MOVIDO EXATAMENTE do context.jsx
  const [sidebarMounted, setSidebarMounted] = useState(false);
  const [menuMounted, setMenuMounted] = useState(false);

  return (
    <UIContext.Provider
      value={{
        sidebarMounted,
        setSidebarMounted,
        menuMounted,
        setMenuMounted,
      }}
    >
      {children}
    </UIContext.Provider>
  );
};

export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error("useUI deve ser usado dentro de um UIContextProvider");
  }
  return context;
};