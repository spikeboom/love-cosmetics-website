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
      return "Entrega econômica / padrão";
    }
    if (combined.includes("jadlog") && combined.includes("package")) {
      return "Entrega padrão intermediária";
    }
    if (combined.includes("correios") && combined.includes("sedex")) {
      return "Entrega expressa";
    }

    return `${service.carrier} (${service.service})`;
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      {services.map((service, index) => (
        <label
          key={service.serviceCode}
          className={`flex items-center justify-between w-full border rounded-lg p-2 lg:p-3 cursor-pointer transition-all ${
            selectedIndex === index
              ? "border-[#254333] bg-[#F0F9F4]"
              : "border-[#d2d2d2] hover:border-[#254333]"
          }`}
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <input
              type="radio"
              name={radioName}
              checked={selectedIndex === index}
              onChange={() => onSelect(index)}
              className="w-4 h-4 text-[#254333] focus:ring-[#254333]"
            />
            <span className="font-cera-pro font-bold text-[14px] lg:text-[16px] text-[#111111] truncate">
              {getServiceTitle(service)}
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
