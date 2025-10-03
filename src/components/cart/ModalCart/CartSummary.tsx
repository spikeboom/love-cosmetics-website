import { FreightSection } from "./FreightSection";
import { CouponInputSection } from "./CouponInputSection";
import { AppliedCouponsSection } from "./AppliedCouponsSection";
import { TotalsSection } from "./TotalsSection";
import { CheckoutActions } from "./CheckoutActions";
import { useMeuContexto } from "@/components/common/Context/context";

export function CartSummary({
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
  const { freight } = useMeuContexto();

  return (
    <div className="px-[12px] pb-[12px] pt-[4px]">
      <FreightSection />
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
        hasCalculatedFreight={freight.hasCalculated}
      />
    </div>
  );
}
