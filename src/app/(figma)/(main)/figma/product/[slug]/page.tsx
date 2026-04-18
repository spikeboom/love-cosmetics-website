import { fetchProdutoBySlug, fetchProdutosForDesign } from "@/modules/produto/domain";
import { fetchDepoimentos } from "@/lib/cms/directus/depoimentos";
import { fetchInstagramPosts } from "@/lib/cms/directus/instagram";
import { ProductPageClient } from "./ProductPageClient";
import { notFound } from "next/navigation";

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: ProductPageProps) {
  const { slug } = await params;

  try {
    const { data } = await fetchProdutoBySlug({ slug });
    const produto = data?.[0];

    if (!produto) {
      return {
        title: "Produto não encontrado - Lové Cosméticos",
        description: "Produto não encontrado",
      };
    }

    return {
      title: `Lové Cosméticos - ${produto.nome}`,
      description: produto.listaDescricao?.[0]?.descricao || "Beleza natural e sustentável",
    };
  } catch (error) {
    return {
      title: "Lové Cosméticos - Produto",
      description: "Beleza natural e sustentável",
    };
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;

  try {
    const [produtoResult, vitrineResult, depoimentos, instagramPosts] = await Promise.all([
      fetchProdutoBySlug({ slug }),
      fetchProdutosForDesign(),
      fetchDepoimentos(),
      fetchInstagramPosts(),
    ]);

    const produto = produtoResult.data?.[0];
    if (!produto) {
      notFound();
    }

    // Preload da imagem LCP (primeiro slide da galeria, versão mobile)
    const baseURL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";
    const firstImg = produto.carouselImagensPrincipal?.[0]?.imagem;
    const lcpUrlRaw = firstImg?.formats?.large?.url
      || firstImg?.formats?.xlarge?.url
      || firstImg?.url;
    const lcpUrl = lcpUrlRaw
      ? (lcpUrlRaw.startsWith("http") ? lcpUrlRaw : `${baseURL}${lcpUrlRaw}`)
      : null;

    const nextImg = (url: string, w: number, q = 85) =>
      `/_next/image?url=${encodeURIComponent(url)}&w=${w}&q=${q}`;
    const mobileWidths = [640, 750, 828, 1080, 1200, 1920];
    const buildSrcSet = (url: string, widths: number[]) =>
      widths.map((w) => `${nextImg(url, w)} ${w}w`).join(", ");

    return (
      <>
        {lcpUrl && (
          <link
            rel="preload"
            as="image"
            href={nextImg(lcpUrl, 1080)}
            imageSrcSet={buildSrcSet(lcpUrl, mobileWidths)}
            imageSizes="100vw"
            media="(max-width: 767px)"
            fetchPriority="high"
          />
        )}
        <ProductPageClient
          produto={produto}
          produtosVitrine={vitrineResult.data}
          depoimentos={depoimentos}
          instagramPosts={instagramPosts}
        />
      </>
    );
  } catch (error) {
    console.error("Erro ao buscar produto:", error);
    notFound();
  }
}
