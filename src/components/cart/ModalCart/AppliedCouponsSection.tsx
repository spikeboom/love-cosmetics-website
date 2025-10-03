import { IoCloseCircle } from "react-icons/io5";

export function AppliedCouponsSection({ cupons, removeCoupon }: any) {
  return (
    <>
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
    </>
  );
}