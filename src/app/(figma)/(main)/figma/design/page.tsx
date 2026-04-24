import dynamic from "next/dynamic";
import { BannerPrincipal } from "../components/BannerPrincipal";
import { CertificadosSection } from "../components/CertificadosSection";
import { ElogiouWidget } from "../components/ElogiouWidget";
import { DeployCheck } from "./DeployCheck";
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

  // Gera srcset/href compatíveis com o que <Image sizes="100vw" fill /> solicita,
  // para que o preload bata na mesma URL do fetch real.
  const nextImg = (url: string, w: number, q = 75) =>
    `/_next/image?url=${encodeURIComponent(url)}&w=${w}&q=${q}`;
  const mobileWidths = [640, 750, 828, 1080, 1200, 1920];
  const desktopWidths = [640, 750, 828, 1080, 1200, 1920, 2048, 3840];
  const buildSrcSet = (url: string, widths: number[]) =>
    widths.map((w) => `${nextImg(url, w)} ${w}w`).join(", ");

  const heroMobileUrl = heroBanner?.imagemMobile || heroBanner?.imagemDesktop;
  const heroDesktopUrl = heroBanner?.imagemDesktop;

  return (
    <div className="w-full max-w-[1440px] mx-auto">
      {heroBanner && (
        <>
          {heroMobileUrl && (
            <link
              rel="preload"
              as="image"
              href={nextImg(heroMobileUrl, 1080)}
              imageSrcSet={buildSrcSet(heroMobileUrl, mobileWidths)}
              imageSizes="100vw"
              media="(max-width: 1023px)"
              fetchPriority="high"
            />
          )}
          {heroDesktopUrl && (
            <link
              rel="preload"
              as="image"
              href={nextImg(heroDesktopUrl, 1920)}
              imageSrcSet={buildSrcSet(heroDesktopUrl, desktopWidths)}
              imageSizes="(min-width: 1440px) 1440px, 100vw"
              media="(min-width: 1024px)"
              fetchPriority="high"
            />
          )}
        </>
      )}
      <DeployCheck />

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
