import Link from "next/link";

export function CheckoutActions({
  setOpenCart,
  cart,
  setSidebarMounted,
  hasCalculatedFreight
}: any) {
  const isCartEmpty = Object.keys(cart).length === 0;
  const canCheckout = !isCartEmpty && hasCalculatedFreight;

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
        <button
          className="cursor-not-allowed rounded-[3px] bg-[#ccc] px-[18px] py-[12px] font-bold text-[#fff]"
          disabled
          title={
            isCartEmpty
              ? "Adicione itens ao carrinho para finalizar o pedido"
              : "Calcule o frete antes de finalizar o pedido"
          }
        >
          finalizar pedido
        </button>
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