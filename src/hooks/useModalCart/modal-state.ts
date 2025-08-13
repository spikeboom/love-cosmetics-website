import { useState, useEffect } from "react";

export function useModalState(setSidebarMounted: any) {
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
    animationDuration,
    openCart,
    setOpenCart,
    forRefreshPage,
    setForRefreshPage
  };
}