import { formatPrice } from "@/utils/format-price";

export function TotalsSection({ descontos, total }: any) {
  return (
    <>
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
    </>
  );
}