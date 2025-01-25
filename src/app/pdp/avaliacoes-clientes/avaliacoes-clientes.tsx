import { FaChevronDown, FaRegStarHalfStroke, FaStar } from "react-icons/fa6";
import Reviews from "../reviews/reviews";

export function AvaliacoesClientes() {
  return (
    <section className="px-[16px] font-poppins">
      <div>
        <div className="flex justify-center">
          <h3 className="my-[24px] text-[24px] font-semibold">quem usa</h3>
        </div>
        <div className="">
          <div className="flex flex-col items-center justify-center">
            <h2 className="mb-[12px] text-[20px] font-semibold">
              avaliações de clientes
            </h2>
            <div className="flex w-full flex-col items-center">
              <div className="mb-[24px] flex flex-col gap-2">
                <div className="flex justify-center">
                  <FaStar color="#FF69B4" size={26} />
                  <FaStar color="#FF69B4" size={26} />
                  <FaStar color="#FF69B4" size={26} />
                  <FaStar color="#FF69B4" size={26} />
                  <FaRegStarHalfStroke color="#FF69B4" size={26} />
                </div>
                <div className="text-[18px] font-semibold">
                  4.4 de 5 (103 resenhas)
                </div>
              </div>

              <div className="mb-[24px] flex flex-col gap-[10px]">
                <div className="flex h-fit items-center gap-[16px]">
                  <div className="flex items-center gap-[2px]">
                    <FaStar color="#FF69B4" size={14} />
                    <FaStar color="#FF69B4" size={14} />
                    <FaStar color="#FF69B4" size={14} />
                    <FaStar color="#FF69B4" size={14} />
                    <FaRegStarHalfStroke color="#FF69B4" size={14} />
                  </div>
                  <div className="h-[14px] w-[112px] rounded-full bg-[#e0e0e080]">
                    <div
                      className="h-full rounded-full bg-[#333]"
                      style={{ width: "71%" }}
                    ></div>
                  </div>
                  <div className="text-[12px] text-[#7b7b7b]">73</div>
                </div>

                <div className="flex h-fit items-center gap-[16px]">
                  <div className="flex items-center gap-[2px]">
                    <FaStar color="#FF69B4" size={14} />
                    <FaStar color="#FF69B4" size={14} />
                    <FaStar color="#FF69B4" size={14} />
                    <FaStar color="#FF69B4" size={14} />
                    <FaRegStarHalfStroke color="#FF69B4" size={14} />
                  </div>
                  <div className="h-[14px] w-[112px] rounded-full bg-[#e0e0e080] opacity-[0.8]">
                    <div
                      className="h-full rounded-full bg-[#333]"
                      style={{ width: "11%" }}
                    ></div>
                  </div>
                  <div className="text-[12px] text-[#7b7b7b]">11</div>
                </div>

                <div className="flex h-fit items-center gap-[16px]">
                  <div className="flex items-center gap-[2px]">
                    <FaStar color="#FF69B4" size={14} />
                    <FaStar color="#FF69B4" size={14} />
                    <FaStar color="#FF69B4" size={14} />
                    <FaStar color="#FF69B4" size={14} />
                    <FaRegStarHalfStroke color="#FF69B4" size={14} />
                  </div>
                  <div className="h-[14px] w-[112px] rounded-full bg-[#e0e0e080] opacity-[0.6]">
                    <div
                      className="h-full rounded-full bg-[#333]"
                      style={{ width: "12%" }}
                    ></div>
                  </div>
                  <div className="text-[12px] text-[#7b7b7b]">12</div>
                </div>

                <div className="flex h-fit items-center gap-[16px]">
                  <div className="flex items-center gap-[2px]">
                    <FaStar color="#FF69B4" size={14} />
                    <FaStar color="#FF69B4" size={14} />
                    <FaStar color="#FF69B4" size={14} />
                    <FaStar color="#FF69B4" size={14} />
                    <FaRegStarHalfStroke color="#FF69B4" size={14} />
                  </div>
                  <div className="h-[14px] w-[112px] rounded-full bg-[#e0e0e080] opacity-[0.4]">
                    <div
                      className="h-full rounded-full bg-[#333]"
                      style={{ width: "3%" }}
                    ></div>
                  </div>
                  <div className="text-[12px] text-[#7b7b7b]">3</div>
                </div>

                <div className="flex h-fit items-center gap-[16px]">
                  <div className="flex items-center gap-[2px]">
                    <FaStar color="#FF69B4" size={14} />
                    <FaStar color="#FF69B4" size={14} />
                    <FaStar color="#FF69B4" size={14} />
                    <FaStar color="#FF69B4" size={14} />
                    <FaRegStarHalfStroke color="#FF69B4" size={14} />
                  </div>
                  <div className="h-[14px] w-[112px] rounded-full bg-[#e0e0e080]">
                    <div
                      className="h-full rounded-full bg-[#333] opacity-[0.2]"
                      style={{ width: "4%" }}
                    ></div>
                  </div>
                  <div className="text-[12px] text-[#7b7b7b]">4</div>
                </div>
              </div>

              <div className="mb-[24px] flex h-fit w-full justify-center">
                <a
                  href="#"
                  className="w-full cursor-pointer rounded-full bg-[#333] px-[20px] py-[10px] text-center font-bold text-[#fff]"
                  role="button"
                  aria-expanded="false"
                >
                  deixar avaliação
                </a>
              </div>
            </div>
          </div>

          <div
            className="py-[8px]"
            style={{
              borderTop: "1px solid rgba(51, 153, 153, 0.1)",
              borderColor: "rgba(51, 51, 51, 0.1)",
            }}
          >
            <div className="flex items-center gap-2">
              <div className="py-[10px] font-lato text-[14px]">
                mais recente
              </div>
              <FaChevronDown color={"#333"} size={10} />
            </div>
          </div>

          <Reviews />
        </div>
      </div>
    </section>
  );
}
