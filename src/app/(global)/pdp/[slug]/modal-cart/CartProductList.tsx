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
    <div className="relative h-full overflow-y-auto">
      <div className="absolute bottom-0 left-0 right-0 top-0 w-full">
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
    </div>
  );
}
