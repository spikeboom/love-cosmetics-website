"use client";

/**
 * DESATIVADO: Este componente estava causando loop infinito de requisições.
 *
 * Problema: Quando qualquer fetch falha (ex: rate limit 503), o interceptor
 * de fetch detecta o erro e chama sendErrorToServer(), que faz outro fetch
 * para /api/log-client-error. Se esse fetch também falha (rate limit),
 * dispara outro erro, criando um loop infinito que consome todo o rate limit
 * e derruba o site.
 *
 * Solução futura: Se reativar, adicionar:
 * 1. Verificar se a URL é /api/log-client-error antes de logar (evitar loop)
 * 2. Usar navigator.sendBeacon() em vez de fetch (não dispara erros)
 * 3. Implementar debounce/throttle nos logs
 * 4. Limitar quantidade de erros enviados por sessão
 */

export default function MyLogFrontError() {
  // Componente desativado - retorna vazio
  return <></>;
}

// import { useEffect } from "react";
//
// export default function MyLogFrontError() {
//   useEffect(() => {
//     // Captura erros JS
//     window.onerror = (message, source, lineno, colno, error) => {
//       sendErrorToServer({
//         type: "onerror",
//         message: String(message),
//         source: String(source),
//         lineno,
//         colno,
//         stack: error?.stack || null,
//       });
//     };
//
//     // Captura Promises não tratadas
//     window.onunhandledrejection = (event) => {
//       sendErrorToServer({
//         type: "unhandledrejection",
//         message: event.reason?.message || String(event.reason),
//         stack: event.reason?.stack || null,
//       });
//     };
//
//     // Intercepta todos os fetch
//     const originalFetch = window.fetch;
//     window.fetch = async (...args) => {
//       try {
//         const response = await originalFetch(...args);
//
//         if (!response.ok) {
//           const errorData = {
//             type: "fetch-response-error",
//             url: String(args[0]),
//             status: response.status,
//             statusText: response.statusText,
//           };
//
//           console.warn("[Erro de rota ou HTTP]", errorData);
//           sendErrorToServer(errorData);
//         }
//
//         return response;
//       } catch (error) {
//         const errorData = {
//           type: "fetch-network-error",
//           url: String(args[0]),
//           // @ts-ignore
//           message: error?.message || String(error),
//           // @ts-ignore
//           stack: error?.stack || null,
//         };
//
//         console.error("[Erro fatal em fetch]", errorData);
//         sendErrorToServer(errorData);
//
//         throw error;
//       }
//     };
//   }, []);
//
//   return <></>;
// }
//
// function sendErrorToServer(errorData: any) {
//   fetch("/api/log-client-error", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({
//       ...errorData,
//       userAgent: navigator.userAgent,
//       url: window.location.href,
//       timestamp: Date.now(),
//     }),
//   });
// }
