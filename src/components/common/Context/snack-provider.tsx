"use client";
import { SnackbarProvider } from "notistack";
import React, { ReactNode } from "react";
import { AddedToCartToast } from "../AddedToCartToast";

declare module "notistack" {
  interface VariantOverrides {
    addedToCart: {
      productName: string;
      productImage: string;
      productPrice: number;
    };
  }
}

export function SnackbarProviderComponent({
  children,
}: {
  children: ReactNode;
}): React.ReactNode {
  return (
    <SnackbarProvider
      maxSnack={3}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      Components={{
        addedToCart: AddedToCartToast,
      }}
    >
      {children}
    </SnackbarProvider>
  );
}
