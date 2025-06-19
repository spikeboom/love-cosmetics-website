"use client";
import { useEffect, useRef } from "react";
import { useMeuContexto } from "@/components/common/Context/context";
import { useRouter, useSearchParams } from "next/navigation";

export function AddToCart({ produto }: any) {
  const { addProductToCart, setSidebarMounted } = useMeuContexto();

  const searchParams = useSearchParams();
  const router = useRouter();

  const alreadyExecuted = useRef(false);

  useEffect(() => {
    const addToCartParam = searchParams.get("addToCart");

    if (
      !alreadyExecuted.current &&
      addToCartParam &&
      Number(addToCartParam) > 0 &&
      produto
    ) {
      alreadyExecuted.current = true;
      addProductToCart(produto);
      setSidebarMounted(true);
      router.push(window.location.pathname); // remove query
    }
  }, [searchParams, produto, addProductToCart, setSidebarMounted, router]);

  return null;
}
