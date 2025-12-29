import { Tabs } from "@/deprecated/components/ui/Tabs";
import { Duvidas } from "@/deprecated/components/common/FAQ/duvidas";
import { CarouselProducts } from "@/deprecated/components/product/ProductCarousel/carousel-products";
import { ListaAtivos } from "@/deprecated/components/product/ActiveIngredients/lista-ativos";
import { MaisLinks } from "@/deprecated/components/common/MoreLinks/mais-links";
import { Rodape } from "@/deprecated/components/layout/Footer/rodape";
import { AvaliacoesClientes } from "@/deprecated/components/product/CustomerReviews/avaliacoes-clientes";
import { CarouselImagensTop } from "@/deprecated/components/product/ProductImageCarousel/carousel-imagens-top";
import { Cabecalho } from "@/deprecated/components/layout/Header/cabecalho";
import { Breadcrumbs } from "@/deprecated/components/common/Breadcrumbs/breadcrumbs";
import { ProductInfoTop } from "@/deprecated/components/product/ProductInfoTop/product-info-top";
import { ProductDescricao } from "@/deprecated/components/product/ProductDescription/product-descricao";
import {
  BarraFixaComprar,
  BotaoComprar,
} from "@/deprecated/components/cart/FixedBuyButton/botao-fixo-comprar";
import { ComoUsarEssaFormula } from "@/deprecated/components/product/HowToUse/como-usar-essa-formula";
import { Adesivos } from "@/deprecated/components/product/Stickers/adesivos";
import { PagueCom } from "@/deprecated/components/forms/PaymentMethods/pague-com";
import { PontosDisponiveis } from "@/deprecated/components/forms/AvailablePoints/pontos-disponiveis";
import { ListaRedesSociais } from "@/deprecated/components/common/SocialMedia/lista-resdes-sociais";
import { CartoesAceitos } from "@/deprecated/components/forms/AcceptedCards/cartoes-aceitos";
import { CadastreSeuEmail } from "@/deprecated/components/forms/EmailSignup/cadastre-seu-email";
import {
  fetchProdutoBySlug,
  fetchProdutosForCarouselPDP,
} from "@/modules/produto/domain";
import { Metadata, ResolvingMetadata } from "next";
import { AddToCart } from "@/deprecated/components/cart/AddToCart/add-to-cart";
import { ViewContentEvent } from "@/deprecated/components/common/EventViewContent/event-view-content";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata(
  { params, searchParams }: Props,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `Lové Cosméticos - ${slug?.replaceAll("-", " ")}`,
  };
}

export default async function PdpPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const {
    data: [produto],
  } = await fetchProdutoBySlug({ slug });

  const { data: dataForCarouselMultiple } = await fetchProdutosForCarouselPDP();

  const produtosOrdenados = dataForCarouselMultiple.sort((a: any, b: any) => {
    const aContemKit = a.nome.toLowerCase().includes("kit") ? 0 : 1;
    const bContemKit = b.nome.toLowerCase().includes("kit") ? 0 : 1;
    return aContemKit - bContemKit;
  });

  return (
    <>
      <section>
        <Breadcrumbs items={produto?.breadcrumbItems} />

        <div className="block w-full gap-[50px] md:flex">
          <CarouselImagensTop
            imagens={produto?.carouselImagensPrincipal}
            extraClassesForTopDiv={`hidden md:block`}
          />

          <main className="w-full md:w-[50%]">
            <ProductInfoTop
              nome={produto?.nome}
              unidade={produto?.unidade}
              adesivo={produto?.adesivo}
              nota={produto?.nota}
              quantidadeResenhas={produto?.quantidadeResenhas}
            />

            <CarouselImagensTop
              imagens={produto?.carouselImagensPrincipal}
              extraClassesForTopDiv={`block md:hidden`}
            />

            <article className="px-[16px] text-[#333]">
              <ProductDescricao
                descricao_resumida={produto?.descricaoResumida}
                titulo_lista={produto?.tituloLista}
                lista_descricao={produto?.listaDescricao}
              />

              <BotaoComprar
                produto={produto}
                extraClassesForTopDiv={`hidden md:flex`}
                preco={produto?.preco}
              />

              {/* <PontosDisponiveis /> */}

              <div className="my-[16px]">
                <Tabs
                  o_que_ele_tem={produto?.o_que_ele_tem}
                  o_que_ele_e={produto?.o_que_ele_e}
                  resultados={produto?.resultados}
                />

                <ComoUsarEssaFormula
                  como_usar_essa_formula={produto?.como_usar_essa_formula}
                />

                <Duvidas duvidas={produto?.duvidas} />
              </div>

              {/* <Adesivos /> */}

              {/* <PagueCom />   */}
            </article>

            <CarouselProducts
              complete
              dataForCarouselMultiple={produtosOrdenados}
            />
          </main>
        </div>
      </section>

      <section>
        <main className="">
          {/* <AvaliacoesClientes
            nota={produto?.nota}
            quantidadeResenhas={produto?.quantidadeResenhas}
            detalhe_notas={produto?.detalhe_notas}
            avaliacoes={produto?.avaliacoes}
          /> */}

          {/* <CadastreSeuEmail /> */}
        </main>
      </section>

      <footer className="mt-[15px]">
        <div className="flex flex-col items-center">
          {/* <ListaRedesSociais />

          <MaisLinks />

          <ListaAtivos />

          <CartoesAceitos /> */}
        </div>
      </footer>

      <BarraFixaComprar produto={produto} extraClassesForTopDiv={`md:hidden`} />

      <AddToCart produto={produto} />

      <ViewContentEvent produto={produto} />
    </>
  );
}
