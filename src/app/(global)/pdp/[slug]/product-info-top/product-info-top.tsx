import { FaRegStar, FaRegStarHalfStroke, FaStar } from "react-icons/fa6";

interface ProductInfoTopProps {
  nome: string;
  unidade: string;
  adesivo?: string;
  nota: number;
  quantidadeResenhas: number;
}

export function ProductInfoTop({
  nome,
  unidade,
  adesivo,
  nota,
  quantidadeResenhas,
}: ProductInfoTopProps) {
  const starSettings = {
    color: "#f0e27c",
    size: 16,
  };

  const arrayStars = Array.from({ length: 5 }, (_, index) => {
    if (index < Math.floor(nota))
      return <FaStar key={`full-${index}`} {...starSettings} />;
    if (index === Math.floor(nota))
      return <FaRegStarHalfStroke key={`half-${index}`} {...starSettings} />;
    return <FaRegStar key={`empty-${index}`} {...starSettings} />;
  });

  return (
    <header className="flex flex-col gap-2 px-[16px] lowercase">
      <h1 className="flex items-center gap-2">
        <span className="font-poppins text-[18px] font-medium">{nome}</span>

        <span className="rounded-[3px] bg-[#efefef] px-[3px] py-[2px] text-[10px] text-[#333]">
          {unidade}
        </span>
      </h1>

      {adesivo && (
        <span className="w-fit rounded-[4px] bg-[#f0e27c] px-[8px] py-[3px] font-poppins text-[14px] text-[#333]">
          {adesivo}
        </span>
      )}

      <div className="font-poppins">
        <span className="flex items-center gap-1">
          <div>
            <span className="flex gap-1" role="button">
              {arrayStars}
            </span>
          </div>

          {/* <span className="text-[12px] font-semibold text-[#666]">{nota}</span>

          <a
            className="ml-2 text-[12px] font-semibold text-[#666] underline"
            href=""
          >
            {quantidadeResenhas} resenhas
          </a> */}
        </span>
      </div>
    </header>
  );
}
