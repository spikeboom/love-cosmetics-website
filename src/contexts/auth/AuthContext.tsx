"use client";

import React, { createContext, useState, useContext, useEffect, useCallback } from "react";
import type { AuthContextType } from "./types";

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");

  const checkAuth = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch("/api/cliente/auth/verificar", {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        if (data.authenticated) {
          setIsLoggedIn(true);
          setUserName(data.cliente?.nome || "");
          return true;
        }
      }
      setIsLoggedIn(false);
      setUserName("");
      return false;
    } catch {
      setIsLoggedIn(false);
      setUserName("");
      return false;
    }
  }, []);

  const refreshAuth = useCallback(async () => {
    await checkAuth();
  }, [checkAuth]);

  // Verificar autenticação inicial
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const value: AuthContextType = {
    isLoggedIn,
    userName,
    refreshAuth,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
};

export { AuthContext };
