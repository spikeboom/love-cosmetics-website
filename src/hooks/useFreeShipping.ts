import { useMemo } from "react";
import { FREE_SHIPPING_THRESHOLD, isEconomicaService } from "@/core/pricing/shipping-constants";
import type { FreightService } from "@/contexts/shipping/types";

interface FreeShippingResult {
  qualifies: boolean;
  amountRemaining: number;
  progressPercent: number;
  economicaIndex: number | null;
  economicaOriginalPrice: number | null;
}

export function useFreeShipping(
  subtotalAfterCoupons: number,
  availableServices: FreightService[],
  threshold: number = FREE_SHIPPING_THRESHOLD,
): FreeShippingResult {
  return useMemo(() => {
    const qualifies = subtotalAfterCoupons >= threshold;
    const amountRemaining = Math.max(0, threshold - subtotalAfterCoupons);
    const progressPercent = Math.min(100, (subtotalAfterCoupons / threshold) * 100);

    let economicaIndex: number | null = null;
    let economicaOriginalPrice: number | null = null;

    for (let i = 0; i < availableServices.length; i++) {
      const s = availableServices[i];
      if (isEconomicaService(s.carrier, s.service)) {
        economicaIndex = i;
        economicaOriginalPrice = s.price;
        break;
      }
    }

    return {
      qualifies,
      amountRemaining,
      progressPercent,
      economicaIndex,
      economicaOriginalPrice,
    };
  }, [subtotalAfterCoupons, availableServices, threshold]);
}
