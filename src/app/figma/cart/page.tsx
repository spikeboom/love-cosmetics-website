import { VitrineSection } from "../components/VitrineSection";
import { CertificadosSection } from "../components/CertificadosSection";
import { fetchProdutosForDesign } from "@/modules/produto/domain";
import { CartHeader } from "./CartHeader";
import { CartProductsList } from "./CartProductsList";
import { CartCouponInput } from "./CartCouponInput";
import { CartSummary } from "./CartSummary";

export const metadata = {
  title: "Carrinho - Lové Cosméticos",
};

export default async function CartPage() {
  const { data: produtos } = await fetchProdutosForDesign();

  // Pega os 3 primeiros produtos para exemplo
  const cartProdutos = produtos?.slice(0, 3) || [];

  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-white">
      {/* Título */}
      <CartHeader />

      {/* Conteúdo Principal */}
      <div className="flex w-full max-w-[1440px] self-stretch gap-6 px-6 pb-8 pt-6">
        {/* Coluna Esquerda - Produtos e Cupom */}
        <div className="flex flex-col gap-8">
          {/* Lista de Produtos */}
          <CartProductsList produtos={cartProdutos} />

          {/* Cupom */}
          <CartCouponInput />
        </div>

        {/* Coluna Direita - Resumo */}
        <CartSummary
          subtotal={299.97}
          frete={9.99}
          cupom={9.99}
        />
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
