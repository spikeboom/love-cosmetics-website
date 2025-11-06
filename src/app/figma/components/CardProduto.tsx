import Image from "next/image";
import Link from "next/link";

interface CardProdutoProps {
  imagem: string;
  nome: string;
  descricao?: string;
  precoOriginal?: number;
  preco: number;
  desconto?: string;
  parcelas?: string;
  rating?: number;
  ultimasUnidades?: boolean;
  tipo?: "mini-banner" | "produto-completo";
  ranking?: number;
  fullWidth?: boolean;
  slug?: string;
}

export function CardProduto({
  imagem,
  nome,
  descricao,
  precoOriginal,
  preco,
  desconto,
  parcelas,
  rating = 3.5,
  ultimasUnidades = false,
  tipo = "produto-completo",
  ranking,
  fullWidth = false,
  slug,
}: CardProdutoProps) {
  const cardContent = tipo === "mini-banner" ? (
    <div className="bg-white flex flex-col gap-4 items-start pb-4 pt-0 px-0 rounded-2xl shadow-[0px_1px_2px_0px_rgba(0,0,0,0.3),0px_1px_3px_1px_rgba(0,0,0,0.15)] w-[230px]">
      {/* Imagem */}
      <div className="relative w-full h-[230px] max-h-[312px] rounded-t-2xl overflow-hidden">
        <Image
          src={imagem}
          alt={nome}
          fill
          className="object-cover rounded-t-2xl"
        />
      </div>

      {/* Conteúdo */}
      <div className="flex flex-col gap-4 items-start px-4 w-[230px]">
        {desconto && (
          <p className="font-cera-pro font-bold text-[20px] text-[#254333] leading-none">
            {desconto}
          </p>
        )}
        <div className="flex gap-2.5 items-center w-full">
          <p className="flex-1 font-cera-pro font-bold text-[20px] text-black leading-none min-h-0 min-w-0">
            {nome}
          </p>
        </div>
        {descricao && (
          <p className="font-cera-pro font-light text-[14px] text-black leading-none w-full">
            {descricao}
          </p>
        )}
      </div>
    </div>
  ) : (
    // Card de produto completo (para vitrines e mais vendidos)
    <div className={`bg-white box-border content-stretch flex flex-col gap-[16px] items-start pb-[16px] pt-0 px-0 relative rounded-[16px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.3),0px_1px_3px_1px_rgba(0,0,0,0.15)] ${fullWidth ? "w-full" : "w-[230px]"}`}>
      {/* Imagem e Tag */}
      <div className="content-stretch flex gap-[10px] items-start justify-center max-h-[312px] relative shrink-0 w-full">
        <div className="basis-0 grow h-[196px] min-h-px min-w-px relative rounded-tl-[16px] rounded-tr-[16px] shrink-0 overflow-hidden">
          <Image
            src={imagem}
            alt={nome}
            fill
            className="object-cover pointer-events-none"
          />
        </div>

        {/* Badge de ranking para mais vendidos */}
        {ranking && (
          <div className="absolute left-[calc(50%-66px)] top-[-2px] w-[32px] h-[41px] flex items-center justify-center translate-x-[-50%]">
            <Image
              src={`/new-home/icons/badge-ranking-${ranking}.svg`}
              alt={`Posição ${ranking}`}
              width={32}
              height={41}
              className="absolute"
            />
          </div>
        )}

        {/* Tag de últimas unidades */}
        {ultimasUnidades && (
          <div className="absolute content-stretch flex flex-col gap-[10px] items-center left-1/2 top-[163px] w-[214px] translate-x-[-50%]">
            <div className="bg-[#f8f3ed] box-border content-stretch flex gap-[4px] items-center justify-center px-[16px] py-[4px] relative rounded-[4px] shrink-0 w-full">
              <div className="relative shrink-0 size-[16px]">
                <Image
                  src="/new-home/icons/alert.svg"
                  alt=""
                  width={16}
                  height={16}
                  className="w-full h-full"
                />
              </div>
              <p className="font-cera-pro font-light text-[14px] text-[#b3261e] leading-normal whitespace-nowrap">
                Últimas unidades
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Conteúdo */}
      <div className="box-border content-stretch flex flex-col gap-[12px] items-start px-[16px] py-0 relative shrink-0 w-full">
        <p className="font-cera-pro font-medium text-[16px] text-black leading-normal min-w-full w-min">
          {nome}
        </p>

        {descricao && (
          <p className="font-cera-pro font-light text-[14px] text-black leading-normal w-full line-clamp-3">
            {descricao}
          </p>
        )}

        <div className="content-stretch flex flex-col gap-[2px] items-start leading-none text-nowrap whitespace-pre relative shrink-0">
          {precoOriginal && (
            <p className="font-cera-pro font-light text-[12px] text-[#333333] line-through decoration-solid leading-none">
              R$ {precoOriginal.toFixed(2)}
            </p>
          )}
          <div className="content-stretch flex gap-[8px] items-center relative shrink-0 w-full">
            <p className="font-cera-pro font-bold text-[20px] text-black leading-none">
              R$ {preco.toFixed(2)}
            </p>
            {desconto && (
              <p className="font-cera-pro font-light text-[14px] text-[#009142] leading-none">
                {desconto}
              </p>
            )}
          </div>
          {parcelas && (
            <p className="font-cera-pro font-light text-[12px] text-[#333333] leading-none">
              {parcelas}
            </p>
          )}
        </div>

        {/* Star Rating */}
        <div className="content-stretch flex gap-[4px] items-center relative shrink-0">
          <div className="content-stretch flex gap-[2px] items-start relative shrink-0">
            <div className="content-stretch flex gap-[4px] h-[12px] items-center relative shrink-0">
              {[...Array(5)].map((_, i) => {
                const filled = i < Math.floor(rating);
                const half = i < rating && i >= Math.floor(rating);

                return (
                  <div key={i} className="w-4 h-4">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path
                        d="M8 2L9.5 6.5L14 7L10.5 10L11.5 14.5L8 12L4.5 14.5L5.5 10L2 7L6.5 6.5L8 2Z"
                        fill={filled ? "#FFB800" : half ? "url(#half)" : "#E0E0E0"}
                      />
                      {half && (
                        <defs>
                          <linearGradient id="half">
                            <stop offset="50%" stopColor="#FFB800" />
                            <stop offset="50%" stopColor="#E0E0E0" />
                          </linearGradient>
                        </defs>
                      )}
                    </svg>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Se tiver slug, envolve com Link
  if (slug) {
    return (
      <Link href={`/figma/product/${slug}`} className="cursor-pointer hover:opacity-90 transition-opacity">
        {cardContent}
      </Link>
    );
  }

  return cardContent;
}
