"use client";
import Image from "next/image";
import IconHambuger from "./header/icon-hamburger";
import IconSearch from "./header/icon-search";
import IconLogin from "./header/icon-login";
import IconCart from "./header/icon-cart";
import {
  FaArrowRight,
  FaChevronDown,
  FaChevronLeft,
  FaChevronRight,
  FaFacebook,
  FaInstagram,
  FaPinterest,
  FaRegStarHalfStroke,
  FaStar,
  FaTiktok,
  FaXTwitter,
} from "react-icons/fa6";
import { useState } from "react";
import IconPlus from "./others/icon-plus";
import Tabs from "./tabs";
import Doubts from "./doubts";
import Reviews from "./reviews/reviews";
import IconVegan from "./badges/icon-vegan";
import IconRabbit from "./badges/icon-rabbit";
import IconFragance from "./badges/icon-fragance";
import IconRecicle from "./badges/icon-recicle";
import IconPix from "./payments/icon-pix";
import IconCredCard from "./payments/icon-credcard";
import IconReembolso from "./payments/icon-reembolso";
import CarouselProducts from "./carousel-products/carousel-products";
import "./styles.css";

const timeTransition = 500;

const slides = [
  "/carousel/IMG_7986.jpg",
  "/carousel/IMG_7996.jpg",
  "/carousel/IMG_7985.jpg",
  "/carousel/IMG_7994.jpg",
  "/carousel/IMG_7995.jpg",
];

const qtySlidesBefore = 2;
const qtySlidesAfter = 2;

const totalSlides = slides.length + qtySlidesBefore + qtySlidesAfter;

export default function PdpPage() {
  const percentToMove = 100 / totalSlides;

  const [translateCarousel, setTranslateCarousel] = useState(
    -(percentToMove * qtySlidesBefore),
  );
  const [indexCarousel, setIndexCarousel] = useState(qtySlidesBefore + 1);
  const [notTransitioning, setNotTransitioning] = useState(false);

  const handleNext = () => {
    setNotTransitioning(false);
    setTranslateCarousel((prev) => prev - percentToMove);
    setIndexCarousel((prev) => prev + 1);

    if (indexCarousel + 1 === totalSlides - 1) {
      setTimeout(() => {
        setTranslateCarousel(
          -(percentToMove * (qtySlidesBefore + qtySlidesAfter - 2)),
        );
        setIndexCarousel(qtySlidesBefore + qtySlidesAfter - 1);
        setNotTransitioning(true);
      }, timeTransition);
    }
  };

  const handlePrev = () => {
    setNotTransitioning(false);
    setTranslateCarousel((prev) => prev + percentToMove);
    setIndexCarousel((prev) => prev - 1);

    if (indexCarousel - 1 === 1) {
      setTimeout(() => {
        setTranslateCarousel(
          -(percentToMove * (totalSlides - qtySlidesAfter - qtySlidesBefore)),
        );
        setIndexCarousel(totalSlides - qtySlidesAfter - qtySlidesBefore + 1);
        setNotTransitioning(true);
      }, timeTransition);
    }
  };

  const check_list = (
    <div className="relative flex h-[12px] w-[12px] items-center justify-center rounded-full bg-[#cabbff]">
      <div className="relative h-[8px] w-[8px]">
        <Image
          src={"/list/check.svg"}
          alt={`check icon`}
          fill
          style={{
            objectFit: "contain",
          }}
        />
      </div>
    </div>
  );

  const stylesPulseLove = {
    animatedBox: {
      color: "#333",
      animation: "pulse 3s infinite",
    },
  };

  return (
    <>
      <div className="font-lato text-[#333]">
        <div className="flex w-full justify-center bg-[#FF69B4]">
          <div className="text-white">
            <p className="p-[8px] text-[12px]">
              compre e receba antes do natal *consulte o prazo da sua região🚛
            </p>
          </div>
        </div>
        <section>
          <div className="flex items-center justify-between border-b border-b-[#e5e7eb] px-[16px] py-[12px]">
            <div className="flex grow">
              <span className="mr-[24px] flex items-center">
                <IconHambuger />
              </span>
              <span className="mr-[24px] flex items-center">
                <IconSearch />
              </span>
            </div>

            <div>
              <a
                href="/"
                className="font-playfair text-[32px]"
                style={stylesPulseLove.animatedBox}
              >
                LOVÉ
              </a>
            </div>

            <div className="flex grow justify-end">
              <span className="mx-[16px] flex items-center">
                <IconLogin />
              </span>
              <span className="ml-[8px] flex items-center">
                <IconCart />
              </span>
            </div>
          </div>
        </section>
        <section>
          <div className="px-[18px] pb-[4px] pt-[16px] text-[14px] lowercase text-[#828282]">
            <section className="">
              <nav className="">
                <ol className="flex gap-2">
                  <li className="">
                    <a
                      href="/pdp"
                      className="underline"
                      rel="home"
                      title="Love"
                    >
                      início
                    </a>
                  </li>

                  <li className="">/</li>

                  <li className="">
                    <span className="font-bold">hidratante facial</span>
                  </li>
                </ol>
              </nav>
            </section>
          </div>
          <main className="">
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

                  <span className="text-[12px] font-semibold text-[#666]">
                    4.4
                  </span>

                  <a
                    className="ml-2 text-[12px] font-semibold text-[#666] underline"
                    href=""
                  >
                    103 resenhas
                  </a>
                </span>
              </div>
            </header>
            <div className="relative mx-[-16x] mt-4 h-fit w-full overflow-hidden">
              <button
                className="absolute left-[1em] top-[50%] z-10 flex h-[34px] w-[34px] -translate-y-2/4 items-center justify-center rounded-full bg-[#fafafa]"
                onClick={handlePrev}
              >
                <FaChevronLeft color="#FF69B4" size={16} />
              </button>
              <button
                className="absolute right-[1em] top-[50%] z-10 flex h-[34px] w-[34px] -translate-y-2/4 items-center justify-center rounded-full bg-[#fafafa]"
                onClick={handleNext}
              >
                <FaChevronRight color="#FF69B4" size={16} />
              </button>
              <div
                className="flex w-fit"
                style={{
                  transform: `translateX(${translateCarousel}%)`,
                  transition: notTransitioning
                    ? "none"
                    : `transform ${timeTransition / 1000}s`,
                }}
              >
                {slides.slice(-qtySlidesBefore).map((slide, index) => (
                  <div key={index} className="relative h-[342px] w-[342px]">
                    <Image
                      src={slide}
                      alt={`Slide Before ${index + 1}`}
                      fill
                      style={{
                        objectFit: "cover",
                      }}
                    />
                  </div>
                ))}
                {slides.map((slide, index) => (
                  <div key={index} className="relative h-[342px] w-[342px]">
                    <Image
                      src={slide}
                      alt={`Slide ${index + 1}`}
                      fill
                      style={{
                        objectFit: "cover",
                      }}
                    />
                  </div>
                ))}
                {slides.slice(0, qtySlidesAfter).map((slide, index) => (
                  <div key={index} className="relative h-[342px] w-[342px]">
                    <Image
                      src={slide}
                      alt={`Slide After ${index + 1}`}
                      fill
                      style={{
                        objectFit: "cover",
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
            <article className="px-[16px] text-[#333]">
              <div className="my-[16px]">
                <p className="text-[14px] lowercase leading-[150%]">
                  O hidratante facial possui ação antioxidante, hidratante e
                  regeneradora. Ajuda na cicatrização de feridas, redução de
                  manchas, tratamento de inflamações e fortalecimento da
                  barreira natural da pele. Nutre, revitaliza e previne o
                  envelhecimento precoce​.
                </p>
              </div>

              <div className="my-[16px] list-none">
                <summary>
                  <h2 className="mb-[12px] font-poppins text-[16px] leading-[130%]">
                    o que só ele faz?
                  </h2>
                </summary>
                <div className="text-[14px] lowercase leading-[150%]">
                  <li className="flex items-center gap-1">
                    {check_list} Hidrata profundamente e revitaliza a pele
                  </li>
                  <li className="flex items-center gap-1">
                    {check_list} Ajuda na cicatrização de feridas e redução de
                    manchas
                  </li>
                  <li className="flex items-center gap-1">
                    {check_list} Fortalece a barreira natural da pele
                  </li>
                  <li className="flex items-center gap-1">
                    {check_list} Previne o envelhecimento precoce
                  </li>
                  <li className="flex items-center gap-1">
                    {check_list} Nutre e aumenta a elasticidade
                  </li>
                  <li className="flex items-center gap-1">
                    {check_list} Estimula a renovação celular
                  </li>
                  <li className="flex items-center gap-1">
                    {check_list} Repara danos causados por agentes externos
                  </li>
                  <li className="flex items-center gap-1">
                    {check_list} Proporciona maciez e toque sedoso​
                  </li>
                </div>
              </div>

              <div className="">
                <p className="flex items-center gap-[12px] text-[12px]">
                  <IconPlus />
                  <span className="bg-[#f8f4ff] px-[6px] py-[2px] font-poppins text-[14px] font-semibold leading-[130%] text-[#FF69B4]">
                    399
                  </span>
                  pontos para resgatar no Minha Sallve
                </p>
              </div>

              <div className="my-[16px]">
                <Tabs />

                <div className="my-[16px] rounded-[8px] bg-[#f2eeff] p-[20px]">
                  <h2 className="mb-[18px] text-center font-poppins text-[16px] leading-[130%]">
                    como usar essa fórmula?
                  </h2>
                  <div className="flex gap-2 rounded-[8px] bg-[#fff] px-[14px] py-[20px]">
                    <div className="flex h-[32px] w-[32px] items-center justify-center rounded-full border-[2px] border-[#333] p-[16px] text-[16px] font-black text-[#333]">
                      <span>1</span>
                    </div>
                    <div className="text-[14px] leading-[150%] text-[#666]">
                      Com a pele limpa, aplique uma camada homogênea do
                      hidratante facial no rosto pela manhã e à noite. Espalhe
                      suavemente com as mãos até completa absorção, utilizando
                      movimentos circulares. Caso necessário, reaplique ao longo
                      do dia para reforçar a hidratação e proteção​.
                    </div>
                  </div>
                </div>

                <Doubts />
              </div>

              <div className="my-[16px] flex justify-around py-[20px]">
                <figure className="flex flex-col items-center">
                  <IconVegan />
                  <figcaption className="text-[12px]">vegano</figcaption>
                </figure>
                <figure className="flex flex-col items-center">
                  <IconRabbit />
                  <figcaption className="text-[12px]">sem crueldade</figcaption>
                </figure>
                <figure className="flex flex-col items-center">
                  <IconFragance />
                  <figcaption className="text-[12px]">sem fragância</figcaption>
                </figure>
                <figure className="flex flex-col items-center">
                  <IconRecicle />
                  <figcaption className="text-[12px]">reciclável</figcaption>
                </figure>
              </div>

              <div className="my-[16px] flex flex-col rounded-[8px] border-[1px] border-[#ddd]">
                <h2 className="mt-[10px] self-center font-poppins text-[14px] text-[#FF69B4]">
                  Pague com
                </h2>
                <div className="flex justify-center gap-[8px]">
                  <span className="flex items-center gap-1 p-[8px] text-[12px] text-[#666]">
                    <IconPix /> <span>pix</span>
                  </span>
                  <span className="flex items-center gap-1 p-[8px] text-[12px] text-[#666]">
                    <IconCredCard /> <span>cartão de crédito em 3x</span>
                  </span>
                </div>
                <div className="flex justify-center gap-[8px] border-t-[1px] border-[#ddd]">
                  <span className="flex items-center gap-1 p-[8px] text-[12px] text-[#666]">
                    <IconReembolso />
                    <span>
                      reembolso garantido em 30 dias em compras no site
                    </span>
                  </span>
                </div>
              </div>
            </article>
            <div className="px-[16px] py-[24px] font-poppins">
              <h2 className="mb-[4px] text-[16px]">
                complete sua rotina e ganhe descontos
              </h2>
              <p className="mb-[24px] text-[12px] text-[#333333BF]">
                até 15% OFF na compra de 2 ou + fórmulas
              </p>
              <CarouselProducts />
            </div>
            <section className="px-[16px] font-poppins">
              <div>
                <div className="flex justify-center">
                  <h3 className="my-[24px] text-[24px] font-semibold">
                    quem usa
                  </h3>
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
          </main>
        </section>

        <footer className="mt-[15px]">
          <div className="flex flex-col items-center">
            <div className="flex gap-4">
              <FaXTwitter size={24} color="#333" className="opacity-[0.7]" />
              <FaFacebook size={24} color="#333" className="opacity-[0.7]" />
              <FaPinterest size={24} color="#333" className="opacity-[0.7]" />
              <FaInstagram size={24} color="#333" className="opacity-[0.7]" />
              <FaTiktok size={24} color="#333" className="opacity-[0.7]" />
            </div>

            <div className="mt-[40px] flex w-full flex-col gap-[56px] px-[32px] pb-[42px]">
              <div className="">
                <ul className="flex flex-wrap justify-center gap-x-[38px] gap-y-[22px] underline">
                  <li>
                    <a href="" className="">
                      oi@sallve.com.br
                    </a>
                  </li>
                  <li>
                    <a href="" className="">
                      whatsapp
                    </a>
                  </li>
                  <li>
                    <a href="" className="">
                      blog da sallve
                    </a>
                  </li>
                  <li>
                    <a href="" className="">
                      quiz da pele
                    </a>
                  </li>
                  <li>
                    <a href="" className="">
                      vem ser um afiliado sallve
                    </a>
                  </li>
                  <li>
                    <a href="" className="">
                      encontre nas farmácias
                    </a>
                  </li>
                  <li>
                    <a href="" className="">
                      avaliações
                    </a>
                  </li>
                </ul>
              </div>

              <div className="flex items-center justify-between rounded-[200px] bg-[#efefef] px-[24px] py-[12px] font-poppins text-[14px]">
                <span>mais sobre a sallve</span>
                <FaChevronDown />
              </div>
            </div>

            <div className="px-[40px] py-[16px] text-center text-[12px] lowercase leading-[150%]">
              <p className="flex flex-wrap justify-center gap-1">
                <span>sobre os nossos ingredientes: </span>
                <a
                  className="underline"
                  href="https://www.sallve.com.br/blogs/sallve/acido-glicolico-o-que-e-quais-os-beneficios"
                  target="_blank"
                >
                  Ácido Glicólico
                </a>
                {" · "}
                <a
                  className="underline"
                  href="/collections/acido-hialuronico"
                  target="_blank"
                >
                  Ácido Hialurônico
                </a>
                {" · "}
                <a
                  className="underline"
                  href="https://www.sallve.com.br/blogs/sallve/acido-latico"
                  target="_blank"
                >
                  Ácido Lático
                </a>
                {" · "}
                <a
                  className="underline"
                  href="https://www.sallve.com.br/blogs/sallve/acido-malico"
                  target="_blank"
                >
                  Ácido Málico
                </a>
                {" · "}
                <a
                  className="underline"
                  href="https://www.sallve.com.br/blogs/sallve/acido-salicilico-o-que-e-para-que-serve-e-quando-usar"
                  target="_blank"
                >
                  Ácido Salicílico
                </a>
                {" · "}
                <a
                  className="underline"
                  href="https://www.sallve.com.br/blogs/sallve/acido-tranexamico"
                  target="_blank"
                >
                  Ácido Tranexâmico
                </a>
                {" · "}
                <a
                  className="underline"
                  href="https://www.sallve.com.br/blogs/sallve/alantoina-beneficios"
                  target="_blank"
                >
                  Alantoína
                </a>
                {" · "}
                <a
                  className="underline"
                  href="https://www.sallve.com.br/blogs/sallve/alfa-arbutin"
                  target="_blank"
                >
                  Alfa-arbutin
                </a>
                {" · "}
                <a
                  className="underline"
                  href="https://www.sallve.com.br/blogs/sallve/bisabolol"
                  target="_blank"
                >
                  Alfa-Bisabolol
                </a>
                {" · "}
                <a
                  className="underline"
                  href="https://www.sallve.com.br/blogs/sallve/aloe-vera-beneficios"
                  target="_blank"
                >
                  Aloe Vera
                </a>
                {" · "}
                <a
                  className="underline"
                  href="https://www.sallve.com.br/blogs/sallve/argila-verde"
                  target="_blank"
                >
                  Argila Verde
                </a>
                {" · "}
                <a
                  className="underline"
                  href="https://www.sallve.com.br/blogs/sallve/beta-glucan-beneficios"
                  target="_blank"
                >
                  Beta-glucan
                </a>
                {" · "}
                <a
                  className="underline"
                  href="https://www.sallve.com.br/blogs/sallve/cafeina-beneficios"
                  target="_blank"
                >
                  Cafeína
                </a>
                {" · "}
                <a
                  className="underline"
                  href="https://www.sallve.com.br/blogs/sallve/carnosina"
                  target="_blank"
                >
                  Carnosina
                </a>
                {" · "}
                <a
                  className="underline"
                  href="https://www.sallve.com.br/blogs/sallve/ceramidas?_pos=1&amp;_sid=9a2603d37&amp;_ss=r"
                  target="_blank"
                >
                  Ceramidas
                </a>
                {" · "}
                <a
                  className="underline"
                  href="https://www.sallve.com.br/blogs/sallve/cogumelo-fu-ling"
                  target="_blank"
                >
                  Cogumelo Fu Ling
                </a>
                {" · "}
                <a
                  className="underline"
                  href="https://www.sallve.com.br/blogs/sallve/eletrolitos"
                  target="_blank"
                >
                  Eletrólitos
                </a>
                {" · "}
                <a
                  className="underline"
                  href="https://www.sallve.com.br/blogs/sallve/alcacuz"
                  target="_blank"
                >
                  Extrato de Alcaçuz
                </a>
                {" · "}
                <a
                  className="underline"
                  href="https://www.sallve.com.br/blogs/sallve/buchu"
                  target="_blank"
                >
                  Extrato de Buchu
                </a>
                {" · "}
                <a
                  className="underline"
                  href="https://www.sallve.com.br/blogs/sallve/extrato-de-cafe"
                  target="_blank"
                >
                  Extrato de Café
                </a>
                {" · "}
                <a
                  className="underline"
                  href="https://www.sallve.com.br/blogs/sallve/hamamelis"
                  target="_blank"
                >
                  Extrato de Hamamélis
                </a>
                {" · "}
                <a
                  className="underline"
                  href="https://www.sallve.com.br/blogs/sallve/extrato-de-moringa"
                  target="_blank"
                >
                  Extrato de Moringa
                </a>
                {" · "}
                <a
                  className="underline"
                  href="https://www.sallve.com.br/blogs/sallve/extrato-de-physalis"
                  target="_blank"
                >
                  Extrato de Physalis
                </a>
                {" · "}
                <a
                  className="underline"
                  href="https://www.sallve.com.br/blogs/sallve/extrato-tara"
                  target="_blank"
                >
                  Extrato de Tara
                </a>
                {" · "}
                <a
                  className="underline"
                  href="https://www.sallve.com.br/blogs/sallve/fermentados-naturais"
                  target="_blank"
                >
                  Fermentados Vegetais
                </a>
                {" · "}
                <a
                  className="underline"
                  href="https://www.sallve.com.br/blogs/sallve/lha-beneficios"
                  target="_blank"
                >
                  LHA
                </a>
                {" · "}
                <a
                  className="underline"
                  href="https://www.sallve.com.br/blogs/sallve/manteiga-de-abacate-beneficios"
                  target="_blank"
                >
                  Manteiga de Abacate
                </a>
                {" · "}
                <a
                  className="underline"
                  href="https://www.sallve.com.br/blogs/sallve/manteiga-de-karite"
                  target="_blank"
                >
                  Manteiga de Karité
                </a>
                {" · "}
                <a
                  className="underline"
                  href="https://www.sallve.com.br/blogs/sallve/manteiga-de-shorea-para-labios-ressecados"
                  target="_blank"
                >
                  Manteiga de Shorea
                </a>
                {" · "}
                <a
                  className="underline"
                  href="https://www.sallve.com.br/blogs/sallve/melao-kalahari-beneficios"
                  target="_blank"
                >
                  Melão do Kalahari
                </a>
                {" · "}
                <a
                  className="underline"
                  href="https://www.sallve.com.br/blogs/sallve/niacinamida-beneficios"
                  target="_blank"
                >
                  Niacinamida
                </a>
                {" · "}
                <a
                  className="underline"
                  href="https://www.sallve.com.br/blogs/sallve/oleo-de-macadamia"
                  target="_blank"
                >
                  Óleo de Macadâmia
                </a>
                {" · "}
                <a
                  className="underline"
                  href="https://www.sallve.com.br/blogs/sallve/conheca-o-oleo-de-rosa-mosqueta-e-quais-os-seus-beneficios"
                  target="_blank"
                >
                  Óleo de Rosa Mosqueta
                </a>
                {" · "}
                <a
                  className="underline"
                  href="https://www.sallve.com.br/blogs/sallve/omega-7"
                  target="_blank"
                >
                  Ômega 7
                </a>
                {" · "}
                <a
                  className="underline"
                  href="https://www.sallve.com.br/blogs/sallve/omega-9"
                  target="_blank"
                >
                  Ômega 9
                </a>
                {" · "}
                <a
                  className="underline"
                  href="https://www.sallve.com.br/blogs/sallve/pantenol-beneficios"
                  target="_blank"
                >
                  Pantenol
                </a>
                {" · "}
                <a
                  className="underline"
                  href="https://www.sallve.com.br/blogs/sallve/phytoesqualano"
                  target="_blank"
                >
                  Phytoesqualano
                </a>
                {" · "}
                <a
                  className="underline"
                  href="https://www.sallve.com.br/blogs/sallve/prebioticos-beneficios"
                  target="_blank"
                >
                  Prebióticos
                </a>
                {" · "}
                <a
                  className="underline"
                  href="https://www.sallve.com.br/blogs/sallve/resveratrol-beneficios"
                  target="_blank"
                >
                  Resveratrol
                </a>
                {" · "}
                <a
                  className="underline"
                  href="/collections/retinol"
                  target="_blank"
                >
                  Retinol Biomimético
                </a>
                {" · "}
                <a
                  className="underline"
                  href="https://www.sallve.com.br/blogs/sallve/taurina"
                  target="_blank"
                >
                  Taurina
                </a>
                {" · "}
                <a
                  className="underline"
                  href="/collections/vitamina-c"
                  target="_blank"
                >
                  Vitamina C
                </a>
                {" · "}
                <a
                  className="underline"
                  href="https://www.sallve.com.br/blogs/sallve/vitamina-e-o-que-este-ingrediente-faz-pela-sua-pele"
                  target="_blank"
                >
                  Vitamina E
                </a>
                {" · "}
                <a
                  className="underline"
                  href="https://www.sallve.com.br/blogs/sallve/4-terpineol"
                  target="_blank"
                >
                  4-terpinol
                </a>
                {" · "}
                <a
                  className="underline"
                  href="https://www.sallve.com.br/blogs/sallve/quais-os-beneficios-do-oleo-de-melaleuca?_pos=2&amp;_sid=965958c6f&amp;_ss=r"
                  target="_blank"
                >
                  Melaleuca
                </a>
                {" · "}
                <a
                  className="underline"
                  href="https://www.sallve.com.br/blogs/sallve/centella-asiatica"
                  target="_blank"
                >
                  Centella Asiática
                </a>
                {" · "}
                <a
                  className="underline"
                  href="https://www.sallve.com.br/blogs/sallve/oleo-de-cominho-preto"
                  target="_blank"
                >
                  Óleo de cominho preto
                </a>
                {" · "}
                <a
                  className="underline"
                  href="https://www.sallve.com.br/blogs/sallve/oleo-de-jojoba"
                  target="_blank"
                >
                  Óleo de jojoba
                </a>
                {" · "}
                <a
                  className="underline"
                  href="/collections/retinol"
                  target="_blank"
                >
                  Retinol
                </a>
                ·
              </p>
            </div>

            <div className="mb-[24px] mt-[40px]">
              <div className="relative h-[29px] w-[220px]">
                <Image
                  src={"/footer/cards.avif"}
                  alt={`cred cards`}
                  fill
                  style={{
                    objectFit: "contain",
                  }}
                />
              </div>
            </div>

            <div className="w-full bg-[#333] py-[36px] text-[#fff]">
              <div className="px-[24px]">
                <div className="flex flex-col items-center px-[20px] pt-[36px]">
                  <div className="mb-[12px]">
                    <a href="/" className="font-playfair text-[32px]">
                      LOVÉ
                    </a>
                  </div>

                  <div className="flex flex-col items-center gap-[8px] text-center text-[12px]">
                    <small className="">
                      2024 Sallve. Todos os direitos reservados.
                    </small>
                    <small className="">
                      Rua Cônego Eugênio Leite, 767 - São Paulo/SP - CEP:
                      05414-012. CNPJ: 32.124.385/0001-95
                    </small>
                    <small className="">
                      <a
                        className=""
                        href="https://www.sallve.com.br/pages/termos"
                      >
                        termos de uso
                      </a>
                      <a
                        className=""
                        href="https://www.sallve.com.br/pages/privacidade"
                      >
                        política de privacidade
                      </a>
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </footer>
        <div className="h-[100px] bg-[#333]"></div>
      </div>

      <div className="fixed bottom-0 z-10 w-full bg-[#fff] font-poppins">
        <div className="flex justify-center bg-[#f1eaf5] py-[4px] text-center text-[12px]">
          <p>
            leve 2 ou + fórmulas e ganhe <strong>até 15% OFF ✨</strong>
          </p>
        </div>

        <div className="flex items-center gap-[20px] whitespace-nowrap px-[16px] py-[12px]">
          <div className="h-fit w-fit">
            <p className="flex w-fit flex-col">
              <strong className="text-[14px]">R$ 79,90</strong>

              <span className="text-[12px] text-[#333333BF]">
                ou 3x R$ 26,63
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
    </>
  );
}
