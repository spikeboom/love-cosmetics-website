import { BannerPrincipal } from "../components/BannerPrincipal";
import { CertificadosSection } from "../components/CertificadosSection";
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
  // Vitrine 1 - Produtos em Destaque: Espuma, Sérum, Hidratante
  const { data: produtosDestaque } = await fetchProdutosForSearch({
    termos: ["espuma", "sérum", "serum", "hidratante"]
  });
  const destaquesOrdenados = ordenarProdutos(produtosDestaque || [], ["espuma", "sérum", "serum", "hidratante"]);

  // Vitrine 2 - Tecnologia & Amazônia: Espuma e Manteiga
  const { data: produtosTecnologia } = await fetchProdutosForSearch({
    termos: ["espuma", "manteiga"]
  });
  const tecnologiaOrdenados = ordenarProdutos(produtosTecnologia || [], ["espuma", "manteiga"]);

  // Vitrine 3 - Rotina Essencial Lové: Kit Uso Diário + Manteiga + Máscara
  const { data: produtosRotina } = await fetchProdutosForSearch({
    q: "rotina-essencial"
  });

  return (
    <div className="w-full max-w-[1440px] mx-auto">
      {/* Banner principal com produto em destaque */}
      <BannerPrincipal />

      {/* Cards de certificados/badges - Full width */}
      <div className="w-screen -mx-[calc((100vw-100%)/2)]">
        <CertificadosSection />
      </div>

      {/* Vitrine 1 - Produtos em Destaque */}
      <div className="w-screen -mx-[calc((100vw-100%)/2)]">
        <VitrineSection
          titulo="Produtos em Destaque"
          subtitulo="Hidratação profunda, alívio das inflamações e rachaduras"
          backgroundColor="cream"
          tipo="produto-completo"
          produtos={destaquesOrdenados}
        />
      </div>

      {/* Vitrine 2 - Tecnologia & Amazônia */}
      <VitrineSection
        titulo="Tecnologia & Amazônia"
        subtitulo="Ciência e natureza unidos para sua pele"
        backgroundColor="white"
        tipo="produto-completo"
        produtos={tecnologiaOrdenados}
      />

      {/* Vitrine 3 - Rotina Essencial Lové */}
      <VitrineSection
        titulo="Rotina Essencial Lové"
        subtitulo="Tudo que você precisa para uma rotina completa"
        backgroundColor="white"
        showNavigation={true}
        tipo="produto-completo"
        produtos={produtosRotina || []}
      />
    </div>
  );
}
