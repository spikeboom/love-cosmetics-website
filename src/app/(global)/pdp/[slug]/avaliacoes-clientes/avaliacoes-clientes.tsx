import {
  FaChevronDown,
  FaRegStar,
  FaRegStarHalfStroke,
  FaStar,
} from "react-icons/fa6";
import Reviews from "../reviews/reviews";

interface AvaliacoesClientesProps {
  nota: number;
  quantidadeResenhas: number;
  detalhe_notas: {
    um: number;
    dois: number;
    tres: number;
    quatro: number;
    cinco: number;
  };
  avaliacoes: any[];
}

export function AvaliacoesClientes({
  nota,
  quantidadeResenhas,
  detalhe_notas,
  avaliacoes,
}: AvaliacoesClientesProps) {
  const starSettings = {
    color: "#dcafad",
    size: 26,
  };

  const arrayStars = Array.from({ length: 5 }, (_, index) => {
    if (index < Math.floor(nota))
      return <FaStar key={`full-${index}`} {...starSettings} />;
    if (index === Math.floor(nota))
      return <FaRegStarHalfStroke key={`half-${index}`} {...starSettings} />;
    return <FaRegStar key={`empty-${index}`} {...starSettings} />;
  });

  const minOpacity = 1;
  const maxOpacity = 0.3;

  const rating1 = detalhe_notas?.um / quantidadeResenhas || 0;
  const rating2 = detalhe_notas?.dois / quantidadeResenhas || 0;
  const rating3 = detalhe_notas?.tres / quantidadeResenhas || 0;
  const rating4 = detalhe_notas?.quatro / quantidadeResenhas || 0;
  const rating5 = detalhe_notas?.cinco / quantidadeResenhas || 0;

  const opacity1 =
    Math.round(((1 - rating1) * (maxOpacity - minOpacity) + minOpacity) * 100) /
    100;
  const opacity2 =
    Math.round(((1 - rating2) * (maxOpacity - minOpacity) + minOpacity) * 100) /
    100;
  const opacity3 =
    Math.round(((1 - rating3) * (maxOpacity - minOpacity) + minOpacity) * 100) /
    100;
  const opacity4 =
    Math.round(((1 - rating4) * (maxOpacity - minOpacity) + minOpacity) * 100) /
    100;
  const opacity5 =
    Math.round(((1 - rating5) * (maxOpacity - minOpacity) + minOpacity) * 100) /
    100;

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
                <div className="flex justify-center">{arrayStars}</div>
                <div className="text-[18px] font-semibold">
                  {nota} de 5 ({quantidadeResenhas} resenhas)
                </div>
              </div>

              <div className="mb-[24px] flex flex-col gap-[10px]">
                <div className="flex h-fit items-center gap-[16px]">
                  <div className="flex items-center gap-[2px]">
                    <FaStar color="#dcafad" size={14} />
                    <FaStar color="#dcafad" size={14} />
                    <FaStar color="#dcafad" size={14} />
                    <FaStar color="#dcafad" size={14} />
                    <FaStar color="#dcafad" size={14} />
                  </div>
                  <div className="h-[14px] w-[112px] rounded-full bg-[#e0e0e080]">
                    <div
                      className="h-full rounded-full bg-[#333]"
                      style={{
                        width: `${Math.round((detalhe_notas?.cinco / quantidadeResenhas) * 100)}%`,
                        opacity: opacity5,
                      }}
                    ></div>
                  </div>
                  <div className="text-[12px] text-[#7b7b7b]">
                    {detalhe_notas?.cinco}
                  </div>
                </div>

                <div className="flex h-fit items-center gap-[16px]">
                  <div className="flex items-center gap-[2px]">
                    <FaStar color="#dcafad" size={14} />
                    <FaStar color="#dcafad" size={14} />
                    <FaStar color="#dcafad" size={14} />
                    <FaStar color="#dcafad" size={14} />
                    <FaRegStar color="#dcafad" size={14} />
                  </div>
                  <div className="h-[14px] w-[112px] rounded-full bg-[#e0e0e080]">
                    <div
                      className="h-full rounded-full bg-[#333]"
                      style={{
                        width: `${Math.round((detalhe_notas?.quatro / quantidadeResenhas) * 100)}%`,
                        opacity: opacity4,
                      }}
                    ></div>
                  </div>
                  <div className="text-[12px] text-[#7b7b7b]">
                    {detalhe_notas?.quatro}
                  </div>
                </div>

                <div className="flex h-fit items-center gap-[16px]">
                  <div className="flex items-center gap-[2px]">
                    <FaStar color="#dcafad" size={14} />
                    <FaStar color="#dcafad" size={14} />
                    <FaStar color="#dcafad" size={14} />
                    <FaRegStar color="#dcafad" size={14} />
                    <FaRegStar color="#dcafad" size={14} />
                  </div>
                  <div className="h-[14px] w-[112px] rounded-full bg-[#e0e0e080]">
                    <div
                      className="h-full rounded-full bg-[#333]"
                      style={{
                        width: `${Math.round((detalhe_notas?.tres / quantidadeResenhas) * 100)}%`,
                        opacity: opacity3,
                      }}
                    ></div>
                  </div>
                  <div className="text-[12px] text-[#7b7b7b]">
                    {detalhe_notas?.tres}
                  </div>
                </div>

                <div className="flex h-fit items-center gap-[16px]">
                  <div className="flex items-center gap-[2px]">
                    <FaStar color="#dcafad" size={14} />
                    <FaStar color="#dcafad" size={14} />
                    <FaRegStar color="#dcafad" size={14} />
                    <FaRegStar color="#dcafad" size={14} />
                    <FaRegStar color="#dcafad" size={14} />
                  </div>
                  <div className="h-[14px] w-[112px] rounded-full bg-[#e0e0e080]">
                    <div
                      className="h-full rounded-full bg-[#333]"
                      style={{
                        width: `${Math.round((detalhe_notas?.dois / quantidadeResenhas) * 100)}%`,
                        opacity: opacity2,
                      }}
                    ></div>
                  </div>
                  <div className="text-[12px] text-[#7b7b7b]">
                    {detalhe_notas?.dois}
                  </div>
                </div>

                <div className="flex h-fit items-center gap-[16px]">
                  <div className="flex items-center gap-[2px]">
                    <FaStar color="#dcafad" size={14} />
                    <FaRegStar color="#dcafad" size={14} />
                    <FaRegStar color="#dcafad" size={14} />
                    <FaRegStar color="#dcafad" size={14} />
                    <FaRegStar color="#dcafad" size={14} />
                  </div>
                  <div className="h-[14px] w-[112px] rounded-full bg-[#e0e0e080]">
                    <div
                      className="h-full rounded-full bg-[#333]"
                      style={{
                        width: `${Math.round((detalhe_notas?.um / quantidadeResenhas) * 100)}%`,
                        opacity: opacity1,
                      }}
                    ></div>
                  </div>
                  <div className="text-[12px] text-[#7b7b7b]">
                    {detalhe_notas?.um}
                  </div>
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

          <Reviews avaliacoes={avaliacoes} />
        </div>
      </div>
    </section>
  );
}
