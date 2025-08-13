import { createElement } from "react";
import { IoCloseCircle } from "react-icons/io5";

// MOVIDO do context.jsx linhas 126-143
// NOTA: Transformado em factory function pois precisa de enqueueSnackbar e closeSnackbar
export const createNotify = (enqueueSnackbar: any, closeSnackbar: any) => {
  return (message: string, { variant = "default", persist = false }: any = {}) => {
    return enqueueSnackbar(message, {
      variant,
      persist,
      action: (key: any) => 
        createElement("button", {
          onClick: () => closeSnackbar(key),
          style: {
            background: "transparent",
            border: "none",
            cursor: "pointer",
          }
        }, createElement(IoCloseCircle, { size: 20 })),
    });
  };
};