import { Breadcrumbs } from "../components/Breadcrumbs";
import { ProductGallery } from "../components/ProductGallery";
import { ProductInfo } from "../components/ProductInfo";
import { ProductFilters } from "../components/ProductFilters";
import { ShippingCalculator } from "../components/ShippingCalculator";
import { ProductActionButtons } from "../components/ProductActionButtons";
import { VitrineSection } from "../components/VitrineSection";

export const metadata = {
  title: "Manteiga Corporal Lové Cosméticos",
  description:
    "A manteiga corporal hidrata profundamente, alivia inflamações e rachaduras com ativos naturais da Amazônia",
};

const productImages = [
  "/new-home/produto-destaque.jpg",
  "/new-home/produto-destaque.jpg",
  "/new-home/produto-destaque.jpg",
  "/new-home/produto-destaque.jpg",
  "/new-home/produto-destaque.jpg",
];

const productFilters = [
  {
    name: "Tamanho",
    options: [
      { id: "200ml", label: "200ml" },
      { id: "400ml", label: "400ml" },
      { id: "500ml", label: "500ml" },
    ],
  },
  {
    name: "Tipo de pele",
    options: [
      { id: "seca", label: "Pele seca" },
      { id: "mista", label: "Pele mista" },
      { id: "oleosa", label: "Pele oleosa" },
      { id: "sensivel", label: "Pele sensível" },
    ],
  },
];

export default function ProductPage() {
  return (
    <div className="w-full">
      {/* Main Product Section */}
      <div className="w-full max-w-[1440px] mx-auto">
        <div className="px-[24px] py-[24px] flex gap-[48px]">
          {/* Left: Gallery and Filters */}
          <div className="flex flex-col gap-[32px] flex-1">
            {/* Gallery */}
            <ProductGallery
              images={productImages}
              productName="Manteiga Corporal Lové Cosméticos"
            />

            {/* Product Filters */}
            <ProductFilters filters={productFilters} />
          </div>

          {/* Right: Product Info and Actions */}
          <div className="w-[447px] flex flex-col gap-[32px]">
            {/* Breadcrumbs */}
            <div className="flex items-center gap-[16px] text-[12px] font-cera-pro text-[#666666]">
              <a href="/figma/design" className="hover:underline">
                lovecosmetics.com.br
              </a>
              <svg
                width="8"
                height="8"
                viewBox="0 0 8 8"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M3 1L6 4L3 7" stroke="#666666" strokeWidth="1" />
              </svg>
              <a href="/figma/search" className="hover:underline">
                todos produtos
              </a>
              <svg
                width="8"
                height="8"
                viewBox="0 0 8 8"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M3 1L6 4L3 7" stroke="#666666" strokeWidth="1" />
              </svg>
              <span>manteiga</span>
            </div>

            {/* Product Info */}
            <ProductInfo
              breadcrumbs={[]}
              title="Manteiga Corporal Lové Cosméticos"
              priceOriginal={129.99}
              price={99.99}
              discount="40% OFF"
              installments="3x R$33,33 sem juros"
              rating={4.5}
              description="A manteiga corporal hidrata profundamente, alivia as inflamações e rachaduras. Proporciona maciez imediata, alívio de inflamações de foliculite. Tratamento de rachaduras. Alívio de inflamações de foliculite. Regeneração cutânea. Fortalecimento da barreira natural de pele."
            />

            {/* Shipping Calculator */}
            <ShippingCalculator productId="manteiga-corporal" />

            {/* Action Buttons */}
            <ProductActionButtons productId="manteiga-corporal" />
          </div>
        </div>
      </div>

      {/* Related Products Section - "Você pode gostar" */}
      <div className="w-screen -mx-[calc((100vw-100%)/2)] bg-white mt-[48px]">
        <div className="w-full max-w-[1440px] mx-auto">
          <VitrineSection
            titulo="Você pode gostar"
            subtitulo=""
            backgroundColor="white"
            tipo="produto-completo"
            showNavigation={true}
          />
        </div>
      </div>

      {/* Certification Section */}
      <div className="w-screen -mx-[calc((100vw-100%)/2)] bg-[#f8f3ed] mt-[48px]">
        {/* Placeholder for certification section */}
        <div className="w-full max-w-[1440px] mx-auto px-[24px] py-[48px]">
          <div className="flex justify-between gap-[24px]">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex-1 flex flex-col gap-[16px] items-center text-center"
              >
                <div className="w-[64px] h-[64px] bg-white rounded-full flex items-center justify-center">
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 32 32"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle cx="16" cy="16" r="15" stroke="#254333" />
                  </svg>
                </div>
                <h3 className="font-cera-pro font-medium text-[14px] text-[#254333]">
                  Certificado
                </h3>
                <p className="font-cera-pro font-light text-[12px] text-[#666666]">
                  Pela Anvisa
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
