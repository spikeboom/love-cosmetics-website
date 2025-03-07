import Image from "next/image";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";

export function ProductDescricao({
  descricao_resumida,
  titulo_lista,
  lista_descricao,
}: {
  descricao_resumida: string;
  titulo_lista: string;
  lista_descricao: { id: number; texto: string }[];
}) {
  const check_list = (
    <div className="relative flex h-[12px] w-[12px] items-center justify-center rounded-full bg-[#cabbff]">
      <div className="relative h-[8px] w-[8px]">
        <Image
          src={"/list/check.svg"}
          alt={`check icon`}
          fill
          style={{
            objectFit: "contain",
          }}
        />
      </div>
    </div>
  );

  return (
    <>
      <div className="my-[16px]">
        <p className="text-[14px] lowercase leading-[150%]">
          {descricao_resumida}
        </p>
      </div>

      <div className="my-[16px] list-none">
        <summary>
          <h2 className="mb-[12px] font-poppins text-[16px] leading-[130%]">
            {/* {titulo_lista} */}
            quais são os seus benefícios?
          </h2>
        </summary>
        <div className="text-[14px] lowercase leading-[150%]">
          {lista_descricao?.map((item) => (
            <li key={item?.id} className="flex items-center gap-1">
              <FiberManualRecordIcon fontSize={"small"} /> {item?.texto}
            </li>
          ))}
        </div>
      </div>
    </>
  );
}
