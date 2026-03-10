"use client";

import { useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { useCart, useCoupon, useShipping, useCartTotals } from "@/contexts";
import { VitrineSection } from "../components/VitrineSection";
import { CertificadosSection } from "../components/CertificadosSection";
import { ShippingCalculator } from "../components/ShippingCalculator";
import { CartHeader } from "./CartHeader";
import { CartProductsList } from "./CartProductsList";
import { CartCouponInput } from "./CartCouponInput";
import { CartSummary } from "./CartSummary";
import { CartLoadingSkeleton } from "@/components/cart/CartLoadingSkeleton";
import Link from "next/link";
import { ucBeginCheckout, ucViewCart } from "../../../_tracking/uc-ecommerce";

function getCupomCodigo(cupom: unknown): string | undefined {
  if (!cupom || typeof cupom !== "object") return undefined;
  const codigo = (cupom as Record<string, unknown>).codigo;
  return typeof codigo === "string" ? codigo : undefined;
}

interface CartPageClientProps {
  produtos: unknown[];
}

export function CartPageClient({ produtos }: CartPageClientProps) {
  const router = useRouter();
  const firedViewCartRef = useRef(false);

  // Novos hooks segmentados
  const { cart, addQuantityProductToCart, subtractQuantityProductToCart, removeProductFromCart, isCartLoaded } = useCart();
  const { cupons, handleAddCupom, handleCupom } = useCoupon();
  const { freightValue, hasCalculated } = useShipping();
  const { total, isValid, isValidating, validateCart, produtosDesatualizados, refreshCartPrices } = useCartTotals();

  // Validar carrinho ao carregar a página
  useEffect(() => {
    const cartItems = Object.keys(cart);
    if (cartItems.length > 0 && isValid === null && !isValidating) {
      validateCart(cart, cupons);
    }
  }, [cart, cupons, isValid, isValidating, validateCart]);

  // Converter cart object para array
  const cartArray = Object.values(cart) as unknown[];
  const isEmpty = cartArray.length === 0;

  const cartItemsForTracking = useMemo(
    () =>
      cartArray.map((raw, index) => {
        const p = raw as {
          id?: unknown;
          nome?: unknown;
          preco?: unknown;
          quantity?: unknown;
        };

        return {
          item_id: String(p.id ?? "unknown"),
          item_name: String(p.nome ?? "Produto"),
          price: typeof p.preco === "number" ? p.preco : Number(p.preco ?? 0),
          quantity: typeof p.quantity === "number" ? p.quantity : Number(p.quantity ?? 1),
          index,
        };
      }),
    [cartArray]
  );

  useEffect(() => {
    if (!isCartLoaded) return;
    if (firedViewCartRef.current) return;
    firedViewCartRef.current = true;

    ucViewCart({
      items: cartItemsForTracking,
      value: total,
    });
  }, [isCartLoaded, cartItemsForTracking, total]);

  const handleCheckout = () => {
    ucBeginCheckout({
      items: cartItemsForTracking,
      value: total,
      coupon: cupons?.map(getCupomCodigo).filter(Boolean).join(",") || undefined,
      shipping: freightValue,
    });
    router.push("/figma/checkout");
  };

  // Mostrar loading enquanto carrega do localStorage
  if (!isCartLoaded) {
    return <CartLoadingSkeleton />;
  }

  // Se carrinho vazio, mostrar mensagem
  if (isEmpty) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center bg-white">
        <div className="w-full flex flex-col items-center">
          <div className="max-w-[1440px] w-full px-6 py-12">
            <CartHeader />

            <div className="flex flex-col items-center justify-center gap-4 py-16">
              {/* Ícone carrinho */}
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <path d="M14 36c-2.2 0-3.98 1.8-3.98 4s1.78 4 4 4 4-1.8 4-4-1.8-4-4.02-4zM2 4v4h4l7.2 15.17-2.7 4.9C10.18 28.67 10 29.33 10 30c0 2.2 1.8 4 4 4h24v-4H15.08c-.28 0-.52-.22-.52-.5l.06-.24L16.4 26h14.9c1.5 0 2.82-.83 3.5-2.06l7.16-12.98c.16-.28.24-.62.24-.96 0-1.1-.9-2-2-2H10.44l-1.9-4H2zm32 32c-2.2 0-3.98 1.8-3.98 4s1.78 4 4 4 4-1.8 4-4-1.8-4-4.02-4z" fill="#B3261E"/>
              </svg>

              {/* Textos */}
              <div className="flex flex-col items-center gap-4">
                <p className="font-cera-pro font-light text-[20px] text-[#B3261E] text-center leading-[normal]">
                  Seu carrinho está vazio.
                </p>
                <p className="font-cera-pro font-bold text-[20px] text-[#B3261E] text-center leading-[normal]">
                  Aproveite o melhor da Amazônia!
                </p>
              </div>

              {/* Botão continuar comprando */}
              <Link
                href="/figma"
                className="mt-4 inline-block bg-[#254333] text-white font-cera-pro font-bold text-[16px] px-8 py-3 rounded-lg hover:bg-[#1a2e24] transition-colors"
              >
                Continuar Comprando
              </Link>
            </div>
          </div>
        </div>

        <div className="w-full bg-[#f8f3ed]">
          {/* Seção de Recomendações */}
          <div className="w-full flex flex-row justify-center">
            <div className="w-full max-w-[1440px] mx-auto">
              <VitrineSection
                titulo="Você pode gostar"
                backgroundColor="cream"
                showNavigation={true}
                tipo="produto-completo"
                produtos={produtos}
                showVerTodos={false}
              />
            </div>
          </div>

          {/* Seção de Certificados */}
          <div className="w-full flex flex-row justify-center">
            <div className="w-full max-w-[1440px] mx-auto">
              <CertificadosSection />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Carrinho com produtos
  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-white md:relative">
      {/* Mobile: Resumo Fixo no Bottom (Bottom Sheet) - Hidden no Desktop */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40">
        <CartSummary
          cartItems={cartArray}
          frete={freightValue}
          cupons={cupons}
          total={total}
          onCheckout={handleCheckout}
          isMobile={true}
          freteCalculado={hasCalculated}
          isCartValid={isValid}
          isValidating={isValidating}
          onRefreshCart={refreshCartPrices}
        />
      </div>

      <div className="w-full flex flex-col items-center">
        <div className="max-w-[1440px] w-full">
          {/* Título */}
          <CartHeader />

          {/* Conteúdo Principal */}
          <div className="flex flex-col md:flex-row w-full self-stretch gap-8 md:gap-6 px-4 md:px-6 pb-8 pt-4 md:pt-6">
            {/* Coluna Esquerda/Única - Produtos, Frete e Cupom */}
            <div className="flex flex-col gap-8 w-full md:flex-1 md:min-w-0">
              {/* Lista de Produtos */}
              <CartProductsList
                produtos={cartArray}
                cupons={cupons}
                onAdd={addQuantityProductToCart}
                onSubtract={subtractQuantityProductToCart}
                onRemove={removeProductFromCart}
                produtosDesatualizados={produtosDesatualizados}
              />

              {/* Frete */}
              <div className="w-full md:max-w-[447px]">
                <ShippingCalculator
                  title="Consultar prazo"
                  buttonLabel="Consultar"
                  placeholder="Digite seu CEP"
                  inputFontSize="large"
                  width="full"
                />
              </div>

              {/* Cupom */}
              <CartCouponInput
                onApply={handleAddCupom}
                onRemove={handleCupom}
                cupons={cupons}
              />
            </div>

            {/* Coluna Direita - Resumo (Hidden no Mobile) */}
            <div className="hidden md:block md:w-[30%] md:max-w-[447px]">
              <CartSummary
                cartItems={cartArray}
                frete={freightValue}
                cupons={cupons}
                total={total}
                onCheckout={handleCheckout}
                isMobile={false}
                freteCalculado={hasCalculated}
                isCartValid={isValid}
                isValidating={isValidating}
                onRefreshCart={refreshCartPrices}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="w-full bg-[#f8f3ed]">
        {/* Seção de Recomendações - Full width */}
        <div className="w-full flex flex-row justify-center">
          <div className="w-full max-w-[1440px] mx-auto">
            <VitrineSection
              titulo="Recomendações para você"
              backgroundColor="cream"
              showNavigation={true}
              tipo="produto-completo"
              produtos={produtos}
              showVerTodos={false}
            />
          </div>
        </div>

        {/* Seção de Horizontal Cards - Full width */}
        <div className="w-full flex flex-row justify-center">
          <div className="w-full max-w-[1440px] mx-auto">
            <CertificadosSection />
          </div>
        </div>
      </div>
    </div>
  );
}
