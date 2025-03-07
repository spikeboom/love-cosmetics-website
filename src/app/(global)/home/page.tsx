import { fetchProdutosForHome } from "@/modules/produto/domain";
import { Product } from "@/components/home-product/carousel-products";
import { ModalCart } from "../pdp/[slug]/modal-cart/modal-cart";

export default async function HomeComponent() {
  const { data } = await fetchProdutosForHome();

  return (
    <>
      <div className="flex flex-col md:flex-row md:justify-center md:px-[18px]">
        <div className="relative aspect-[378/678] w-full md:sticky md:top-[90px] md:mb-[100px] md:h-fit md:w-[30%]">
          <video
            className="w-full object-cover brightness-[.9]"
            controls={false}
            autoPlay
            loop
            muted
            playsInline
          >
            {/* <source src="/home/top-video.webm" type="video/webm" /> */}
            <source src="/home/top-video.mp4" type="video/mp4" />
            Seu navegador não suporta vídeos HTML5.
          </video>

          {/* Div de overlay com gradiente */}
          <div className="absolute bottom-0 h-[200px] w-full bg-gradient-to-t from-[#000000CC] to-[#00000000]"></div>

          {/* Conteúdo posicionado sobre o gradiente */}
          <div className="absolute bottom-[50px] w-full px-6">
            <h1 className="font-poppins text-3xl font-semibold text-white">
              Lové Cosméticos
            </h1>
            <p className="mt-2 font-poppins text-[20px] text-white">
              Ativos amazônicos que realçam sua beleza
            </p>
          </div>
        </div>

        <div className="flex w-full flex-col items-center justify-center gap-[60px] px-[80px] py-10 md:w-[20%] md:pl-[24px] md:pr-0 md:pt-0">
          {/* @ts-ignore */}
          {data?.map((product) => (
            <Product
              key={product.id}
              data={{
                image:
                  process.env.NEXT_PUBLIC_STRAPI_URL +
                  product.carouselImagensPrincipal?.[0]?.imagem?.formats?.medium
                    ?.url,
                name: product.nome,
                price: product.preco,
                slug: product.slug,
              }}
            />
          ))}
        </div>
      </div>

      <ModalCart />
    </>
  );
}
