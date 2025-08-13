import { FreightSection } from "./FreightSection";
import { CouponInputSection } from "./CouponInputSection";
import { AppliedCouponsSection } from "./AppliedCouponsSection";
import { TotalsSection } from "./TotalsSection";
import { CheckoutActions } from "./CheckoutActions";

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
      <FreightSection freteValue={freteValue} />
      <CouponInputSection 
        openCupom={openCupom}
        setOpenCupom={setOpenCupom}
        cupom={cupom}
        setCupom={setCupom}
        handleAddCupomLocal={handleAddCupomLocal}
        loadingCupom={loadingCupom}
      />
      <AppliedCouponsSection cupons={cupons} removeCoupon={removeCoupon} />
      <TotalsSection descontos={descontos} total={total} />
      <CheckoutActions 
        setOpenCart={setOpenCart} 
        cart={cart} 
        setSidebarMounted={setSidebarMounted} 
      />
    </div>
  );
}
