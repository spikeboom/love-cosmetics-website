import { VitrineSection } from "../components/VitrineSection";
import { CertificadosSection } from "../components/CertificadosSection";
import { fetchProdutosForDesign } from "@/modules/produto/domain";

export const metadata = {
  title: "Carrinho - Lové Cosméticos",
};

export default async function CartPage() {
  const { data: produtos } = await fetchProdutosForDesign();
  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-white">
      {/* Título */}
      <div className="flex w-full max-w-[1440px] px-6">
        <div className="flex w-full flex-col justify-center gap-4 pb-4 pt-8">
          <div className="flex items-center justify-center gap-2.5">
            <h1 className="font-[Cera_Pro] text-[32px] font-bold leading-[1.257] text-black">
              Carrinho
            </h1>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="flex w-full max-w-[1440px] gap-6 px-6 pb-8 pt-6">
        {/* Coluna Esquerda - Produtos */}
        <div className="flex flex-col gap-8">
          {/* Lista de Produtos */}
          <div className="flex flex-col gap-6">
            {/* Produto 1 */}
            <div className="flex w-[921px] flex-col rounded-lg shadow-[0px_1px_3px_1px_rgba(0,0,0,0.15),0px_1px_2px_0px_rgba(0,0,0,0.3)]">
              <div className="flex flex-col gap-4 self-stretch bg-white p-4">
                <div className="flex items-center gap-4">
                  <div className="h-[100px] w-[100px] rounded bg-[#F8F3ED]"></div>
                  <div className="flex flex-1 flex-col gap-2">
                    <h3 className="font-[Cera_Pro] text-base font-medium leading-[1.257] text-black">
                      Manteiga Corporal Lové Cosméticos
                    </h3>
                    <p className="font-[Cera_Pro] text-sm font-light leading-[1.257] text-[#111111]">
                      200g
                    </p>
                    <div className="flex items-center gap-4">
                      <p className="font-[Cera_Pro] text-xl font-light leading-[1.257] text-black">
                        R$ 99,99
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="flex h-8 w-8 items-center justify-center rounded border border-[#D2D2D2]">
                      -
                    </button>
                    <span className="font-[Cera_Pro] text-base">1</span>
                    <button className="flex h-8 w-8 items-center justify-center rounded border border-[#D2D2D2]">
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Produto 2 */}
            <div className="flex w-[921px] flex-col rounded-lg shadow-[0px_1px_3px_1px_rgba(0,0,0,0.15),0px_1px_2px_0px_rgba(0,0,0,0.3)]">
              <div className="flex flex-col gap-4 self-stretch bg-white p-4">
                <div className="flex items-center gap-4">
                  <div className="h-[100px] w-[100px] rounded bg-[#F8F3ED]"></div>
                  <div className="flex flex-1 flex-col gap-2">
                    <h3 className="font-[Cera_Pro] text-base font-medium leading-[1.257] text-black">
                      Manteiga Corporal Lové Cosméticos
                    </h3>
                    <p className="font-[Cera_Pro] text-sm font-light leading-[1.257] text-[#111111]">
                      200g
                    </p>
                    <div className="flex items-center gap-4">
                      <p className="font-[Cera_Pro] text-xl font-light leading-[1.257] text-black">
                        R$ 99,99
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="flex h-8 w-8 items-center justify-center rounded border border-[#D2D2D2]">
                      -
                    </button>
                    <span className="font-[Cera_Pro] text-base">1</span>
                    <button className="flex h-8 w-8 items-center justify-center rounded border border-[#D2D2D2]">
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Produto 3 */}
            <div className="flex w-[921px] flex-col rounded-lg shadow-[0px_1px_3px_1px_rgba(0,0,0,0.15),0px_1px_2px_0px_rgba(0,0,0,0.3)]">
              <div className="flex flex-col gap-4 self-stretch bg-white p-4">
                <div className="flex items-center gap-4">
                  <div className="h-[100px] w-[100px] rounded bg-[#F8F3ED]"></div>
                  <div className="flex flex-1 flex-col gap-2">
                    <h3 className="font-[Cera_Pro] text-base font-medium leading-[1.257] text-black">
                      Manteiga Corporal Lové Cosméticos
                    </h3>
                    <p className="font-[Cera_Pro] text-sm font-light leading-[1.257] text-[#111111]">
                      200g
                    </p>
                    <div className="flex items-center gap-4">
                      <p className="font-[Cera_Pro] text-xl font-light leading-[1.257] text-black">
                        R$ 99,99
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="flex h-8 w-8 items-center justify-center rounded border border-[#D2D2D2]">
                      -
                    </button>
                    <span className="font-[Cera_Pro] text-base">1</span>
                    <button className="flex h-8 w-8 items-center justify-center rounded border border-[#D2D2D2]">
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Tag Múltiplas */}
            <div className="flex flex-col justify-center gap-2 self-stretch rounded-lg bg-[#F8F3ED] p-4">
              <div className="flex items-center gap-1">
                <div className="flex items-center gap-1">
                  <p className="font-[Cera_Pro] text-sm font-light leading-[1.257] text-[#111111]">
                    🎁 Você ganhou
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <p className="font-[Cera_Pro] text-sm font-light leading-[1.257] text-[#111111]">
                    frete grátis
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <p className="font-[Cera_Pro] text-sm font-light leading-[1.257] text-[#111111]">
                    para esta compra!
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Área de Frete e Cupom */}
          <div className="flex w-[447px] flex-col gap-8 self-stretch">
            {/* Cupom */}
            <div className="flex w-[447px] flex-col gap-4">
              <h3 className="w-full font-[Cera_Pro] text-xl font-bold leading-[1.257] text-black">
                Cupom de desconto
              </h3>
              <input
                type="text"
                placeholder="Digite seu cupom"
                className="flex items-center justify-between gap-[5px] self-stretch rounded-lg border border-[#D2D2D2] bg-white px-2 py-2 font-[Cera_Pro] text-sm"
              />
            </div>
          </div>
        </div>

        {/* Coluna Direita - Resumo */}
        <div className="flex flex-col gap-6 self-stretch rounded-lg bg-white p-4 shadow-[0px_1px_3px_1px_rgba(0,0,0,0.15),0px_1px_2px_0px_rgba(0,0,0,0.3)]">
          <h2 className="w-full font-[Cera_Pro] text-2xl font-bold leading-[1.257] text-[#111111]">
            Resumo da compra
          </h2>

          {/* Produtos */}
          <div className="flex flex-col gap-4 self-stretch">
            <div className="flex items-stretch self-stretch gap-8">
              <p className="w-full font-[Cera_Pro] text-xl font-light leading-[1.257] text-[#111111]">
                Produtos
              </p>
              <p className="w-full text-right font-[Cera_Pro] text-xl font-light leading-[1.257] text-[#111111]">
                R$ 99,99
              </p>
            </div>

            <div className="flex items-center justify-between self-stretch gap-8">
              <p className="font-[Cera_Pro] text-xl font-light leading-[1.257] text-[#111111]">
                Frete
              </p>
              <p className="font-[Cera_Pro] text-xl font-light leading-[1.257] text-black">
                R$ 9,99
              </p>
            </div>

            <div className="flex items-center justify-between self-stretch gap-8">
              <p className="font-[Cera_Pro] text-xl font-light leading-[1.257] text-[#111111]">
                Cupom
              </p>
              <p className="font-[Cera_Pro] text-xl font-light leading-[1.257] text-[#009142]">
                -R$ 9,99
              </p>
            </div>
          </div>

          {/* Total */}
          <div className="flex items-stretch self-stretch gap-8">
            <h2 className="w-full font-[Cera_Pro] text-2xl font-bold leading-[1.257] text-[#111111]">
              Total
            </h2>
            <h2 className="w-full font-[Cera_Pro] text-2xl font-bold leading-[1.257] text-[#111111]">
              R$ 99,99
            </h2>
          </div>

          {/* Botão */}
          <div className="flex flex-col gap-4 self-stretch">
            <button className="flex items-center justify-center self-stretch rounded-lg bg-[#254333] py-3">
              <span className="font-[Cera_Pro] text-base font-medium text-white">
                Continuar
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Seção de Recomendações */}
      <div className="w-full bg-[#f8f3ed] flex flex-col items-center">
        <div className="w-full max-w-[1440px]">
          <VitrineSection
            titulo="Recomendações para você"
            backgroundColor="cream"
            showNavigation={true}
            tipo="produto-completo"
            produtos={produtos}
            showVerTodos={false}
          />
        </div>

        {/* Seção de Horizontal Cards */}
        <div className="w-full max-w-[1440px]">
          <CertificadosSection />
        </div>
      </div>
    </div>
  );
}
