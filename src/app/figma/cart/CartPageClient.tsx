"use client";

import { useRouter } from "next/navigation";
import { useMeuContexto } from "@/components/common/Context/context";
import { VitrineSection } from "../components/VitrineSection";
import { CertificadosSection } from "../components/CertificadosSection";
import { ShippingCalculator } from "../components/ShippingCalculator";
import { CartHeader } from "./CartHeader";
import { CartProductsList } from "./CartProductsList";
import { CartCouponInput } from "./CartCouponInput";
import { CartSummary } from "./CartSummary";
import Link from "next/link";

interface CartPageClientProps {
  produtos: any[];
}

export function CartPageClient({ produtos }: CartPageClientProps) {
  const router = useRouter();
  const {
    cart,
    total,
    cupons,
    descontos,
    freight,
    addQuantityProductToCart,
    subtractQuantityProductToCart,
    removeProductFromCart,
    handleAddCupom,
    handleCupom,
  } = useMeuContexto();

  // Converter cart object para array
  const cartArray = Object.values(cart);
  const isEmpty = cartArray.length === 0;

  // Calcular subtotal (total sem frete)
  const subtotal = total - freight.freightValue;

  // Se carrinho vazio, mostrar mensagem
  if (isEmpty) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center bg-white">
        <div className="w-full flex flex-col items-center">
          <div className="max-w-[1440px] w-full px-6 py-12">
            <CartHeader />

            <div className="flex flex-col items-center justify-center gap-8 py-16">
              <div className="text-center">
                <h2 className="font-times font-bold text-[32px] text-black mb-4">
                  Seu carrinho está vazio
                </h2>
                <p className="font-cera-pro font-light text-[16px] text-[#333333] mb-8">
                  Adicione produtos ao seu carrinho para continuar
                </p>
                <Link
                  href="/figma"
                  className="inline-block bg-[#254333] text-white font-cera-pro font-bold text-[16px] px-8 py-3 rounded-lg hover:bg-[#1a2e24] transition-colors"
                >
                  Continuar Comprando
                </Link>
              </div>
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
          subtotal={subtotal}
          frete={freight.freightValue}
          cupom={descontos}
          total={total}
          onCheckout={() => router.push('/checkout')}
          isMobile={true}
        />
      </div>

      <div className="w-full flex flex-col items-center">
        <div className="max-w-[1440px] w-full">
          {/* Título */}
          <CartHeader />

          {/* Conteúdo Principal */}
          <div className="flex flex-col md:flex-row w-full self-stretch gap-8 md:gap-6 px-4 md:px-6 pb-[200px] md:pb-8 pt-4 md:pt-6">
            {/* Coluna Esquerda/Única - Produtos, Frete e Cupom */}
            <div className="flex flex-col gap-8 w-full md:w-auto">
              {/* Lista de Produtos */}
              <CartProductsList
                produtos={cartArray}
                onAdd={addQuantityProductToCart}
                onSubtract={subtractQuantityProductToCart}
                onRemove={removeProductFromCart}
              />

              {/* Frete */}
              <div className="w-full md:w-[447px]">
                <ShippingCalculator
                  title="Calcule o frete"
                  buttonLabel="Calcular"
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
            <div className="hidden md:block">
              <CartSummary
                subtotal={subtotal}
                frete={freight.freightValue}
                cupom={descontos}
                total={total}
                onCheckout={() => router.push('/checkout')}
                isMobile={false}
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
