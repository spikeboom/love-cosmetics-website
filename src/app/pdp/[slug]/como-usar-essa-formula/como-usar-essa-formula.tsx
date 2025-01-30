interface ComoUsarEssaFormulaProps {
  como_usar_essa_formula: { id: number; numero: number; texto: string }[];
}

export function ComoUsarEssaFormula({
  como_usar_essa_formula,
}: ComoUsarEssaFormulaProps) {
  return (
    <div className="my-[16px] rounded-[8px] bg-[#f2eeff] p-[20px]">
      <h2 className="mb-[18px] text-center font-poppins text-[16px] leading-[130%]">
        como usar essa fórmula?
      </h2>
      {como_usar_essa_formula?.map((item) => (
        <div
          className="flex gap-2 rounded-[8px] bg-[#fff] px-[14px] py-[20px]"
          key={item?.id}
        >
          <div className="flex h-[32px] w-[32px] items-center justify-center rounded-full border-[2px] border-[#333] p-[16px] text-[16px] font-black text-[#333]">
            <span>{item?.numero}</span>
          </div>
          <div className="text-[14px] leading-[150%] text-[#666]">
            {item?.texto}
          </div>
        </div>
      ))}
    </div>
  );
}
