import { FaArrowRight } from "react-icons/fa6";

export function CadastreSeuEmail() {
  return (
    <div className="mx-[8px] flex flex-col items-center border-t-[1px] pb-[8px] pt-[28px] font-poppins">
      <h3 className="py-[12px] text-[16px]">cadastre seu email</h3>
      <p className="text-center text-[14px] leading-[130%] text-[#333333BF]">
        cadastre seu e-mail e fique por dentro de todos os lançamentos,
        promoções e dicas de skincare!
        <br />
        <br />
        receba também nosso cupom de primeira compra
      </p>
      <div className="flex w-full items-center gap-[8px]">
        <input
          type="email"
          className="my-[12px] w-full px-[24px] py-[18px] text-[14px]"
          placeholder="email"
          style={{ border: "1px solid #e0e0e0" }}
        />
        <button className="flex h-fit items-center gap-1 rounded-[100px] bg-[#FF69B4] px-[16px] py-[12px] text-[14px] text-[#fff]">
          <span>enviar</span> <FaArrowRight color="#fff" size={16} />
        </button>
      </div>
    </div>
  );
}
