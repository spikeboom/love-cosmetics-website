'use client';

import { LuTruck } from "react-icons/lu";

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

  return (
    <div className="flex flex-col gap-2 w-full">
      {services.map((service, index) => (
        <label
          key={service.serviceCode}
          className={`flex items-center justify-between w-full border rounded-lg p-3 cursor-pointer transition-all ${
            selectedIndex === index
              ? "border-[#254333] bg-[#F0F9F4]"
              : "border-[#d2d2d2] hover:border-[#254333]"
          }`}
        >
          <div className="flex items-center gap-3 flex-1">
            <input
              type="radio"
              name={radioName}
              checked={selectedIndex === index}
              onChange={() => onSelect(index)}
              className="w-4 h-4 text-[#254333] focus:ring-[#254333]"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <LuTruck className="text-[#B3261E] flex-shrink-0" size={16} />
                <span className="font-cera-pro font-bold text-[14px] lg:text-[16px] text-[#111111]">
                  {service.carrier}
                </span>
                <span className="font-cera-pro font-light text-[12px] lg:text-[14px] text-[#666666]">
                  ({service.service})
                </span>
              </div>
              <p className="font-cera-pro font-light text-[12px] lg:text-[14px] text-[#666666] mt-1">
                Entrega em {service.deliveryTime}{" "}
                {service.deliveryTime === 1 ? "dia util" : "dias uteis"}
              </p>
            </div>
          </div>
          <div className="text-right ml-2">
            <p
              className={`font-cera-pro font-bold text-[16px] lg:text-[18px] ${
                service.price === 0 ? "text-[#009142]" : "text-[#254333]"
              }`}
            >
              {service.price === 0 ? "Gratis" : formatPrice(service.price)}
            </p>
          </div>
        </label>
      ))}
    </div>
  );
}
