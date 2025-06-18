import { LuTruck } from "react-icons/lu";
import { RiCoupon2Line } from "react-icons/ri";
import { MdOutlineChevronRight } from "react-icons/md";
import { CircularProgress, IconButton, InputBase, Paper } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import Link from "next/link";
import { IoCloseCircle } from "react-icons/io5";
import { formatPrice } from "@/utils/format-price";

export function CartSummary({
  freteValue,
  openCupom,
  setOpenCupom,
  cupom,
  setCupom,
  handleAddCupomLocal,
  loadingCupom,
  cupons,
  removeCoupon,
  descontos,
  total,
  cart,
  setOpenCart,
  setSidebarMounted,
}: any) {
  return (
    <div className="px-[12px] pb-[12px] pt-[4px]">
      <div className="my-[14px] flex flex-wrap items-center justify-between gap-x-[12px] gap-y-[8px]">
        <p className="flex items-center gap-1 pr-[4px] text-[14px]">
          <LuTruck />
          frete
        </p>
        <span className="flex items-center gap-1 pr-[4px] text-[12px] font-semibold text-[#7045f5]">
          entre 3-5 dias
        </span>
        <p className="text-[14px]">R$ {freteValue}</p>
      </div>
      <div className="my-[14px] flex flex-wrap items-center justify-between gap-x-[12px] gap-y-[8px]">
        <p className="flex items-center gap-1 pr-[4px] text-[14px]">
          <RiCoupon2Line />
          cupom
        </p>
        <div className="flex flex-wrap items-center gap-x-[12px] gap-y-[8px]">
          <span
            data-testid="coupon-toggle-button"
            className="flex cursor-pointer items-center gap-1 text-[12px] font-semibold text-[#7045f5]"
            onClick={() => setOpenCupom(!openCupom)}
          >
            inserir código
            <MdOutlineChevronRight size={18} />
          </span>
          {openCupom && (
            <Paper
              component="form"
              onSubmit={(e) => e.preventDefault()}
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
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  setCupom(event.target.value.toUpperCase());
                }}
                inputProps={{
                  "data-testid": "coupon-input",
                }}
              />
              <IconButton
                data-testid="apply-coupon-button"
                type="button"
                aria-label="enviar cupom"
                onClick={handleAddCupomLocal}
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
                <span data-testid="coupon-item">{cupom.codigo}</span>
                <IoCloseCircle
                  data-testid="remove-coupon-button"
                  size={16}
                  className="cursor-pointer"
                  onClick={() => {
                    removeCoupon(cupom);
                  }}
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
        <p className="flex items-center gap-1 pr-[4px] text-[14px]">total</p>
        <span data-testid="cart-summary-total-price">{formatPrice(total)}</span>
      </div>
      <div className="flex items-center justify-end gap-[8px]">
        <span
          className="cursor-pointer text-wrap text-right text-[13px] font-bold leading-[1] underline"
          onClick={() => setOpenCart(false)}
        >
          continuar
          <br />
          comprando
        </span>
        {Object.keys(cart).length === 0 ? (
          <button
            className="cursor-not-allowed rounded-[3px] bg-[#ccc] px-[18px] py-[12px] font-bold text-[#fff]"
            disabled
            title="Adicione itens ao carrinho para finalizar o pedido"
          >
            finalizar pedido
          </button>
        ) : (
          <Link
            href="/checkout#top"
            className="rounded-[3px] bg-[#C0392B] px-[18px] py-[12px] font-bold text-[#fff]"
          >
            <span
              onClick={() => {
                setSidebarMounted(false);
              }}
            >
              finalizar pedido
            </span>
          </Link>
        )}
      </div>
    </div>
  );
}
