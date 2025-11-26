import { getTipoDesconto } from "@/utils/cart-calculations";
import { ResumoProps } from "./types";

export function PagamentoResumo({
  cartArray,
  subtotal,
  freteGratis,
  valorFrete,
  descontos,
  cupons = [],
  valorTotal,
  enderecoCompleto,
  formatPrice,
  onAlterarProdutos,
  onAlterarEntrega,
}: ResumoProps) {
  const tipoDesconto = getTipoDesconto(cupons);
  return (
    <div className="bg-[#f8f3ed] rounded-[8px] w-full">
      {/* Produtos */}
      <div className="p-4 flex flex-col gap-4">
        <div className="flex items-center justify-between w-full">
          <span className="font-cera-pro font-bold text-[18px] lg:text-[20px] text-[#111111]">
            Produtos
          </span>
          <span className="font-cera-pro font-bold text-[18px] lg:text-[20px] text-black">
            {formatPrice(subtotal)}
          </span>
        </div>
        <div className="font-cera-pro font-light text-[14px] lg:text-[16px] text-[#111111]">
          {cartArray.map((item: any, index: number) => (
            <p key={index}>{item.nome}</p>
          ))}
        </div>
        <button
          onClick={onAlterarProdutos}
          className="font-cera-pro font-light text-[14px] lg:text-[16px] text-[#254333] underline text-left w-fit"
        >
          Alterar
        </button>
      </div>

      <div className="bg-white h-px w-full" />

      {/* Entrega */}
      <div className="p-4 flex flex-col gap-4">
        <div className="flex items-center justify-between w-full">
          <span className="font-cera-pro font-bold text-[18px] lg:text-[20px] text-[#111111]">
            Entrega
          </span>
          <span
            className={`font-cera-pro font-bold text-[18px] lg:text-[20px] ${
              freteGratis ? "text-[#009142]" : "text-black"
            }`}
          >
            {freteGratis ? "Gratis" : formatPrice(valorFrete)}
          </span>
        </div>
        <p className="font-cera-pro font-light text-[14px] lg:text-[16px] text-[#111111]">
          {enderecoCompleto}
        </p>
        <button
          onClick={onAlterarEntrega}
          className="font-cera-pro font-light text-[14px] lg:text-[16px] text-[#254333] underline text-left w-fit"
        >
          Alterar
        </button>
      </div>

      <div className="bg-white h-px w-full" />

      {/* Descontos (positivo) ou Acréscimo (negativo) */}
      {descontos !== 0 && (
        <>
          <div className="p-4 flex items-center justify-between">
            <span className="font-cera-pro font-bold text-[18px] lg:text-[20px] text-[#111111]">
              {descontos > 0 ? 'Descontos' : 'Acréscimo'}{tipoDesconto && <span className="font-light text-[12px] text-[#666666] ml-1">({tipoDesconto})</span>}
            </span>
            <span className={`font-cera-pro font-bold text-[18px] lg:text-[20px] ${descontos > 0 ? 'text-[#009142]' : 'text-[#B3261E]'}`}>
              {descontos > 0 ? '-' : '+'} {formatPrice(Math.abs(descontos))}
            </span>
          </div>
          <div className="bg-white h-px w-full" />
        </>
      )}

      {/* Valor Total */}
      <div className="p-4 flex items-center justify-between">
        <span className="font-cera-pro font-bold text-[18px] lg:text-[20px] text-[#111111]">
          Valor total
        </span>
        <span className="font-cera-pro font-bold text-[18px] lg:text-[20px] text-black">
          {formatPrice(valorTotal)}
        </span>
      </div>
    </div>
  );
}
