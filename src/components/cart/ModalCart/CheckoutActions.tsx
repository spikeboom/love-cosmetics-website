import Link from "next/link";

export function CheckoutActions({
  setOpenCart,
  cart,
  setSidebarMounted,
  freight
}: any) {
  const isCartEmpty = Object.keys(cart).length === 0;

  // Validar se:
  // 1. Carrinho não está vazio
  // 2. CEP foi preenchido
  // 3. Frete foi calculado e tem opções disponíveis
  const hasCep = freight?.cep && freight.cep.replace(/\D/g, '').length === 8;
  const hasCalculatedFreight = freight?.hasCalculated && freight?.availableServices?.length > 0;
  const canCheckout = !isCartEmpty && hasCep && hasCalculatedFreight;

  // Determinar mensagem de erro apropriada
  let disabledMessage = "";
  if (isCartEmpty) {
    disabledMessage = "Adicione itens ao carrinho para finalizar o pedido";
  } else if (!hasCep) {
    disabledMessage = "Preencha o CEP para calcular o frete";
  } else if (!hasCalculatedFreight) {
    disabledMessage = "Calcule o frete e selecione uma opção de envio";
  }

  return (
    <div className="flex items-center justify-end gap-[8px]">
      <span
        className="cursor-pointer text-wrap text-right text-[13px] font-bold leading-[1] underline"
        onClick={() => setOpenCart(false)}
      >
        continuar
        <br />
        comprando
      </span>
      {!canCheckout ? (
        <div className="flex flex-col items-end gap-1">
          <button
            className="cursor-not-allowed rounded-[3px] bg-[#ccc] px-[18px] py-[12px] font-bold text-[#fff]"
            disabled
            title={disabledMessage}
          >
            finalizar pedido
          </button>
          {!isCartEmpty && disabledMessage && (
            <span className="text-[10px] text-red-600 max-w-[200px] text-right">
              {disabledMessage}
            </span>
          )}
        </div>
      ) : (
        <Link
          href="/checkout#top"
          className="rounded-[3px] bg-[#C0392B] px-[18px] py-[12px] font-bold text-[#fff]"
        >
          <span
            onClick={() => {
              setSidebarMounted(false);
            }}
          >
            finalizar pedido
          </span>
        </Link>
      )}
    </div>
  );
}