'use client';

import { isEconomicaService } from "@/core/pricing/shipping-constants";

interface FreightService {
  carrier: string;
  service: string;
  price: number;
  deliveryTime: number;
  serviceCode: string;
}

interface FreightOptionsProps {
  services: FreightService[];
  selectedIndex?: number;
  onSelect?: (index: number) => void;
  radioName?: string;
  readOnly?: boolean;
  freeShippingQualified?: boolean;
  economicaOriginalPrice?: number | null;
}

const TruckIcon = () => (
  <div className="flex-shrink-0 w-[36px] h-[36px] rounded-full bg-[#E0F2E9] flex items-center justify-center">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M16 3H1V16H16V3Z" stroke="#009142" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M16 8H20L23 11V16H16V8Z" stroke="#009142" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M5.5 21C6.88071 21 8 19.8807 8 18.5C8 17.1193 6.88071 16 5.5 16C4.11929 16 3 17.1193 3 18.5C3 19.8807 4.11929 21 5.5 21Z" stroke="#009142" strokeWidth="1.5"/>
      <path d="M18.5 21C19.8807 21 21 19.8807 21 18.5C21 17.1193 19.8807 16 18.5 16C17.1193 16 16 17.1193 16 18.5C16 19.8807 17.1193 21 18.5 21Z" stroke="#009142" strokeWidth="1.5"/>
    </svg>
  </div>
);

const BoltIcon = () => (
  <div className="flex-shrink-0 w-[36px] h-[36px] rounded-full bg-[#E8E8E8] flex items-center justify-center">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="#333333" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  </div>
);

export function FreightOptions({
  services,
  selectedIndex,
  onSelect,
  radioName = "freight-option",
  readOnly = false,
  freeShippingQualified = false,
  economicaOriginalPrice,
}: FreightOptionsProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  };

  const getServiceTitle = (service: FreightService) => {
    const carrier = service.carrier.toLowerCase();
    const name = service.service.toLowerCase();
    const combined = `${carrier} ${name}`;

    if (combined.includes("correios") && combined.includes("pac")) {
      return "Econômica";
    }
    if (combined.includes("jadlog") && combined.includes("package")) {
      return "Padrão";
    }
    if (combined.includes("correios") && combined.includes("sedex")) {
      return "Expressa";
    }

    return `${service.carrier} (${service.service})`;
  };

  const isEconomica = (service: FreightService) =>
    isEconomicaService(service.carrier, service.service);

  const isExpressa = (service: FreightService) => {
    const combined = `${service.carrier} ${service.service}`.toLowerCase();
    return combined.includes("sedex");
  };

  const sortedEntries = services
    .map((service, index) => ({ service, originalIndex: index }))
    .sort((a, b) => b.service.deliveryTime - a.service.deliveryTime);

  const renderIcon = (service: FreightService) => {
    if (isExpressa(service)) return <BoltIcon />;
    return <TruckIcon />;
  };

  const renderPriceArea = (service: FreightService) => {
    const economica = isEconomica(service);
    const isFree = service.price === 0;

    if (economica && freeShippingQualified) {
      return (
        <div className="flex flex-col items-end gap-[2px]">
          <div className="flex items-center gap-[6px]">
            {economicaOriginalPrice != null && economicaOriginalPrice > 0 && (
              <span className="font-cera-pro font-light text-[12px] text-[#999999] line-through whitespace-nowrap">
                {formatPrice(economicaOriginalPrice)}
              </span>
            )}
            <span className="font-cera-pro font-bold text-[14px] lg:text-[16px] text-[#009142] whitespace-nowrap">
              GRÁTIS
            </span>
          </div>
          <span className="font-cera-pro font-light text-[11px] text-[#009142] whitespace-nowrap">
            Frete grátis aplicado
          </span>
        </div>
      );
    }

    if (economica && !freeShippingQualified) {
      return (
        <div className="flex flex-col items-end gap-[4px]">
          <span
            className={`font-cera-pro font-bold text-[14px] lg:text-[16px] whitespace-nowrap ${
              isFree ? "text-[#009142]" : "text-[#254333]"
            }`}
          >
            {isFree ? "Grátis" : formatPrice(service.price)}
          </span>
          <span className="inline-flex items-center gap-[4px] bg-[#E0F2E9] text-[#009142] font-cera-pro font-medium text-[10px] px-[8px] py-[2px] rounded-[4px] whitespace-nowrap">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
              <path d="M20 12V22H4V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M22 7H2V12H22V7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 22V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            ou grátis acima de R$ 149
          </span>
        </div>
      );
    }

    return (
      <span
        className={`font-cera-pro font-bold text-[14px] lg:text-[16px] whitespace-nowrap ${
          isFree ? "text-[#009142]" : "text-[#254333]"
        }`}
      >
        {isFree ? "Grátis" : formatPrice(service.price)}
      </span>
    );
  };

  const renderCard = (service: FreightService, originalIndex: number) => {
    const economica = isEconomica(service);
    const isSelected = selectedIndex === originalIndex;
    const highlightGreen = economica && freeShippingQualified && (readOnly || isSelected);

    const cardClasses = `flex items-center gap-[12px] w-full border rounded-[12px] p-[12px] lg:p-[14px] transition-all ${
      highlightGreen
        ? "border-[#009142] bg-[#F0F9F4]"
        : readOnly
          ? "border-[#d2d2d2]"
          : isSelected
            ? "border-[#254333] bg-[#F0F9F4]"
            : "border-[#d2d2d2] hover:border-[#254333]"
    }`;

    const content = (
      <>
        {renderIcon(service)}
        <div className="flex flex-col gap-[2px] flex-1 min-w-0">
          <div className="flex items-center gap-[6px]">
            <span className="font-cera-pro font-bold text-[14px] lg:text-[16px] text-[#111111]">
              {getServiceTitle(service)}
            </span>
            <span className="relative group flex-shrink-0">
              <svg className="w-3.5 h-3.5 text-[#999999] cursor-help" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block bg-[#333] text-white text-[11px] px-2 py-1 rounded whitespace-nowrap z-50">
                {service.carrier} {service.service}
              </span>
            </span>
          </div>
          <span className="font-cera-pro font-light text-[12px] lg:text-[13px] text-[#666666]">
            até {service.deliveryTime} dias úteis
          </span>
        </div>
        <div className="ml-auto flex-shrink-0">
          {renderPriceArea(service)}
        </div>
      </>
    );

    if (readOnly) {
      return (
        <div key={service.serviceCode} className={cardClasses}>
          {content}
        </div>
      );
    }

    return (
      <label key={service.serviceCode} className={`${cardClasses} cursor-pointer`}>
        <input
          type="radio"
          name={radioName}
          checked={selectedIndex === originalIndex}
          onChange={() => onSelect?.(originalIndex)}
          className="sr-only"
        />
        {content}
      </label>
    );
  };

  const hasAnyFreeShipping = freeShippingQualified && sortedEntries.some(({ service }) => isEconomica(service));

  return (
    <div className="flex flex-col gap-[8px] w-full">
      {sortedEntries.map(({ service, originalIndex }) => renderCard(service, originalIndex))}

      {/* Nota informativa quando frete grátis está ativo */}
      {hasAnyFreeShipping && (
        <div className="flex items-start gap-[8px] bg-[#FFF8E1] rounded-[8px] p-[10px] mt-[4px]">
          <svg className="w-[16px] h-[16px] text-[#F5B100] flex-shrink-0 mt-[1px]" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <p className="font-cera-pro font-light text-[12px] text-[#333333] leading-[1.4]">
            O frete grátis é válido apenas para a opção <strong className="font-bold">Econômica</strong>. As opções <strong className="font-bold">Padrão e Expressa</strong> continuam com cobrança.
          </p>
        </div>
      )}
    </div>
  );
}
