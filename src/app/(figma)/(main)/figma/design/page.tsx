import { BannerPrincipal } from "../components/BannerPrincipal";
import { CupomBanner } from "../components/CupomBanner";
import { CertificadosSection } from "../components/CertificadosSection";
import { ElogiouWidget } from "../components/ElogiouWidget";
import { VitrineSection } from "../components/VitrineSection";
import { fetchProdutosForSearch } from "@/modules/produto/domain";

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
  // Vitrine 1 - Comece sua rotina Lovè: Espuma, Sérum, Hidratante
  const { data: produtosRotina } = await fetchProdutosForSearch({
    termos: ["espuma", "sérum", "serum", "hidratante"]
  });
  const rotinaOrdenados = ordenarProdutos(produtosRotina || [], ["espuma", "sérum", "serum", "hidratante"]);

  // Vitrine 2 - Kits Lovè: Kit Uso Diário, Kit Full Lovè
  const { data: produtosKits } = await fetchProdutosForSearch({
    termos: ["kit"]
  });
  const kitsOrdenados = ordenarProdutos(produtosKits || [], ["kit uso diário", "kit full"]);

  // Vitrine 3 - Tecnologia & Amazônia: Máscara de Argila, Manteiga Corporal
  const { data: produtosTecnologia } = await fetchProdutosForSearch({
    termos: ["máscara", "mascara", "manteiga"]
  });
  const tecnologiaOrdenados = ordenarProdutos(produtosTecnologia || [], ["máscara", "mascara", "manteiga"]);

  return (
    <div className="w-full max-w-[1440px] mx-auto">
      {/* Banner principal com produto em destaque */}
      <BannerPrincipal />

      {/* Faixa cupom primeira compra - Full width */}
      <div className="w-screen -mx-[calc((100vw-100%)/2)]">
        <CupomBanner />
      </div>

      {/* Cards de certificados/badges - Full width */}
      <div className="w-screen -mx-[calc((100vw-100%)/2)]">
        <CertificadosSection />
      </div>

      {/* Avaliações Elogiou - Full width */}
      <div className="w-screen -mx-[calc((100vw-100%)/2)] my-4">
        <ElogiouWidget />
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
    </div>
  );
}
