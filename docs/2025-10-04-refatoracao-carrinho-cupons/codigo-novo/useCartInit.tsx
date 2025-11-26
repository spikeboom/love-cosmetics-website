import React, { useEffect } from 'react';
import { cleanupOldSystem, showResetNotification } from './cleanup-old-system';

/**
 * Hook para inicialização do sistema de carrinho
 * - Executa limpeza automática do sistema antigo
 * - Mostra notificação para usuários sobre reset
 * - Inicializa novo sistema de carrinho
 */
export function useCartInit() {
  useEffect(() => {
    // Executa limpeza do sistema antigo
    const cleanupSuccess = cleanupOldSystem();
    
    if (cleanupSuccess) {
      // Mostra notificação sobre reset (apenas uma vez por usuário)
      showResetNotification();
    }
    
    // Aqui você pode adicionar outras inicializações necessárias
    // como carregar carrinho salvo do novo sistema, etc.
    
  }, []);
}

/**
 * Componente wrapper que executa limpeza automática
 * Use este componente no layout principal ou App.tsx
 */
export function CartSystemInitializer({ children }: { children: React.ReactNode }) {
  useCartInit();
  
  return <>{children}</>;
}

/**
 * Hook mais específico para desenvolvimento/debug
 * Permite controle manual sobre o processo de limpeza
 */
export function useCartInitDev(options: {
  autoCleanup?: boolean;
  showNotification?: boolean;
  forceReset?: boolean;
} = {}) {
  const {
    autoCleanup = true,
    showNotification = true,
    forceReset = false
  } = options;

  useEffect(() => {
    if (forceReset) {
      localStorage.removeItem('system_reset_v2');
      localStorage.removeItem('reset_notification_shown');
    }

    if (autoCleanup) {
      const cleanupSuccess = cleanupOldSystem();
      
      if (cleanupSuccess && showNotification) {
        showResetNotification();
      }
    }
  }, [autoCleanup, showNotification, forceReset]);
}