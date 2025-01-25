import { Tabs } from "./tabs";
import { Duvidas } from "./duvidas/duvidas";
import { CarouselProducts } from "./carousel-products/carousel-products";
import { ListaAtivos } from "./lista-ativos/lista-ativos";
import { MaisLinks } from "./mais-links/mais-links";
import { Rodape } from "./rodape/rodape";
import { AvaliacoesClientes } from "./avaliacoes-clientes/avaliacoes-clientes";
import { CarouselImagensTop } from "./carousel-imagens-top/carousel-imagens-top";
import { Cabecalho } from "./cabecalho/cabecalho";
import { Breadcrumbs } from "./breadcrumbs/breadcrumbs";
import { ProductInfoTop } from "./product-info-top/product-info-top";
import { ProductDescricao } from "./product-descricao/product-descricao";
import { BarraFixaComprar } from "./botao-fixo-comprar/botao-fixo-comprar";
import { ComoUsarEssaFormula } from "./como-usar-essa-formula/como-usar-essa-formula";
import { Adesivos } from "./adesivos/adesivos";
import { PagueCom } from "./pague-com/pague-com";
import { PontosDisponiveis } from "./pontos-disponiveis/pontos-disponiveis";
import { ListaRedesSociais } from "./lista-redes-sociais/lista-resdes-sociais";
import { CartoesAceitos } from "./cartoes-aceitos/cartoes-aceitos";
import { CadastreSeuEmail } from "./cadastre-seu-email/cadastre-seu-email";
import { fetchProdutoBySlug } from "@/modules/produto/domain";

export default async function PdpPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { data } = await fetchProdutoBySlug({ slug });
  const [produto] = data;

  return (
    <>
      <div className="pt-[110px] font-lato text-[#333]">
        <Cabecalho />

        <section>
          <Breadcrumbs />

          <main className="">
            <ProductInfoTop />

            <CarouselImagensTop />

            <article className="px-[16px] text-[#333]">
              <ProductDescricao
                descricao_resumida={produto?.descricaoResumida}
                titulo_lista={produto?.tituloLista}
                lista_descricao={produto?.listaDescricao}
              />

              <PontosDisponiveis />

              <div className="my-[16px]">
                <Tabs />

                <ComoUsarEssaFormula />

                <Duvidas />
              </div>

              <Adesivos />

              <PagueCom />
            </article>

            <CarouselProducts />

            <AvaliacoesClientes />

            <CadastreSeuEmail />
          </main>
        </section>
        <footer className="mt-[15px]">
          <div className="flex flex-col items-center">
            <ListaRedesSociais />

            <MaisLinks />

            <ListaAtivos />

            <CartoesAceitos />

            <Rodape />
          </div>
        </footer>
        <div className="h-[100px] bg-[#333]"></div>
      </div>

      <BarraFixaComprar />
    </>
  );
}
