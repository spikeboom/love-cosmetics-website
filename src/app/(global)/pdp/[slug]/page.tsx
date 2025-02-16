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
import { ModalCart } from "./modal-cart/modal-cart";

export default async function PdpPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const {
    data: [produto],
  } = await fetchProdutoBySlug({ slug });

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

              <PontosDisponiveis />

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

              <Adesivos />

              <PagueCom />
            </article>

            <CarouselProducts />
          </main>
        </div>
      </section>

      <section>
        <main className="">
          <AvaliacoesClientes
            nota={produto?.nota}
            quantidadeResenhas={produto?.quantidadeResenhas}
            detalhe_notas={produto?.detalhe_notas}
            avaliacoes={produto?.avaliacoes}
          />

          <CadastreSeuEmail />
        </main>
      </section>

      <footer className="mt-[15px]">
        <div className="flex flex-col items-center">
          <ListaRedesSociais />

          <MaisLinks />

          <ListaAtivos />

          <CartoesAceitos />
        </div>
      </footer>

      <BarraFixaComprar produto={produto} />

      <ModalCart />
    </>
  );
}
