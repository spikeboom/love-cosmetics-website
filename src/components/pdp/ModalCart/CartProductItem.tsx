import Image from "next/image";
import { FaMinus, FaPlus } from "react-icons/fa6";
import { IoPricetag, IoCloseCircle } from "react-icons/io5";

export function CartProductItem({
  product,
  formatPrice,
  addQuantity,
  subtractQuantity,
  removeProduct,
}: {
  product: any;
  formatPrice: (n: number) => string;
  addQuantity: () => void;
  subtractQuantity: () => void;
  removeProduct: () => void;
}) {
  return (
    <div
      data-testid="cart-product-item"
      className="mx-[12px] mb-[6px] mt-[16px] flex items-center border-b-[1px] border-b-[#efefef] pb-[8px]"
    >
      <a
        href={product.slug ? `/pdp/${product.slug}` : undefined}
        className="mr-[12px] h-full"
      >
        <div className="relative h-[60px] w-[60px]">
          <Image
            src={
              process.env.NEXT_PUBLIC_STRAPI_URL +
              product?.carouselImagensPrincipal?.[0]?.imagem?.formats?.thumbnail
                ?.url
            }
            loader={({ src }) => src}
            alt={`Image x`}
            fill
            style={{ objectFit: "cover" }}
          />
        </div>
      </a>
      <div className="w-full">
        <div className="mb-[6px] flex items-center justify-between">
          <h4 className="font-poppins text-[13px] font-semibold">
            {product?.nome}
          </h4>
          <IoCloseCircle
            data-testid="remove-product-button"
            color="#d0d0d0"
            size={16}
            className="cursor-pointer"
            onClick={removeProduct}
          />
        </div>
        <div className="flex items-center gap-[8px]">
          <div className="flex items-center gap-[4px] rounded-[3px] border-[1px] border-[#c4c4c4] p-[5px] font-poppins text-[14px] font-bold">
            <FaMinus
              data-testid="decrement-button"
              onClick={subtractQuantity}
            />
            <span data-testid="cart-product-item-quantity">
              {product?.quantity}
            </span>
            <FaPlus
              data-testid="increment-button"
              className="cursor-pointer"
              onClick={addQuantity}
            />
          </div>
          {(product.tag_desconto_1 || product.tag_desconto_2) && (
            <div className="flex h-fit items-center gap-1 whitespace-nowrap rounded-[3px] bg-[#eee9ff] px-[4px] text-[11px] font-medium text-[#333333bf]">
              <IoPricetag color="#333" />
              {(() => {
                const tag = product.tag_desconto_1 || product.tag_desconto_2;
                const match = tag.match(/(\d+([.,]\d+)?)/);
                if (!match) return tag + " OFF";
                const valor = parseFloat(match[0].replace(",", "."));
                const total = valor * (product?.quantity || 1);
                const formatted = formatPrice(total);
                return tag.replace(match[0], formatted) + " OFF";
              })()}
            </div>
          )}
          <div className="w-full">
            {product.preco_de && (
              <span
                data-testid="cart-product-item-unit-price"
                className="block text-end text-[12px] font-bold text-[#a5a5a5] line-through"
              >
                R$ {formatPrice(product?.preco_de)}
              </span>
            )}
            <span
              data-testid="cart-product-item-unit-price-discounted"
              className="block text-end text-[14px] font-semibold"
            >
              R$ {formatPrice(product?.preco)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
