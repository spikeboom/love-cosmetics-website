import { LuTruck } from "react-icons/lu";

export function FreightSection({ freteValue }: { freteValue: string }) {
  return (
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
  );
}