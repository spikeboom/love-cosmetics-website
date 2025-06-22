import Image from "next/image";
import Link from "next/link";

// Componente para a imagem do produto
function ProductImage({ imageUrl, alt }: { imageUrl: string; alt: string }) {
  return (
    <div className="relative h-[60px] w-[60px]">
      <Image
        src={imageUrl}
        loader={({ src }) => src}
        alt={alt}
        fill
        style={{ objectFit: "cover" }}
      />
    </div>
  );
}

// Componente para o botão de adicionar ao carrinho
function AddToCartButton({
  item,
  setCarouselIndex,
  addProductToCart,
}: {
  item: any;
  setCarouselIndex: (fn: (i: number) => number) => void;
  addProductToCart: (item: any) => void;
}) {
  const handleAddToCart = () => {
    setCarouselIndex((prev) => (prev === 0 ? prev : prev - 1));
    addProductToCart({
      ...item,
      id: item.id,
      nome: item.nome,
      preco: item.preco,
      preco_de: null,
      slug: null,
    });
  };

  return (
    <button
      className="rounded bg-red-500 px-3 py-1 text-xs text-white hover:bg-red-600"
      onClick={handleAddToCart}
    >
      Adicionar
    </button>
  );
}

// Componente para o conteúdo clicável do produto
function ClickableProductContent({
  item,
  setOpenCart,
}: {
  item: any;
  setOpenCart: () => void;
}) {
  return (
    <Link
      href={`/pdp/${item.slug}`}
      className="flex flex-1 items-center"
      onClick={() => setOpenCart()}
    >
      <ProductImage imageUrl={item.imageUrl} alt={item.nome} />
      <p className="flex-1 pl-4 pr-2 text-sm">{item.nome}</p>
    </Link>
  );
}

// Componente para o conteúdo não clicável do produto
function NonClickableProductContent({ item }: { item: any }) {
  return (
    <>
      <ProductImage imageUrl={item.imageUrl} alt={item.nome} />
      <p className="flex-1 pl-4 pr-2 text-sm">{item.nome}</p>
    </>
  );
}

// Componente para o item individual do produto
function ProductItem({
  item,
  setCarouselIndex,
  addProductToCart,
  formatPrice,
  setOpenCart,
}: {
  item: any;
  setCarouselIndex: (fn: (i: number) => number) => void;
  addProductToCart: (item: any) => void;
  formatPrice: (n: number) => string;
  setOpenCart: () => void;
}) {
  const isClickable = item.backgroundFlags?.includes("clickable");

  return (
    <div className="w-full flex-shrink-0 px-2">
      <div className="flex items-center justify-between rounded border p-2">
        {isClickable ? (
          <ClickableProductContent item={item} setOpenCart={setOpenCart} />
        ) : (
          <NonClickableProductContent item={item} />
        )}
        <div className="flex flex-col gap-1">
          <span className="px-4 text-sm font-semibold">
            R$ {formatPrice(item.preco)}
          </span>
          <AddToCartButton
            item={item}
            setCarouselIndex={setCarouselIndex}
            addProductToCart={addProductToCart}
          />
        </div>
      </div>
    </div>
  );
}

// Componente para os controles de navegação
function CarouselControls({
  carouselIndex,
  setCarouselIndex,
  totalItems,
}: {
  carouselIndex: number;
  setCarouselIndex: (fn: (i: number) => number) => void;
  totalItems: number;
}) {
  return (
    <>
      <button
        className="absolute left-0 top-1/2 z-10 h-[35px] w-[35px] -translate-y-1/2 rounded-full bg-[#EFAE75] p-2 text-[#5A3E2B] hover:text-black disabled:bg-[#F5D1B1] disabled:text-[#A86E45]"
        onClick={() => setCarouselIndex((i) => Math.max(i - 1, 0))}
        disabled={carouselIndex === 0}
      >
        &lt;
      </button>
      <button
        className="absolute right-0 top-1/2 z-10 h-[35px] w-[35px] -translate-y-1/2 rounded-full bg-[#EFAE75] p-2 text-[#5A3E2B] hover:text-black disabled:bg-[#F5D1B1] disabled:text-[#A86E45]"
        onClick={() => setCarouselIndex((i) => Math.min(i + 1, totalItems - 1))}
        disabled={carouselIndex >= totalItems - 1}
      >
        &gt;
      </button>
    </>
  );
}

export function SuggestedProductsCarousel({
  suggestedProducts,
  carouselIndex,
  setCarouselIndex,
  addProductToCart,
  formatPrice,
  setOpenCart,
}: {
  suggestedProducts: any[];
  carouselIndex: number;
  setCarouselIndex: (fn: (i: number) => number) => void;
  addProductToCart: (item: any) => void;
  formatPrice: (n: number) => string;
  setOpenCart: () => void;
}) {
  return (
    <div className="border-b border-t">
      <h3 className="text-md p-4 pb-0 font-medium">Você também pode gostar:</h3>
      <div className="relative my-2 mb-3">
        <CarouselControls
          carouselIndex={carouselIndex}
          setCarouselIndex={setCarouselIndex}
          totalItems={suggestedProducts.length}
        />
        <div className="mx-5 overflow-hidden">
          <div
            className="flex transition-transform duration-300"
            style={{ transform: `translateX(-${carouselIndex * 100}%)` }}
          >
            {suggestedProducts.map((item) => (
              <ProductItem
                key={item.id}
                item={item}
                setCarouselIndex={setCarouselIndex}
                addProductToCart={addProductToCart}
                formatPrice={formatPrice}
                setOpenCart={setOpenCart}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
