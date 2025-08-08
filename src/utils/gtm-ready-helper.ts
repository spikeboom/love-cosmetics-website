export interface GASessionData {
  ga_session_id: string;
  ga_session_number: number;
}

declare global {
  interface Window {
    google_tag_manager?: any;
    gtag?: (...args: any[]) => void;
  }
}

export async function waitForGTMReady(
  measurementId: string = "G-SXLFK0Y830",
  maxRetries: number = 4,
  delay: number = 500
): Promise<GASessionData> {
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    // Verificar se GTM inicializou
    if (typeof window !== 'undefined' && window.google_tag_manager && window.gtag) {
      
      // Método 1: Tentar obter session_id via gtag
      try {
        const sessionId = await new Promise<string | null>(resolve => {
          if (window.gtag) {
            window.gtag('get', measurementId, 'session_id', (value: string) => {
              resolve(value || null);
            });
            // Timeout rápido para não travar
            setTimeout(() => resolve(null), 200);
          } else {
            resolve(null);
          }
        });
        
        if (sessionId && sessionId !== '0') {
          console.log('✅ GTM session_id obtido via gtag:', sessionId);
          return { 
            ga_session_id: sessionId, 
            ga_session_number: 1 
          };
        }
      } catch (error) {
        console.log('⚠️ gtag method failed:', error);
      }
      
      // Método 2: Fallback para cookie
      try {
        const { extractGaSessionData } = await import('./get-ga-cookie-info');
        const cookieData = extractGaSessionData(measurementId);
        
        if (cookieData.ga_session_id && cookieData.ga_session_id !== '0') {
          console.log('✅ GTM session_id obtido via cookie:', cookieData.ga_session_id);
          return {
            ga_session_id: cookieData.ga_session_id,
            ga_session_number: Number(cookieData.ga_session_number) || 1
          };
        }
      } catch (error) {
        console.log('⚠️ Cookie method failed:', error);
      }
    }
    
    // Se não conseguiu, aguardar mais um pouco
    if (attempt < maxRetries - 1) {
      console.log(`🕐 Aguardando GTM inicializar... tentativa ${attempt + 1}/${maxRetries}`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  // Fallback final: session_id temporário
  const fallbackId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  console.warn('⚠️ GTM não inicializou completamente, usando session_id temporário:', fallbackId);
  
  return {
    ga_session_id: fallbackId,
    ga_session_number: 1
  };
}