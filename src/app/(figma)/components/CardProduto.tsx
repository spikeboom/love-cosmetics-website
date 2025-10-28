import Image from "next/image";

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
}: CardProdutoProps) {
  if (tipo === "mini-banner") {
    return (
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
    );
  }

  // Card de produto completo (para vitrines e mais vendidos)
  return (
    <div className="bg-white flex flex-col gap-4 items-start pb-4 pt-0 px-0 rounded-2xl shadow-[0px_1px_2px_0px_rgba(0,0,0,0.3),0px_1px_3px_1px_rgba(0,0,0,0.15)] w-[230px]">
      {/* Imagem e Tag */}
      <div className="relative w-full h-[196px] max-h-[312px]">
        <div className="relative w-full h-full rounded-t-2xl overflow-hidden">
          <Image
            src={imagem}
            alt={nome}
            fill
            className="object-cover rounded-t-2xl"
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
          <div className="absolute left-2 top-[163px] w-[214px]">
            <div className="bg-[#f8f3ed] flex gap-1 items-center justify-center px-4 py-1 rounded">
              <div className="w-4 h-4 relative">
                <Image
                  src="/new-home/icons/alert.svg"
                  alt=""
                  width={16}
                  height={16}
                  className="w-full h-full"
                />
              </div>
              <p className="font-cera-pro font-light text-[14px] text-[#b3261e] leading-normal whitespace-pre">
                Últimas unidades
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Conteúdo */}
      <div className="flex flex-col gap-4 items-start px-4 w-full">
        <p className="font-cera-pro font-medium text-[16px] text-black leading-normal min-w-full w-min">
          {nome}
        </p>

        <div className="flex flex-col gap-2 items-start leading-normal whitespace-pre">
          {precoOriginal && (
            <p className="font-cera-pro font-light text-[12px] text-[#333333] line-through decoration-solid leading-normal">
              R$ {precoOriginal.toFixed(2)}
            </p>
          )}
          <div className="flex gap-2 items-center w-full">
            <p className="font-cera-pro font-bold text-[20px] text-black leading-normal">
              R$ {preco.toFixed(2)}
            </p>
            {desconto && (
              <p className="font-cera-pro font-light text-[14px] text-[#009142] leading-normal">
                {desconto}
              </p>
            )}
          </div>
          {parcelas && (
            <p className="font-cera-pro font-light text-[12px] text-[#333333] leading-normal">
              {parcelas}
            </p>
          )}
        </div>

        {/* Star Rating */}
        <div className="flex gap-1 items-center">
          <div className="flex gap-0.5 items-start">
            <div className="flex gap-1 h-3 items-center">
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
}
