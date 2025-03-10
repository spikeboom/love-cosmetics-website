"use client";

import { useState, useEffect } from "react";
import { IoClose, IoCloseCircle, IoSearchCircleOutline } from "react-icons/io5";
import { LuShoppingCart, LuTruck } from "react-icons/lu";
import "./style.css";
import Image from "next/image";
import { FaMinus, FaPlus } from "react-icons/fa6";
import { IoMdPricetag } from "react-icons/io";
import { MdOutlineChevronRight } from "react-icons/md";
import { RiCoupon2Line } from "react-icons/ri";
import { useMeuContexto } from "@/components/context/context";
import Link from "next/link";
import {
  CircularProgress,
  IconButton,
  InputBase,
  Paper,
  TextField,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import { fetchCupom } from "@/modules/cupom/domain";
import { useSnackbar } from "notistack";
import CloseIcon from "@mui/icons-material/Close";

export function ModalCart() {
  const {
    sidebarMounted,
    setSidebarMounted,
    cart,
    addQuantityProductToCart,
    subtractQuantityProductToCart,
    removeProductFromCart,
    total,
    cupons,
    handleCupom,
    descontos,
  } = useMeuContexto();

  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const animationDuration = 700;
  const [openCart, setOpenCart] = useState(false);

  useEffect(() => {
    if (!openCart) {
      const timer = setTimeout(() => {
        setSidebarMounted(false);
      }, animationDuration);
      return () => clearTimeout(timer);
    }
  }, [openCart, animationDuration]);

  useEffect(() => {
    if (sidebarMounted) {
      setOpenCart(true);
    }
  }, [sidebarMounted, animationDuration]);

  const [cupom, setCupom] = useState("");
  const [loadingCupom, setLoadingCupom] = useState(false);
  const [openCupom, setOpenCupom] = useState(false);

  const handleAddCupom = async () => {
    if (!!cupom) {
      if (cupons.find((c: any) => c.codigo === cupom)) {
        enqueueSnackbar("Esse cupom já foi adicionado!", {
          variant: "error",
          persist: true,
          action: (key) => (
            <IconButton onClick={() => closeSnackbar(key)} size="small">
              <CloseIcon sx={{ color: "white" }} />
            </IconButton>
          ),
        });
        setOpenCupom(false);
        return;
      }
      setLoadingCupom(true);
      const { data } = await fetchCupom({ code: cupom });
      if (!data?.[0]) {
        enqueueSnackbar(`Cupom ${cupom} não encontrado!`, {
          variant: "error",
          persist: true,
          action: (key) => (
            <IconButton onClick={() => closeSnackbar(key)} size="small">
              <CloseIcon sx={{ color: "white" }} />
            </IconButton>
          ),
        });
        setLoadingCupom(false);
        return;
      }
      handleCupom(data?.[0]);
      setLoadingCupom(false);
      setOpenCupom(false);
    }
  };

  return (
    <>
      {sidebarMounted && (
        <>
          <div className="fixed top-0 z-[998] h-full w-full bg-black opacity-50 transition-all"></div>
          <div
            className="fixed top-0 z-[999] h-full w-[calc(100%-20px)] bg-white font-poppins transition-all md:max-w-[600px]"
            style={{
              transitionDuration: `${animationDuration}ms`,
              right: openCart ? "0" : "-100%",
            }}
          >
            <div className="flex h-full flex-col justify-between">
              <div>
                <div className="mt-[4px] flex items-center justify-between px-[16px] pb-[8px] pt-[8px]">
                  <div className="flex items-center gap-3">
                    <LuShoppingCart size={16} />
                    <h2 className="font-poppins text-[14px]">seu carrinho</h2>
                  </div>
                  <IoClose
                    size={16}
                    className="cursor-pointer"
                    onClick={() => setOpenCart(false)}
                  />
                </div>

                {/* <div className="mx-[16px]">
                  <p className="w-full pt-[8px] text-center font-poppins text-[12px]">
                    Eba! Você ganhou <strong>15% de desconto</strong>!
                  </p>
                  <div className="barra my-[8px]"></div>
                </div> */}

                {Object.entries(cart).map(([id, product]: any) => (
                  <div
                    key={id}
                    className="mx-[12px] mb-[6px] mt-[16px] flex items-center border-b-[1px] border-b-[#efefef] pb-[8px]"
                  >
                    <div className="mr-[12px] h-full">
                      <div className="relative h-[60px] w-[60px]">
                        <Image
                          src={
                            process.env.NEXT_PUBLIC_STRAPI_URL +
                            product?.carouselImagensPrincipal?.[0]?.imagem
                              ?.formats?.thumbnail?.url
                          }
                          loader={({ src }) => src}
                          alt={`Image x`}
                          fill
                          style={{
                            objectFit: "cover",
                          }}
                        />
                      </div>
                    </div>
                    <div className="w-full">
                      <div className="mb-[6px] flex items-center justify-between">
                        <h4 className="font-poppins text-[13px] font-semibold">
                          {product?.nome}
                        </h4>
                        <IoCloseCircle
                          color="#d0d0d0"
                          size={16}
                          className="cursor-pointer"
                          onClick={() => removeProductFromCart({ product })}
                        />
                      </div>

                      <div className="flex items-center gap-[8px]">
                        <div className="flex items-center gap-[4px] rounded-[3px] border-[1px] border-[#c4c4c4] p-[5px] font-poppins text-[14px] font-bold">
                          <FaMinus
                            onClick={() =>
                              subtractQuantityProductToCart({ product })
                            }
                          />
                          <span>{product?.quantity}</span>
                          <FaPlus
                            className="cursor-pointer"
                            onClick={() =>
                              addQuantityProductToCart({ product })
                            }
                          />
                        </div>

                        {/* <div className="flex h-fit items-center gap-1 whitespace-nowrap rounded-[3px] bg-[#eee9ff] px-[4px] text-[11px] font-medium text-[#333333bf]">
                          <IoMdPricetag color="#333" />
                          15% OFF
                        </div> */}

                        <div className="w-full">
                          <span className="block text-end text-[12px] font-bold text-[#a5a5a5] line-through">
                            R${" "}
                            {(product?.preco * 1.15)
                              ?.toFixed(2)
                              .toString()
                              .replace(".", ",")}
                          </span>
                          <span className="block text-end text-[14px] font-semibold">
                            R$ {product?.preco?.toString().replace(".", ",")}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="px-[12px] pb-[12px] pt-[4px]">
                <div className="my-[14px] flex flex-wrap items-center justify-between gap-x-[12px] gap-y-[8px]">
                  <p className="flex items-center gap-1 pr-[4px] text-[14px]">
                    <LuTruck />
                    frete
                  </p>

                  {/* <span className="flex items-center gap-1 pr-[4px] text-[12px] font-semibold text-[#7045f5]">
                    consultar prazo
                    <MdOutlineChevronRight size={18} />
                  </span> */}

                  <span className="flex items-center gap-1 pr-[4px] text-[12px] font-semibold text-[#7045f5]">
                    entre 3-5 dias
                    {/* <MdOutlineChevronRight size={18} /> */}
                  </span>

                  <p className="text-[14px]">R$ 15</p>
                </div>

                <div className="my-[14px] flex flex-wrap items-center justify-between gap-x-[12px] gap-y-[8px]">
                  <p className="flex items-center gap-1 pr-[4px] text-[14px]">
                    <RiCoupon2Line />
                    cupom
                  </p>

                  <div className="flex flex-wrap items-center gap-x-[12px] gap-y-[8px]">
                    <span
                      className="flex cursor-pointer items-center gap-1 text-[12px] font-semibold text-[#7045f5]"
                      onClick={() => setOpenCupom(!openCupom)}
                    >
                      inserir código
                      <MdOutlineChevronRight size={18} />
                    </span>

                    {openCupom && (
                      <Paper
                        component="form"
                        sx={{
                          p: "2px 4px",
                          display: "flex",
                          alignItems: "center",
                          backgroundColor: "#f1f1f1",
                          borderRadius: "3px",
                          width: "180px",
                        }}
                      >
                        <InputBase
                          sx={{ ml: 1, flex: 1 }}
                          value={cupom}
                          onChange={(
                            event: React.ChangeEvent<HTMLInputElement>,
                          ) => {
                            setCupom(event.target.value);
                          }}
                        />
                        <IconButton
                          type="button"
                          aria-label="enviar cupom"
                          onClick={handleAddCupom}
                        >
                          {loadingCupom ? (
                            <CircularProgress size={24} />
                          ) : (
                            <SendIcon color="primary" />
                          )}
                        </IconButton>
                      </Paper>
                    )}
                  </div>
                </div>

                {cupons.length > 0 && (
                  <div className="my-[14px] flex flex-wrap items-center justify-between gap-x-[12px] gap-y-[8px]">
                    <div className="flex items-center gap-1 pr-[4px] text-[14px]">
                      cupons aplicados
                    </div>
                    <div className="flex items-center gap-1">
                      {cupons.map((cupom: any, index: number) => (
                        <div
                          key={index}
                          className="flex items-center gap-1 rounded-[3px] bg-[#f1f1f1] px-[4px] py-[2px] text-[12px] font-semibold"
                        >
                          <span>{cupom.codigo}</span>
                          <IoCloseCircle
                            size={16}
                            className="cursor-pointer"
                            onClick={() => handleCupom(cupom)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {descontos ? (
                  <div className="my-[14px] flex items-center justify-between font-semibold">
                    <p className="flex items-center gap-1 pr-[4px] text-[14px]">
                      descontos
                    </p>

                    <p className="flex items-center gap-1 text-[14px]">
                      R$ {descontos?.toFixed(2).toString().replace(".", ",")}
                    </p>
                  </div>
                ) : null}

                <div className="my-[14px] flex items-center justify-between font-semibold">
                  <p className="flex items-center gap-1 pr-[4px] text-[14px]">
                    total
                  </p>

                  <p className="flex items-center gap-1 text-[14px]">
                    R$ {total?.toFixed(2).toString().replace(".", ",")}
                  </p>
                </div>
                <div className="flex items-center justify-end gap-[8px]">
                  <span className="text-wrap text-right text-[13px] font-bold leading-[1] underline">
                    continuar
                    <br />
                    comprando
                  </span>

                  <Link
                    href="/checkout"
                    className="rounded-[3px] bg-[#C0392B] px-[18px] py-[12px] font-bold text-[#fff]"
                  >
                    finalizar pedido
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
