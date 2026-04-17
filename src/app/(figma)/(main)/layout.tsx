import { Header } from "./figma/components/Header";
import { Footer } from "./figma/components/Footer";
import { fetchProdutosForSearch } from "@/modules/produto/domain";
import { fetchConfiguracoesLoja } from "@/lib/cms/directus/configuracoes";
import { LojaConfigProvider } from "@/contexts/LojaConfigContext";
import { FloatingWhatsApp } from "./figma/components/FloatingWhatsApp";

export default async function FigmaMainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Busca todos os produtos para o search e configurações da loja em paralelo
  const [{ data: produtos }, lojaConfig] = await Promise.all([
    fetchProdutosForSearch({}),
    fetchConfiguracoesLoja(),
  ]);

  // Mapeia para formato simplificado do SearchBar
  const produtosSearch = produtos?.map((p: any) => ({
    id: p.id,
    slug: p.slug,
    nome: p.nome || "Produto",
    imagem: (() => {
      const url = p.carouselImagensPrincipal?.[0]?.imagem?.url;
      if (!url) return "/new-home/produtos/produto-1.png";
      return url.startsWith("http") ? url : `${process.env.NEXT_PUBLIC_STRAPI_URL}${url}`;
    })(),
  })) || [];

  return (
    <LojaConfigProvider value={lojaConfig}>
      <div className="flex flex-col min-h-screen">
        <Header produtos={produtosSearch} />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
        <FloatingWhatsApp />
      </div>
    </LojaConfigProvider>
  );
}
