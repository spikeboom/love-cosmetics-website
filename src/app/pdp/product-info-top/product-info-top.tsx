import { FaRegStarHalfStroke, FaStar } from "react-icons/fa6";

export function ProductInfoTop() {
  return (
    <header className="flex flex-col gap-2 px-[16px] lowercase">
      <h1 className="flex items-center gap-2">
        <span className="font-poppins text-[18px] font-medium">
          hidratante facial
        </span>

        <span className="rounded-[3px] bg-[#efefef] px-[3px] py-[2px] text-[10px] text-[#333]">
          15g
        </span>
      </h1>

      <span className="w-fit rounded-[4px] bg-[#f0e27c] px-[8px] py-[3px] font-poppins text-[14px] text-[#333]">
        novidade
      </span>

      <div className="font-poppins">
        <span className="flex items-center gap-1">
          <div>
            <span className="flex gap-1" role="button">
              <FaStar color="#f0e27c" size={16} />
              <FaStar color="#f0e27c" size={16} />
              <FaStar color="#f0e27c" size={16} />
              <FaStar color="#f0e27c" size={16} />
              <FaRegStarHalfStroke color="#f0e27c" size={16} />
            </span>
          </div>

          <span className="text-[12px] font-semibold text-[#666]">4.4</span>

          <a
            className="ml-2 text-[12px] font-semibold text-[#666] underline"
            href=""
          >
            103 resenhas
          </a>
        </span>
      </div>
    </header>
  );
}
