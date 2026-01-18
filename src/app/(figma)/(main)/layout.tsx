import { Header } from "./figma/components/Header";
import { Footer } from "./figma/components/Footer";
import { fetchProdutosForSearch } from "@/modules/produto/domain";

export default async function FigmaMainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Busca todos os produtos para o search
  const { data: produtos } = await fetchProdutosForSearch({});

  // Mapeia para formato simplificado do SearchBar
  const produtosSearch = produtos?.map((p: any) => ({
    id: p.id,
    slug: p.slug,
    nome: p.nome || "Produto",
    imagem: p.carouselImagensPrincipal?.[0]?.imagem?.url
      ? `${process.env.NEXT_PUBLIC_STRAPI_URL}${p.carouselImagensPrincipal[0].imagem.url}`
      : "/new-home/produtos/produto-1.png",
  })) || [];

  return (
    <div className="flex flex-col min-h-screen">
      <Header produtos={produtosSearch} />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
