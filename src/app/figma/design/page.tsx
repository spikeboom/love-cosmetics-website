import { BannerPrincipal } from "../components/BannerPrincipal";
import { CertificadosSection } from "../components/CertificadosSection";
import { CategoriasSection } from "../components/CategoriasSection";
import { VitrineSection } from "../components/VitrineSection";
import { MaisVendidosSection } from "../components/MaisVendidosSection";

export const metadata = {
  title: "Lové Cosméticos - Sua beleza natural",
  description: "Hidratação profunda, alívio das inflamações e rachaduras com produtos naturais e sustentáveis",
};

export default async function FigmaHomePage() {
  return (
    <div className="w-full max-w-[1440px] mx-auto">
      {/* Banner principal com produto em destaque */}
      <BannerPrincipal />

      {/* Cards de certificados/badges - Full width */}
      <div className="w-screen -mx-[calc((100vw-100%)/2)]">
        <CertificadosSection />
      </div>

      {/* Section 6 - Primeira vitrine de produtos com mini banners - Full width */}
      <div className="w-screen -mx-[calc((100vw-100%)/2)]">
        <VitrineSection
          titulo="Section title"
          subtitulo="Hidratação profunda, alívio das inflamações e rachaduras"
          backgroundColor="cream"
          tipo="mini-banner"
        />
      </div>

      {/* Section 7 - Segunda vitrine de produtos com mini banners */}
      <VitrineSection
        titulo="Parceiro"
        subtitulo="Hidratação profunda, alívio das inflamações e rachaduras"
        backgroundColor="white"
        tipo="mini-banner"
        showIconeTitulo={true}
      />

      {/* Seção de categorias */}
      <CategoriasSection />

      {/* Vitrine de produtos completa com navegação */}
      <VitrineSection
        titulo="Vitrine de produtos"
        subtitulo="2 linhas"
        backgroundColor="white"
        showNavigation={true}
        tipo="produto-completo"
      />

      {/* Mais vendidos - Full width cream */}
      <div className="w-screen -mx-[calc((100vw-100%)/2)] bg-[#f8f3ed]">
        <div className="w-full max-w-[1440px] mx-auto">
          <MaisVendidosSection />
        </div>
      </div>
    </div>
  );
}
