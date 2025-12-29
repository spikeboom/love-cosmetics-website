import { useCallback } from "react";
import { useNotifications } from "@/core/notifications/NotificationContext";

interface UseShareProductOptions {
  productName: string;
}

export function useShareProduct({ productName }: UseShareProductOptions) {
  const { notify } = useNotifications();

  const handleShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: productName,
          text: `Confira ${productName} na Love Cosmeticos!`,
          url: window.location.href,
        });
      } catch (error) {
        // Usuario cancelou ou erro ao compartilhar
        console.log("Compartilhamento cancelado");
      }
    } else {
      // Fallback: copiar link
      navigator.clipboard.writeText(window.location.href);
      notify("Link copiado para a area de transferencia!", { variant: "success" });
    }
  }, [productName, notify]);

  return { handleShare };
}
