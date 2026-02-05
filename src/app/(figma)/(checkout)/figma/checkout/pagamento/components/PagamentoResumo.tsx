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
        <div className="flex flex-col gap-2">
          {cartArray.map((item: any, index: number) => {
            // Calcular desconto para exibição (mesma lógica do CartProductsList)
            const temCupomAplicado = !!item.cupom_applied || !!item.backup?.preco;
            const precoAtual = item.preco;
            const precoAntesDosCupom = item.backup?.preco ?? item.preco;

            let precoAntigo: number | undefined;
            if (temCupomAplicado) {
              precoAntigo = item.backup?.preco_de ?? item.preco_de ?? precoAntesDosCupom;
              if (precoAntigo && precoAntigo <= precoAtual) {
                precoAntigo = undefined;
              }
            } else {
              precoAntigo = item.preco_de && item.preco_de > precoAtual
                ? item.preco_de
                : undefined;
            }

            const descontoPercentual =
              precoAntigo && precoAntigo > precoAtual
                ? Math.ceil(((precoAntigo - precoAtual) / precoAntigo) * 100)
                : undefined;

            return (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-cera-pro font-light text-[14px] lg:text-[16px] text-[#111111]">
                    {item.nome} {item.quantity > 1 && `(x${item.quantity})`}
                  </span>
                  {descontoPercentual && (
                    <span className="bg-[#b3261e] text-white text-[10px] font-medium px-1.5 py-0.5 rounded">
                      {descontoPercentual}% OFF
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {precoAntigo && (
                    <span className="font-cera-pro font-light text-[12px] text-[#999] line-through">
                      {formatPrice(precoAntigo * item.quantity)}
                    </span>
                  )}
                  <span className="font-cera-pro font-medium text-[14px] lg:text-[16px] text-[#111]">
                    {formatPrice(precoAtual * item.quantity)}
                  </span>
                </div>
              </div>
            );
          })}
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
