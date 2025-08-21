"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSnackbar } from 'notistack';

interface User {
  id: string;
  email: string;
  nome: string;
  sobrenome: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/cliente/auth/verificar', {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.cliente);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/cliente/auth/entrar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.cliente);
        enqueueSnackbar('Login realizado com sucesso!', { variant: 'success' });
        router.push('/');
      } else {
        throw new Error(data.error || 'Erro ao fazer login');
      }
    } catch (error: any) {
      enqueueSnackbar(error.message || 'Erro ao fazer login', { variant: 'error' });
      throw error;
    }
  };

  const logout = async () => {
    try {
      const response = await fetch('/api/cliente/auth/sair', {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        setUser(null);
        enqueueSnackbar('Logout realizado com sucesso!', { variant: 'success' });
        router.push('/');
      } else {
        throw new Error('Erro ao fazer logout');
      }
    } catch (error: any) {
      enqueueSnackbar(error.message || 'Erro ao fazer logout', { variant: 'error' });
      throw error;
    }
  };

  return (
    <AuthContext.Provider 
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}