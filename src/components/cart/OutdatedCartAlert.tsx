'use client';

interface OutdatedCartAlertProps {
  onRefresh: () => void;
  isRefreshing?: boolean;
  isMobile?: boolean;
}

export function OutdatedCartAlert({
  onRefresh,
  isRefreshing = false,
  isMobile = false,
}: OutdatedCartAlertProps) {
  return (
    <div className={`flex flex-col self-stretch gap-3 p-3 bg-[#FFF3CD] border border-[#FFE69C] rounded-lg ${
      isMobile ? 'text-[13px]' : 'text-sm'
    }`}>
      <div className="flex items-start gap-2">
        <svg
          className="w-5 h-5 text-[#856404] flex-shrink-0 mt-0.5"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
        <div className="flex flex-col gap-1">
          <span className="font-cera-pro font-medium text-[#856404]">
            Carrinho desatualizado
          </span>
          <p className="font-cera-pro font-light text-[#856404]">
            Os preços de alguns produtos foram atualizados. Clique em atualizar para continuar.
          </p>
        </div>
      </div>

      <button
        onClick={onRefresh}
        disabled={isRefreshing}
        className={`flex items-center justify-center self-stretch rounded-lg py-2 px-4 transition-colors border border-[#856404] bg-white ${
          isRefreshing
            ? 'opacity-50 cursor-not-allowed'
            : 'hover:bg-[#FFF8E1]'
        }`}
      >
        <div className="flex items-center justify-center gap-2">
          {isRefreshing && (
            <svg className="animate-spin w-4 h-4 text-[#856404]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
          <span className="font-cera-pro font-medium text-[#856404]">
            {isRefreshing ? 'Atualizando...' : 'Atualizar carrinho'}
          </span>
        </div>
      </button>
    </div>
  );
}
