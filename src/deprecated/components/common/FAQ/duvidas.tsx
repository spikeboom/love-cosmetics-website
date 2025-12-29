"use client";

import DoubtsItem from "@/deprecated/components/common/FAQ/Item";

interface Duvida {
  id: number;
  pergunta: string;
  texto: string;
}

interface DuvidasProps {
  duvidas: Duvida[];
}

export function Duvidas({ duvidas }: DuvidasProps) {
  return (
    <div className="mb-[30px] pt-[20px] font-poppins">
      <div className="">
        <div className="mb-[30px] p-[10px]">
          <div className="">
            <h3 className="mb-[10px] text-[18px] font-semibold text-[#333]">
              Dúvidas
            </h3>
            {duvidas?.map((item) => (
              <DoubtsItem
                key={item?.id}
                title={<>{item?.pergunta}</>}
                text={<>{item?.texto}</>}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
