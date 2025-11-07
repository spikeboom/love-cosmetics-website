'use client';

interface CartSummaryProps {
  subtotal: number;
  frete: number;
  cupom?: number;
  total: number;
  onCheckout: () => void;
}

export function CartSummary({
  subtotal,
  frete,
  cupom = 0,
  total,
  onCheckout,
}: CartSummaryProps) {

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  return (
    <div className="flex flex-col gap-6 self-stretch rounded-lg bg-white p-4 shadow-[0px_1px_3px_1px_rgba(0,0,0,0.15),0px_1px_2px_0px_rgba(0,0,0,0.3)] h-fit">
      <h2 className="w-full font-cera-pro text-2xl font-bold leading-[1.257] text-[#111111]">
        Resumo da compra
      </h2>

      {/* Items */}
      <div className="flex flex-col gap-4 self-stretch">
        {/* Produtos */}
        <div className="flex items-stretch self-stretch gap-8">
          <p className="flex-1 font-cera-pro text-xl font-light leading-[1.257] text-[#111111]">
            Produtos
          </p>
          <p className="font-cera-pro text-xl font-light leading-[1.257] text-right text-[#111111]">
            {formatPrice(subtotal)}
          </p>
        </div>

        {/* Frete */}
        <div className="flex items-center justify-between self-stretch gap-8">
          <p className="font-cera-pro text-xl font-light leading-[1.257] text-[#111111]">
            Frete
          </p>
          <p className="font-cera-pro text-xl font-light leading-[1.257] text-black">
            {formatPrice(frete)}
          </p>
        </div>

        {/* Cupom */}
        {cupom > 0 && (
          <div className="flex items-center justify-between self-stretch gap-8">
            <p className="font-cera-pro text-xl font-light leading-[1.257] text-[#111111]">
              Cupom
            </p>
            <p className="font-cera-pro text-xl font-light leading-[1.257] text-[#009142]">
              -{formatPrice(cupom)}
            </p>
          </div>
        )}
      </div>

      {/* Total */}
      <div className="flex items-stretch self-stretch gap-8">
        <h2 className="flex-1 font-cera-pro text-2xl font-bold leading-[1.257] text-[#111111]">
          Total
        </h2>
        <h2 className="font-cera-pro text-2xl font-bold leading-[1.257] text-[#111111]">
          {formatPrice(total)}
        </h2>
      </div>

      {/* Botão */}
      <div className="flex flex-col gap-4 self-stretch">
        <button
          onClick={onCheckout}
          className="flex items-center justify-center self-stretch rounded-lg bg-[#254333] py-3 hover:bg-[#1a3023] transition-colors"
        >
          <span className="font-cera-pro text-base font-medium text-white">
            Finalizar Compra
          </span>
        </button>
      </div>
    </div>
  );
}
