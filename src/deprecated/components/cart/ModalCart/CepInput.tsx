import { useState } from "react";
import { LuMapPin, LuLoader, LuSearch, LuX } from "react-icons/lu";

interface CepInputProps {
  value: string;
  onChange: (value: string) => void;
  onCalculate: () => void;
  onClear?: () => void;
  isLoading: boolean;
  error: string | null;
  hasCalculated: boolean;
}

export function CepInput({
  value,
  onChange,
  onCalculate,
  onClear,
  isLoading,
  error,
  hasCalculated,
}: CepInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    onChange(inputValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onCalculate();
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    // Calcular frete ao sair do campo se tiver CEP válido
    const cleanCep = value.replace(/\D/g, '');
    if (cleanCep.length === 8 && !hasCalculated && !isLoading) {
      onCalculate();
    }
  };

  const handleClear = () => {
    if (onClear) {
      onClear();
    }
  };

  return (
    <div className="mb-3">
      <div className="mb-2 flex items-center gap-2">
        <LuMapPin className="text-[14px] text-gray-600" />
        <span className="text-[13px] font-medium text-gray-700">
          Calcular frete e prazo
        </span>
      </div>

      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={handleBlur}
          placeholder="00000-000"
          maxLength={9}
          className={`w-full rounded-md border px-3 py-2 text-[14px] transition-all duration-200 ${isFocused ? "border-[#7045f5] ring-1 ring-[#7045f5]/20" : "border-gray-300"} ${error ? "border-red-500" : ""} ${hasCalculated && !error ? "border-green-500" : ""} pr-20`}
          disabled={isLoading}
        />

        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {/* Loading spinner */}
          {isLoading && (
            <LuLoader className="animate-spin text-[16px] text-[#7045f5]" />
          )}

          {/* Success check + Clear button */}
          {!isLoading && hasCalculated && !error && (
            <>
              <svg
                className="h-4 w-4 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              {onClear && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="hover:bg-gray-100 rounded-full p-1 transition-colors"
                  title="Limpar CEP"
                >
                  <LuX className="text-[16px] text-gray-500 hover:text-red-500" />
                </button>
              )}
            </>
          )}

          {/* Search button - show when not loading and not calculated */}
          {!isLoading && !hasCalculated && value.replace(/\D/g, '').length === 8 && (
            <button
              type="button"
              onClick={onCalculate}
              className="hover:bg-gray-100 rounded-full p-1 transition-colors"
              title="Calcular frete"
            >
              <LuSearch className="text-[16px] text-[#7045f5] hover:text-[#5835c7]" />
            </button>
          )}
        </div>
      </div>

      {error && <p className="mt-1 text-[12px] text-red-500">{error}</p>}

      {!error && hasCalculated && (
        <p className="mt-1 text-[12px] text-green-600">
          Frete calculado com sucesso!
        </p>
      )}

      {!value && !error && (
        <p className="mt-1 text-[11px] text-gray-500">
          Digite seu CEP para calcular o frete
        </p>
      )}
    </div>
  );
}
