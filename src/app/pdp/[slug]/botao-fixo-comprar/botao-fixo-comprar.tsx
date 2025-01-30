interface BarraFixaComprarProps {
  preco: number;
}

export function BarraFixaComprar({ preco }: BarraFixaComprarProps) {
  return (
    <div className="fixed bottom-0 z-10 w-full bg-[#fff] font-poppins">
      <div className="flex justify-center bg-[#f1eaf5] py-[4px] text-center text-[12px]">
        <p>
          leve 2 ou + fórmulas e ganhe <strong>até 15% OFF ✨</strong>
        </p>
      </div>

      <div className="flex items-center gap-[20px] whitespace-nowrap px-[16px] py-[12px]">
        <div className="h-fit w-fit">
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
        </div>

        <div className="w-full">
          <button className="w-full rounded-[100px] bg-[#FF69B4] px-[20px] py-[12px] text-[16px] font-semibold text-[#fff]">
            <span>comprar</span>
          </button>
        </div>
      </div>
    </div>
  );
}
