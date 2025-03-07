"use client";
import { useRef, useState } from "react";
import Image from "next/image";
import IconSacola from "./icon-sacola";
import "./style.css";

const arrayProducts = [
  {
    image: "/carousel-products/IMG_7996.jpg",
    name: "hidratante facial",
    price: "120,00",
  },
  {
    image: "/carousel-products/IMG_8009.jpg",
    name: "manteiga corporal",
    price: "90,00",
  },
  {
    image: "/carousel-products/IMG_8020.jpg",
    name: "máscara de argila",
    price: "160,00",
  },
  {
    image: "/carousel-products/IMG_8039.jpg",
    name: "sérum facial",
    price: "110,00",
  },
  {
    image: "/carousel-products/IMG_8053.jpg",
    name: "kit especial lové",
    price: "530,00",
  },
  {
    image: "/carousel-products/IMG_8063.jpg",
    name: "kit especial lové",
    price: "780,00",
  },
  {
    image: "/carousel-products/IMG_7969.jpg",
    name: "espuma facial",
    price: "90,00",
  },
];

export const Product = ({ data }: any) => (
  <div>
    <div className="relative h-[168px] w-[168px]">
      <Image
        src={data.image}
        alt="Product 1"
        fill
        style={{
          objectFit: "cover",
        }}
      />
    </div>
    <div className="h-[114px] px-[12px] py-[8px]">
      <p className="mb-[8px] text-[14px] leading-[1.3]">
        <span className="">{data.name}</span>
      </p>
      <span className="text-[16px] font-semibold leading-[1] text-[#333]">
        <span className="">R$ {data.price}</span>
      </span>
    </div>
    <div className="w-full">
      <button className="flex items-center rounded-[100px] bg-[#dcafad] px-[32px] py-[8px]">
        <span className="text-[16px] font-semibold leading-[130%] text-[#FFF]">
          comprar
        </span>
        <span className="ml-[4px]">
          <IconSacola />
        </span>
      </button>
    </div>
  </div>
);

export function CarouselProducts() {
  const scrollableRef = useRef(null);
  const [scrollPercentage, setScrollPercentage] = useState(0);

  const handleScroll = () => {
    const element = scrollableRef.current;
    if (element) {
      const { scrollLeft, scrollWidth, clientWidth } = element;
      const maxScroll = scrollWidth - clientWidth;
      const percentage = (scrollLeft / maxScroll) * 100;
      setScrollPercentage(percentage);
    }
  };

  const base = 100 / 3;

  const breaks = [base, base * 2];

  return (
    <div className="px-[16px] py-[24px] font-poppins">
      <h2 className="mb-[4px] text-[16px] lowercase">
        Cuide da sua pele com fórmulas especiais
      </h2>
      <p className="mb-[24px] text-[12px] lowercase text-[#333333BF]">
        Descubra combinações perfeitas para hidratar, nutrir e revitalizar sua
        rotina de cuidados.
      </p>

      <div>
        <div
          className="my-scrollable-element w-full overflow-scroll"
          ref={scrollableRef}
          onScroll={handleScroll}
        >
          <div className="flex gap-4">
            {arrayProducts.map((product, index) => (
              <Product key={index} data={product} />
            ))}
          </div>
        </div>
        <ul className="mt-[24px] flex w-full justify-center gap-2">
          <li>
            <button
              className={`h-[16px] rounded-[100px]`}
              style={
                scrollPercentage < breaks[0]
                  ? {
                      width: 69,
                      backgroundColor: "#dbdbdb",
                      transition: "background-color 2s ease, width 2s ease",
                    }
                  : {
                      width: 16,
                      backgroundColor: "#f1f1f1",
                      transition: "background-color 2s ease, width 2s ease",
                    }
              }
              type="button"
            ></button>
          </li>
          <li>
            <button
              className={`h-[16px] rounded-[100px]`}
              style={
                scrollPercentage >= breaks[0] && scrollPercentage < breaks[1]
                  ? {
                      width: 69,
                      backgroundColor: "#dbdbdb",
                      transition: "background-color 2s ease, width 2s ease",
                    }
                  : {
                      width: 16,
                      backgroundColor: "#f1f1f1",
                      transition: "background-color 2s ease, width 2s ease",
                    }
              }
              type="button"
            ></button>
          </li>
          <li>
            <button
              className={`h-[16px] rounded-[100px]`}
              style={
                scrollPercentage >= breaks[1]
                  ? {
                      width: 69,
                      backgroundColor: "#dbdbdb",
                      transition: "background-color 2s ease, width 2s ease",
                    }
                  : {
                      width: 16,
                      backgroundColor: "#f1f1f1",
                      transition: "background-color 2s ease, width 2s ease",
                    }
              }
              type="button"
            ></button>
          </li>
        </ul>
      </div>
    </div>
  );
}
