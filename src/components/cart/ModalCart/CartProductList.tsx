import { CartProductItem } from "./CartProductItem";

export function CartProductList({
  cart,
  formatPrice,
  addQuantityProductToCart,
  subtractQuantityProductToCart,
  removeProductFromCart,
}: {
  cart: Record<string, any>;
  formatPrice: (n: number) => string;
  addQuantityProductToCart: (args: { product: any }) => void;
  subtractQuantityProductToCart: (args: { product: any }) => void;
  removeProductFromCart: (args: { product: any }) => void;
}) {
  return (
    <div className="flex flex-col gap-4 p-4">
      {Object.entries(cart).map(([id, product]: any) => (
        <CartProductItem
          key={id}
          product={product}
          formatPrice={formatPrice}
          addQuantity={() => addQuantityProductToCart({ product })}
          subtractQuantity={() => subtractQuantityProductToCart({ product })}
          removeProduct={() => removeProductFromCart({ product })}
        />
      ))}
    </div>
  );
}
