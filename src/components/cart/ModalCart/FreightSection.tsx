import { LuTruck } from "react-icons/lu";
import { CepInput } from "./CepInput";
import { formatPrice } from "@/utils/format-price";
import { useMeuContexto } from "@/components/common/Context/context";

export function FreightSection() {
  const { freight } = useMeuContexto();
  const {
    cep,
    setCep,
    freightValue,
    deliveryTime,
    isLoading,
    error,
    calculateFreight,
    clearError,
    hasCalculated,
  } = freight;

  const handleCalculate = () => {
    if (cep) {
      calculateFreight(cep);
    }
  };

  return (
    <div className="border-t pt-3">
      <CepInput
        value={cep}
        onChange={setCep}
        onCalculate={handleCalculate}
        isLoading={isLoading}
        error={error}
        hasCalculated={hasCalculated}
      />
      
      <div className="flex flex-wrap items-center justify-between gap-x-[12px] gap-y-[8px] mt-2">
        <p className="flex items-center gap-1 pr-[4px] text-[14px]">
          <LuTruck />
          Frete
        </p>
        
        {hasCalculated && !error && (
          <span className="flex items-center gap-1 pr-[4px] text-[12px] font-semibold text-[#7045f5]">
            {deliveryTime}
          </span>
        )}
        
        {!hasCalculated && !isLoading && (
          <span className="flex items-center gap-1 pr-[4px] text-[12px] text-gray-500">
            Informe o CEP
          </span>
        )}
        
        <p className="text-[14px] font-semibold">
          {formatPrice(freightValue)}
        </p>
      </div>
      
      {hasCalculated && !error && (
        <div className="mt-2 p-2 bg-green-50 rounded-md">
          <p className="text-[11px] text-green-700">
            CEP {cep} - Entrega estimada: {deliveryTime}
          </p>
        </div>
      )}
    </div>
  );
}