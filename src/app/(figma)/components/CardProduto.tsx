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
            <svg width="32" height="41" viewBox="0 0 32 41" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute">
              <path d="M32 41L16 33L0 41V0H32V41Z" fill="black" fillOpacity="0.75"/>
              <path d="M32 1V40L16 32L0 40V1H32Z" fill="#B3261E"/>
              <path d="M10.5938 22.7188C11.5625 22.7188 12.5573 23.2448 13.5781 24.2969C14.6094 25.3385 15.4583 25.8594 16.125 25.8594C17.2708 25.8594 18.0885 25.474 18.5781 24.7031C19.0781 23.9219 19.3281 23.0365 19.3281 22.0469C19.3281 20.224 18.5625 18.7344 17.0312 17.5781C16.1562 16.9323 14.7708 16.2708 12.875 15.5938V15.0781C14.1667 14.6302 15.0885 14.1979 15.6406 13.7812C16.5885 13.0625 17.0625 12.0885 17.0625 10.8594C17.0625 9.79688 16.7396 8.98958 16.0938 8.4375C15.4583 7.875 14.6458 7.59375 13.6562 7.59375C12.7396 7.59375 11.9115 7.92708 11.1719 8.59375C10.7552 8.96875 10.3125 9.52604 9.84375 10.2656L9.17188 9.89062C9.67188 8.82812 10.3854 7.88021 11.3125 7.04688C12.7917 5.71354 14.5208 5.04688 16.5 5.04688C17.8646 5.04688 19.0521 5.43229 20.0625 6.20312C21.0729 6.97396 21.6302 7.97917 21.7344 9.21875C21.7344 10.1042 21.5365 10.8958 21.1406 11.5938C20.7552 12.2812 20.125 12.849 19.25 13.2969V13.5312C20.5312 14.0417 21.4688 14.8125 22.0625 15.8438C22.6562 16.8646 22.9531 17.9427 22.9531 19.0781C22.9531 21.3698 22.0677 23.3229 20.2969 24.9375C18.4531 26.6354 16.1198 27.4844 13.2969 27.4844C11.9219 27.4844 10.776 27.224 9.85938 26.7031C8.94271 26.1823 8.48438 25.4948 8.48438 24.6406C8.48438 24.1823 8.64583 23.75 8.96875 23.3438C9.30208 22.9271 9.84375 22.7188 10.5938 22.7188Z" fill="white"/>
              <rect width="32" height="2" fill="#FF7B73"/>
            </svg>
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
