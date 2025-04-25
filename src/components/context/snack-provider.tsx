"use client";
import { SnackbarProvider } from "notistack";
import React, { ReactNode } from "react";

export function SnackbarProviderComponent({
  children,
}: {
  children: ReactNode;
}): React.ReactNode {
  return (
    <SnackbarProvider
      maxSnack={3}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
    >
      {children}
    </SnackbarProvider>
  );
}
