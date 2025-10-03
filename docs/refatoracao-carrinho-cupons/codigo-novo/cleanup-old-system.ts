/**
 * Utilitário para limpeza automática do sistema antigo de carrinho e cupons
 * Remove dados antigos (localStorage, cookies) para evitar conflitos
 */

import React from 'react';

export function cleanupOldSystem(): boolean {
  try {
    // Flag para verificar se já foi executada
    const isResetDone = localStorage.getItem('system_reset_v2');
    
    if (isResetDone) {
      return true; // Já foi executada
    }

    // Remove localStorage antigo
    const oldKeys = ['cart', 'cupons'];
    oldKeys.forEach(key => {
      if (localStorage.getItem(key)) {
        localStorage.removeItem(key);
        console.log(`Removido localStorage antigo: ${key}`);
      }
    });

    // Remove cookies antigos
    const oldCookies = ['cupomBackend', 'cupom'];
    oldCookies.forEach(cookieName => {
      if (document.cookie.includes(cookieName)) {
        document.cookie = `${cookieName}=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
        console.log(`Removido cookie antigo: ${cookieName}`);
      }
    });

    // Marca como executada para não rodar novamente
    localStorage.setItem('system_reset_v2', 'true');
    localStorage.setItem('system_reset_date', new Date().toISOString());
    
    console.log('✅ Sistema antigo limpo com sucesso');
    return true;

  } catch (error) {
    console.error('❌ Erro ao limpar sistema antigo:', error);
    return false;
  }
}

/**
 * Hook para executar limpeza automática na inicialização
 * Deve ser chamado no componente raiz ou layout principal
 */
export function useSystemCleanup() {
  React.useEffect(() => {
    cleanupOldSystem();
  }, []);
}

/**
 * Função para mostrar notificação sobre reset do sistema
 * Informa o usuário que o carrinho foi limpo
 */
export function showResetNotification() {
  const hasShown = localStorage.getItem('reset_notification_shown');
  
  if (!hasShown) {
    // Usar toast library do projeto (react-hot-toast, react-toastify, etc)
    // toast.info(
    //   'Atualizamos nosso sistema de carrinho! Seu carrinho foi limpo para garantir a melhor experiência.',
    //   { duration: 5000 }
    // );
    
    // Fallback para projetos sem toast
    console.info('🔄 Sistema de carrinho atualizado - dados antigos foram limpos');
    
    localStorage.setItem('reset_notification_shown', 'true');
  }
}

/**
 * Função para verificar se dados antigos existem (útil para testes)
 */
export function hasOldSystemData(): boolean {
  // Verifica se reset já foi executado
  const isResetDone = localStorage.getItem('system_reset_v2');
  if (isResetDone) {
    return false; // Reset já executado, não há dados antigos
  }

  const hasOldLocalStorage = !!(
    localStorage.getItem('cart') || 
    localStorage.getItem('cupons')
  );
  
  const hasOldCookies = !!(
    document.cookie.includes('cupomBackend') || 
    document.cookie.includes('cupom')
  );

  return hasOldLocalStorage || hasOldCookies;
}

/**
 * Função para forçar reset completo (útil para desenvolvimento/debug)
 */
export function forceSystemReset() {
  localStorage.removeItem('system_reset_v2');
  localStorage.removeItem('reset_notification_shown');
  cleanupOldSystem();
  showResetNotification();
}