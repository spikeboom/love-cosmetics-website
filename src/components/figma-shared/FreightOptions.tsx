'use client';

interface FreightService {
  carrier: string;
  service: string;
  price: number;
  deliveryTime: number;
  serviceCode: string;
}

interface FreightOptionsProps {
  services: FreightService[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  radioName?: string;
}

export function FreightOptions({
  services,
  selectedIndex,
  onSelect,
  radioName = "freight-option",
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
      return "Entrega Econômica";
    }
    if (combined.includes("jadlog") && combined.includes("package")) {
      return "Entrega Padrão";
    }
    if (combined.includes("correios") && combined.includes("sedex")) {
      return "Entrega Expressa";
    }

    return `${service.carrier} (${service.service})`;
  };

  const sortedEntries = services
    .map((service, index) => ({ service, originalIndex: index }))
    .sort((a, b) => b.service.deliveryTime - a.service.deliveryTime);

  return (
    <div className="flex flex-col gap-2 w-full">
      {sortedEntries.map(({ service, originalIndex }) => (
        <label
          key={service.serviceCode}
          className={`flex items-center justify-between w-full border rounded-lg p-2 lg:p-3 cursor-pointer transition-all ${
            selectedIndex === originalIndex
              ? "border-[#254333] bg-[#F0F9F4]"
              : "border-[#d2d2d2] hover:border-[#254333]"
          }`}
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <input
              type="radio"
              name={radioName}
              checked={selectedIndex === originalIndex}
              onChange={() => onSelect(originalIndex)}
              className="w-4 h-4 text-[#254333] focus:ring-[#254333]"
            />
            <span className="font-cera-pro font-bold text-[14px] lg:text-[16px] text-[#111111] truncate">
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
          <div className="ml-3 flex items-center gap-2 flex-shrink-0">
            <span className="font-cera-pro font-light text-[12px] lg:text-[14px] text-[#666666] whitespace-nowrap">
              {service.deliveryTime} dia(s) úteis
            </span>
            <span
              className={`font-cera-pro font-bold text-[14px] lg:text-[16px] whitespace-nowrap ${
                service.price === 0 ? "text-[#009142]" : "text-[#254333]"
              }`}
            >
              {service.price === 0 ? "Grátis" : formatPrice(service.price)}
            </span>
          </div>
        </label>
      ))}
    </div>
  );
}
