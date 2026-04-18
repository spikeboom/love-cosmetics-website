import dynamic from "next/dynamic";
import { BannerPrincipal } from "../components/BannerPrincipal";
import { CertificadosSection } from "../components/CertificadosSection";
import { ElogiouWidget } from "../components/ElogiouWidget";
import { fetchProdutosForSearch } from "@/modules/produto/domain";
import { fetchBannersHome } from "@/lib/cms/directus/banners";
import { fetchInstagramPosts } from "@/lib/cms/directus/instagram";
import { fetchDepoimentos } from "@/lib/cms/directus/depoimentos";

const InstagramCarousel = dynamic(() =>
  import("../components/InstagramCarousel").then((m) => m.InstagramCarousel),
  { loading: () => <div className="w-full h-[360px]" /> }
);
const VitrineSection = dynamic(() =>
  import("../components/VitrineSection").then((m) => m.VitrineSection),
  { loading: () => <div className="w-full h-[480px]" /> }
);

export const metadata = {
  title: "Lové Cosméticos - Sua beleza natural",
  description: "Hidratação profunda, alívio das inflamações e rachaduras com produtos naturais e sustentáveis",
};

// Função para ordenar produtos por lista de termos
function ordenarProdutos(produtos: any[], ordem: string[]) {
  return [...produtos].sort((a, b) => {
    const nomeA = a.nome?.toLowerCase() || "";
    const nomeB = b.nome?.toLowerCase() || "";
    const indexA = ordem.findIndex(termo => nomeA.includes(termo.toLowerCase()));
    const indexB = ordem.findIndex(termo => nomeB.includes(termo.toLowerCase()));
    // Se não encontrou, coloca no final
    const posA = indexA === -1 ? 999 : indexA;
    const posB = indexB === -1 ? 999 : indexB;
    return posA - posB;
  });
}

export default async function FigmaHomePage() {
  const [
    banners,
    instagramPosts,
    depoimentos,
    rotinaResult,
    kitsResult,
    tecnologiaResult,
  ] = await Promise.all([
    fetchBannersHome(),
    fetchInstagramPosts(),
    fetchDepoimentos(),
    fetchProdutosForSearch({ termos: ["espuma", "sérum", "serum", "hidratante"] }),
    fetchProdutosForSearch({ termos: ["kit"] }),
    fetchProdutosForSearch({ termos: ["máscara", "mascara", "manteiga"] }),
  ]);

  const rotinaOrdenados = ordenarProdutos(rotinaResult.data || [], ["espuma", "sérum", "serum", "hidratante"]);
  const kitsOrdenados = ordenarProdutos(kitsResult.data || [], ["kit uso diário", "kit full"]);
  const tecnologiaOrdenados = ordenarProdutos(tecnologiaResult.data || [], ["manteiga", "máscara", "mascara"]);

  const heroBanner = banners[0];

  return (
    <div className="w-full max-w-[1440px] mx-auto">
      {heroBanner && (
        <>
          {heroBanner.imagemMobile && (
            <link
              rel="preload"
              as="image"
              href={heroBanner.imagemMobile}
              media="(max-width: 1023px)"
              fetchPriority="high"
            />
          )}
          <link
            rel="preload"
            as="image"
            href={heroBanner.imagemDesktop}
            media="(min-width: 1024px)"
            fetchPriority="high"
          />
        </>
      )}
      {/* Banner principal com produto em destaque */}
      <BannerPrincipal slides={banners} />

      {/* Carrossel Instagram */}
      <div className="w-screen -mx-[calc((100vw-100%)/2)]">
        <InstagramCarousel posts={instagramPosts} />
      </div>

      {/* Avaliações Elogiou */}
      <div className="w-full py-4">
        <ElogiouWidget depoimentos={depoimentos} />
      </div>

      {/* Vitrine 1 - Comece sua rotina Lovè */}
      <div className="w-screen -mx-[calc((100vw-100%)/2)]">
        <VitrineSection
          titulo="Comece a sua rotina Lovè"
          subtitulo="Três passos para uma pele equilibrada, saudável e inteligente."
          backgroundColor="cream"
          tipo="produto-completo"
          produtos={rotinaOrdenados}
        />
      </div>

      {/* Vitrine 2 - Kits Lovè */}
      <VitrineSection
        titulo="Kits Lovè"
        subtitulo="Rotinas completas com mais benefícios e melhor custo."
        backgroundColor="white"
        tipo="produto-completo"
        produtos={kitsOrdenados}
      />

      {/* Vitrine 3 - Tecnologia & Amazônia */}
      <VitrineSection
        titulo="Tecnologia & Amazônia"
        backgroundColor="white"
        showNavigation={true}
        tipo="produto-completo"
        produtos={tecnologiaOrdenados}
      />

      {/* Cards de certificados/badges - Full width */}
      <div className="w-screen -mx-[calc((100vw-100%)/2)]">
        <CertificadosSection />
      </div>
    </div>
  );
}
