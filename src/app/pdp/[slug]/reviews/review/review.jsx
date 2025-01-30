"use client";

import { FaRegStar, FaRegStarHalfStroke, FaStar } from "react-icons/fa6";
import { GoPerson } from "react-icons/go";
import { MdCheckCircle } from "react-icons/md";

const Review = ({ review }) => {
  console.log({ review });

  const nota = review.nota;

  const starSettings = {
    color: "#FF69B4",
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
    <div
      className="py-[16px]"
      style={{
        borderTop: "1px solid rgba(51, 153, 153, 0.1)",
        borderColor: "rgba(51, 51, 51, 0.1)",
      }}
    >
      <div className="mb-[10px]">
        <div className="mb-[8px] flex items-center justify-between">
          <div className="flex gap-[0.5]">{arrayStars}</div>
          <span className="text-[80%] text-[#7b7b7b]">{review.data}</span>
        </div>

        <div className="flex gap-2">
          <div
            className="relative rounded-[8px] p-2"
            style={{
              backgroundColor: "rgba(224, 224, 224, 0.5)",
            }}
          >
            <GoPerson size={24} />
            <MdCheckCircle
              size={14}
              className="absolute bottom-[2px] right-[2px]"
            />
          </div>

          <span className="flex h-fit items-center gap-2">
            <span className="text-[16px]">{review.nome}</span>
            <span className="h-fit rounded-[4px] bg-[#333] px-[8px]">
              {review.verificado && (
                <span className="text-[12px] text-[#fff]">verificado</span>
              )}
            </span>
          </span>
        </div>
      </div>

      <div className="leading-[1.4]">
        <div className="text-[15px]">
          <p>{review.resposta_texto}</p>
        </div>
        <div className="my-[16px] p-[12px]">
          <div className="mb-[16px]">
            <div className="flex flex-col">
              <b className="text-[14px]">
                você recomendaria ele para uma amiga ou amigo?
              </b>
              <span className="text-[12px]">
                {review.voce_recomenda ? "sim" : "não"}
              </span>
            </div>
            <div className="flex flex-col">
              <b className="text-[14px]">qual sua idade?</b>
              <span className="text-[12px]">{review.idade}</span>
            </div>
            <div className="flex flex-col">
              <b className="text-[14px]">qual é o seu tipo de pele do rosto?</b>
              <span className="text-[12px]">{review.tipo_pele}</span>
            </div>
            <div className="flex flex-col">
              <b className="text-[14px]">e sua pele do rosto é sensível?</b>
              <span className="text-[12px]">
                {review.pele_sensivel ? "sim" : "não"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {review.resposta_texto && (
        <div
          className="my-[5px] rounded-[8px] px-[16px] py-[10px] text-[15px]"
          style={{
            backgroundColor: "rgba(51, 51, 51, 0.1)",
          }}
        >
          <div className="mb-[5px]">
            <b className="">{review.resposta_autor}</b> respondeu:
          </div>

          <div>
            <p>{review.resposta_texto}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Review;
