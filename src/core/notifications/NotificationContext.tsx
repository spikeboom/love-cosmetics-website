"use client";

import { createContext, useContext } from "react";
import { useSnackbar } from "notistack";
import { createNotify } from "./notification-system";

interface NotificationContextType {
  notify: (message: string, options?: any) => void;
  enqueueSnackbar: any;
  closeSnackbar: any;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: any }) => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  
  // Usar a função notify movida para core/notifications
  const notify = createNotify(enqueueSnackbar, closeSnackbar);

  return (
    <NotificationContext.Provider
      value={{
        notify,
        enqueueSnackbar,
        closeSnackbar,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications deve ser usado dentro de um NotificationProvider");
  }
  return context;
};