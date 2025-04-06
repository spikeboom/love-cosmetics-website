"use client";

import { useMeuContexto } from "@/components/context/context";
import { formatPrice } from "@/utils/format-price";

interface BarraFixaComprarProps {
  produto: any;
  extraClassesForTopDiv?: string;
  preco?: number;
}

export function BarraFixaComprar({
  produto,
  extraClassesForTopDiv,
}: BarraFixaComprarProps) {
  const { setSidebarMounted, addProductToCart } = useMeuContexto();

  const preco = produto?.preco;

  const handleComprar = () => {
    addProductToCart(produto);
    setSidebarMounted(true);
  };

  return (
    <>
      <div
        className={`fixed bottom-0 z-10 w-full bg-[#fff] font-poppins ${extraClassesForTopDiv}`}
      >
        {/* <div className="flex justify-center bg-[#f1eaf5] py-[4px] text-center text-[12px]">
          <p>
            leve 2 ou + fórmulas e ganhe <strong>até 15% OFF ✨</strong>
          </p>
        </div> */}

        <div className="flex items-center gap-[20px] whitespace-nowrap px-[16px] py-[12px]">
          <div className="h-fit w-fit">
            <p className="flex w-fit flex-col">
              {produto.preco_de && (
                <div className="mb-[2px] flex items-center gap-[2px]">
                  <span className="text-[11px] font-semibold leading-[1] text-[#a5a5a5] line-through">
                    <span className="">R$ {formatPrice(produto.preco_de)}</span>
                  </span>
                  {(produto.tag_desconto_1 || produto.tag_desconto_2) && (
                    <div className="rounded-[4px] bg-[#e9cfcd] px-[4px] py-[2px] text-[10px] font-medium text-black">
                      {produto.tag_desconto_1 || produto.tag_desconto_2}
                    </div>
                  )}
                </div>
              )}

              <strong className="text-[14px]">R$ {formatPrice(preco)}</strong>

              <span className="text-[12px] text-[#333333BF]">
                ou 3x R$ {formatPrice(Math.round((preco * 100) / 3) / 100)}
              </span>
            </p>
          </div>

          <div className="w-full">
            <button
              className="w-full rounded-[100px] bg-[#C0392B] px-[20px] py-[12px] text-[16px] font-semibold text-[#fff]"
              onClick={handleComprar}
            >
              comprar
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export function BotaoComprar({
  produto,
  extraClassesForTopDiv,
  preco = 0,
}: BarraFixaComprarProps) {
  const { setSidebarMounted, addProductToCart } = useMeuContexto();

  const handleComprar = () => {
    addProductToCart(produto);
    setSidebarMounted(true);
  };

  return (
    <>
      <div className={`flex items-center gap-[24px] ${extraClassesForTopDiv}`}>
        <p className="flex w-fit flex-col">
          <strong className="text-[14px]">
            R$ {preco?.toString().replace(".", ",")}
          </strong>

          <span className="text-[12px] text-[#333333BF]">
            ou 3x R${" "}
            {(Math.round((preco * 100) / 3) / 100)
              ?.toString()
              .replace(".", ",")}
          </span>
        </p>

        <div className={`w-fit`}>
          <button
            className="w-full rounded-[100px] bg-[#C0392B] px-[64px] py-[12px] text-[16px] font-semibold text-[#fff]"
            onClick={handleComprar}
          >
            comprar
          </button>
        </div>
      </div>
    </>
  );
}
