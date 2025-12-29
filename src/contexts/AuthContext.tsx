"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSnackbar } from 'notistack';
import { createCloseAction } from '@/utils/snackbar-helpers';

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
  isLoggedIn: boolean; // Alias para compatibilidade
  userName: string; // Alias para compatibilidade
  login: (email: string, password: string, redirectTo?: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  refreshAuth: () => Promise<void>; // Alias para compatibilidade
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
        
        if (data.authenticated && data.cliente) {
          setUser({
            id: data.cliente.id,
            email: data.cliente.email,
            nome: data.cliente.nome,
            sobrenome: data.cliente.sobrenome,
          });
        } else {
          setUser(null);
        }
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

  const login = async (email: string, password: string, redirectTo: string = '/') => {
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
        setUser({
          id: data.cliente.id,
          email: data.cliente.email,
          nome: data.cliente.nome,
          sobrenome: data.cliente.sobrenome,
        });
        enqueueSnackbar('Login realizado com sucesso!', { 
          variant: 'success',
          action: createCloseAction
        });
        router.push(redirectTo);
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
        enqueueSnackbar('Logout realizado com sucesso!', { 
          variant: 'success',
          action: createCloseAction
        });
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
        isLoggedIn: !!user, // Alias para compatibilidade
        userName: user?.nome || '', // Alias para compatibilidade
        login,
        logout,
        checkAuth,
        refreshAuth: checkAuth, // Alias para compatibilidade
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