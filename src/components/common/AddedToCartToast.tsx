"use client";

import { forwardRef, useCallback } from "react";
import { useSnackbar, SnackbarContent, CustomContentProps } from "notistack";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface AddedToCartToastProps extends CustomContentProps {
  productName: string;
  productImage: string;
  productPrice: number;
}

export const AddedToCartToast = forwardRef<HTMLDivElement, AddedToCartToastProps>(
  function AddedToCartToast({ id, productName, productImage, productPrice }, ref) {
    const { closeSnackbar } = useSnackbar();
    const router = useRouter();

    const handleGoToCart = useCallback(() => {
      closeSnackbar(id);
      router.push("/figma/cart");
    }, [id, closeSnackbar, router]);

    const handleDismiss = useCallback(() => {
      closeSnackbar(id);
    }, [id, closeSnackbar]);

    return (
      <SnackbarContent ref={ref} role="alert" className="mb-[80px] md:mb-0">
        <div className="bg-white rounded-[12px] shadow-[0px_4px_20px_rgba(0,0,0,0.15)] flex items-center gap-[12px] p-[12px] pr-[16px] w-[360px] max-w-[calc(100vw-32px)] relative animate-slide-up-toast">
          {/* Product Image */}
          <div className="w-[56px] h-[56px] rounded-[8px] overflow-hidden flex-shrink-0 relative bg-[#f5f5f5]">
            <Image
              src={productImage}
              alt={productName}
              fill
              className="object-cover"
              sizes="56px"
            />
          </div>

          {/* Content */}
          <div className="flex flex-col gap-[4px] flex-1 min-w-0">
            {/* Confirmation */}
            <div className="flex items-center gap-[6px]">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="8" fill="#009142" />
                <path d="M4.5 8L7 10.5L11.5 6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="font-cera-pro font-medium text-[13px] text-[#009142] leading-[1]">
                Adicionado ao carrinho
              </span>
            </div>

            {/* Product Name */}
            <p className="font-cera-pro font-medium text-[13px] text-[#333] leading-[1.3] truncate">
              {productName}
            </p>

            {/* Price */}
            <p className="font-cera-pro font-bold text-[14px] text-black leading-[1]">
              R$ {productPrice.toFixed(2).replace(".", ",")}
            </p>
          </div>

          {/* CTA Button */}
          <button
            onClick={handleGoToCart}
            className="flex-shrink-0 bg-[#254333] hover:bg-[#1a3025] text-white font-cera-pro font-medium text-[12px] px-[12px] py-[8px] rounded-[6px] transition-colors duration-200 leading-[1]"
          >
            Ver carrinho
          </button>

          {/* Close Button */}
          <button
            onClick={handleDismiss}
            className="absolute top-[6px] right-[6px] w-[20px] h-[20px] flex items-center justify-center text-[#999] hover:text-[#333] transition-colors"
            aria-label="Fechar"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M9 3L3 9M3 3L9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </SnackbarContent>
    );
  }
);
