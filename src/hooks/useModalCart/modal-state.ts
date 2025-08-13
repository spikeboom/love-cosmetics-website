import { useState, useEffect } from "react";
import { useUI } from "@/core/ui/UIContext";

export function useModalState() {
  const { sidebarMounted, setSidebarMounted } = useUI();
  const animationDuration = 700;
  const [openCart, setOpenCart] = useState(false);
  const [forRefreshPage, setForRefreshPage] = useState(false);

  useEffect(() => {
    if (!openCart) {
      const timer = setTimeout(() => {
        setSidebarMounted(false);
        if (forRefreshPage) {
          // window.location.reload();
        }
      }, animationDuration);
      return () => clearTimeout(timer);
    }
  }, [openCart, animationDuration, setSidebarMounted, forRefreshPage]);

  return {
    sidebarMounted,
    setSidebarMounted,
    animationDuration,
    openCart,
    setOpenCart,
    forRefreshPage,
    setForRefreshPage
  };
}