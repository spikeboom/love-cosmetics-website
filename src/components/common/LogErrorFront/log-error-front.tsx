"use client";
import { useEffect } from "react";

export default function MyLogFrontError() {
  useEffect(() => {
    // Captura erros JS
    window.onerror = (message, source, lineno, colno, error) => {
      sendErrorToServer({
        type: "onerror",
        message: String(message),
        source: String(source),
        lineno,
        colno,
        stack: error?.stack || null,
      });
    };

    // Captura Promises não tratadas
    window.onunhandledrejection = (event) => {
      sendErrorToServer({
        type: "unhandledrejection",
        message: event.reason?.message || String(event.reason),
        stack: event.reason?.stack || null,
      });
    };

    // Intercepta todos os fetch
    // Intercepta todos os fetch
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args);

        if (!response.ok) {
          const errorData = {
            type: "fetch-response-error",
            url: String(args[0]),
            status: response.status,
            statusText: response.statusText,
          };

          console.warn("[Erro de rota ou HTTP]", errorData);
          sendErrorToServer(errorData);
        }

        return response;
      } catch (error) {
        const errorData = {
          type: "fetch-network-error",
          url: String(args[0]),
          // @ts-ignore
          message: error?.message || String(error),
          // @ts-ignore
          stack: error?.stack || null,
        };

        console.error("[Erro fatal em fetch]", errorData);
        sendErrorToServer(errorData);

        throw error;
      }
    };
  }, []);

  return <></>;
}

function sendErrorToServer(errorData: any) {
  fetch("/api/log-client-error", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...errorData,
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: Date.now(),
    }),
  });
}
