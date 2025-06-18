import Image from "next/image";

export function SuggestedProductsCarousel({
  suggestedProducts,
  carouselIndex,
  setCarouselIndex,
  addProductToCart,
  formatPrice,
}: {
  suggestedProducts: any[];
  carouselIndex: number;
  setCarouselIndex: (fn: (i: number) => number) => void;
  addProductToCart: (item: any) => void;
  formatPrice: (n: number) => string;
}) {
  return (
    <div className="border-b border-t">
      <h3 className="text-md p-4 pb-0 font-medium">Você também pode gostar:</h3>
      <div className="relative my-2 mb-3">
        <button
          className="absolute left-0 top-1/2 z-10 h-[35px] w-[35px] -translate-y-1/2 rounded-full bg-[#EFAE75] p-2 text-[#5A3E2B] hover:text-black disabled:bg-[#F5D1B1] disabled:text-[#A86E45]"
          onClick={() => setCarouselIndex((i) => Math.max(i - 1, 0))}
          disabled={carouselIndex === 0}
        >
          &lt;
        </button>
        <div className="mx-5 overflow-hidden">
          <div
            className="flex transition-transform duration-300"
            style={{ transform: `translateX(-${carouselIndex * 100}%)` }}
          >
            {suggestedProducts.map((item) => (
              <div key={item.id} className="w-full flex-shrink-0 px-2">
                <div className="flex items-center justify-between rounded border p-2">
                  <div className="relative h-[60px] w-[60px]">
                    <Image
                      src={item.imageUrl}
                      loader={({ src }) => src}
                      alt={item.nome}
                      fill
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                  <p className="flex-1 pl-4 pr-2 text-sm">{item.nome}</p>
                  <div className="flex flex-col gap-1">
                    <span className="px-4 text-sm font-semibold">
                      R$ {formatPrice(item.preco)}
                    </span>
                    <button
                      className="rounded bg-red-500 px-3 py-1 text-xs text-white hover:bg-red-600"
                      onClick={() => {
                        setCarouselIndex((prev) =>
                          prev === 0 ? prev : prev - 1,
                        );
                        addProductToCart({
                          ...item,
                          id: item.id,
                          nome: item.nome,
                          preco: item.preco,
                          preco_de: null,
                          slug: null,
                        });
                      }}
                    >
                      Adicionar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <button
          className="absolute right-0 top-1/2 z-10 h-[35px] w-[35px] -translate-y-1/2 rounded-full bg-[#EFAE75] p-2 text-[#5A3E2B] hover:text-black disabled:bg-[#F5D1B1] disabled:text-[#A86E45]"
          onClick={() =>
            setCarouselIndex((i) =>
              Math.min(i + 1, suggestedProducts.length - 1),
            )
          }
          disabled={carouselIndex >= suggestedProducts.length - 1}
        >
          &gt;
        </button>
      </div>
    </div>
  );
}
