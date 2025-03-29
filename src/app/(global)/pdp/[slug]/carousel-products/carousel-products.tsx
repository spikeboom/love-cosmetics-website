"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import IconSacola from "./icon-sacola";
import "./style.css";
import Link from "next/link";
import { useMeuContexto } from "@/components/context/context";

// const arrayProducts = [
//   {
//     image: "/carousel-products/IMG_7996.jpg",
//     name: "hidratante facial",
//     price: "120,00",
//   },
//   {
//     image: "/carousel-products/IMG_8009.jpg",
//     name: "manteiga corporal",
//     price: "90,00",
//   },
//   {
//     image: "/carousel-products/IMG_8020.jpg",
//     name: "máscara de argila",
//     price: "160,00",
//   },
//   {
//     image: "/carousel-products/IMG_8039.jpg",
//     name: "sérum facial",
//     price: "110,00",
//   },
//   {
//     image: "/carousel-products/IMG_8053.jpg",
//     name: "kit especial lové",
//     price: "530,00",
//   },
//   {
//     image: "/carousel-products/IMG_8063.jpg",
//     name: "kit especial lové",
//     price: "780,00",
//   },
//   {
//     image: "/carousel-products/IMG_7969.jpg",
//     name: "espuma facial",
//     price: "90,00",
//   },
// ];

export const Product = ({ data, handlerAdd }: any) => (
  <div>
    <Link href={`/pdp/[slug]`} as={`/pdp/${data.slug}`} className="w-full">
      <div className="relative h-[168px] w-[168px]">
        <Image
          src={
            // `${process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337"}${item.imagem.formats.medium.url}`,
            process.env.NEXT_PUBLIC_STRAPI_URL +
            data.carouselImagensPrincipal[0].imagem.formats.medium.url
          }
          loader={({ src }) => src}
          alt="Product 1"
          fill
          style={{
            objectFit: "cover",
          }}
        />
        {/* <Image
        src={slide}
        loader={({ src }) => src}
        alt={`Slide Before ${index + 1}`}
        fill
        style={{
          objectFit: "cover",
        }}
      /> */}
      </div>
    </Link>
    <div className="h-[114px] px-[12px] py-[8px]">
      <p className="mb-[8px] text-[14px] leading-[1.3]">
        <span className="">{data.nome}</span>
      </p>
      <span className="text-[16px] font-semibold leading-[1] text-[#333]">
        <span className="">R$ {data.preco}</span>
      </span>
    </div>
    <div className="w-full">
      <div
        className="w-full"
        onClick={handlerAdd}
        // href={`/pdp/[slug]`}
        // as={`/pdp/${data.slug}?addToCart=1`}
      >
        <button className="flex items-center rounded-[100px] bg-[#C0392B] px-[32px] py-[8px]">
          <span className="text-[16px] font-semibold leading-[130%] text-[#FFF]">
            comprar
          </span>
          <span className="ml-[4px]">
            <IconSacola />
          </span>
        </button>
      </div>
    </div>
  </div>
);

export const ProductComplete = ({ data, handlerAdd }: any) => (
  <div>
    <Link href={`/pdp/[slug]`} as={`/pdp/${data.slug}`} className="w-full">
      <div className="relative h-[220px] w-[220px]">
        <Image
          src={
            // `${process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337"}${item.imagem.formats.medium.url}`,
            process.env.NEXT_PUBLIC_STRAPI_URL +
            data.carouselImagensPrincipal[0].imagem.formats.medium.url
          }
          loader={({ src }) => src}
          alt="Product 1"
          fill
          style={{
            objectFit: "cover",
          }}
          className="rounded-[8px]"
        />
        {/* <Image
        src={slide}
        loader={({ src }) => src}
        alt={`Slide Before ${index + 1}`}
        fill
        style={{
          objectFit: "cover",
        }}
      /> */}
      </div>
    </Link>
    <div className="h-[160px] px-[8px] py-[8px]">
      <p className="mb-[8px] text-[14px] font-bold leading-[1.3]">
        <span className="">{data.nome}</span>
      </p>
      <p className="mb-[8px] line-clamp-5 overflow-hidden text-ellipsis text-[12px] leading-[1.3]">
        <span className="">{data.descricaoResumida}</span>
      </p>
      <span className="text-[16px] font-semibold leading-[1] text-[#333]">
        <span className="">R$ {data.preco}</span>
      </span>
    </div>
    <div className="flex w-full justify-center">
      <div
        // href={`/pdp/[slug]`}
        // as={`/pdp/${data.slug}?addToCart=1`}
        className="w-full px-[12px]"
        onClick={handlerAdd}
      >
        <div className="flex w-full items-center justify-center rounded-[100px] bg-[#C0392B] px-[32px] py-[8px]">
          <span className="text-[16px] font-semibold leading-[130%] text-[#FFF]">
            comprar
          </span>
          <span className="ml-[4px]">
            <IconSacola />
          </span>
        </div>
      </div>
    </div>
  </div>
);

export function CarouselProducts({
  dataForCarouselMultiple,
  complete,
  title,
  subtitle,
}: any) {
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

  const [isWideScreen, setIsWideScreen] = useState(false);

  useEffect(() => {
    const checkScreenWidth = () => {
      setIsWideScreen(window.innerWidth >= 723);
    };

    // Verifica na montagem
    checkScreenWidth();

    // Adiciona o listener
    window.addEventListener("resize", checkScreenWidth);

    // Cleanup
    return () => {
      window.removeEventListener("resize", checkScreenWidth);
    };
  }, []);

  const { addProductToCart, setSidebarMounted } = useMeuContexto();

  const handleComprar = (produto: any) => {
    addProductToCart(produto);
    setSidebarMounted(true);
  };

  return (
    <div className="px-[16px] py-[24px] font-poppins">
      <h2 className="mb-[4px] text-[16px]">
        {title || "Cuide da sua pele com fórmulas especiais"}
      </h2>
      <p className="mb-[24px] text-[12px] text-[#333333BF]">
        {subtitle ||
          `Descubra combinações perfeitas para hidratar, nutrir e revitalizar sua
        rotina de cuidados.`}
      </p>

      <div>
        <div
          className={`${!isWideScreen ? "my-scrollable-element" : ""} w-full overflow-scroll overflow-y-hidden md:pb-[12px]`}
          ref={scrollableRef}
          onScroll={handleScroll}
        >
          <div className="flex gap-4">
            {dataForCarouselMultiple.map((product: any, index: any) =>
              complete ? (
                <ProductComplete
                  key={product.id}
                  data={product}
                  handlerAdd={() => handleComprar(product)}
                />
              ) : (
                <Product
                  key={product.id}
                  data={product}
                  handlerAdd={() => handleComprar(product)}
                />
              ),
            )}
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
