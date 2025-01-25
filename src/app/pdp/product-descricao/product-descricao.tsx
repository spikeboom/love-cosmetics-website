import Image from "next/image";

export function ProductDescricao() {
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
          O hidratante facial possui ação antioxidante, hidratante e
          regeneradora. Ajuda na cicatrização de feridas, redução de manchas,
          tratamento de inflamações e fortalecimento da barreira natural da
          pele. Nutre, revitaliza e previne o envelhecimento precoce​.
        </p>
      </div>

      <div className="my-[16px] list-none">
        <summary>
          <h2 className="mb-[12px] font-poppins text-[16px] leading-[130%]">
            o que só ele faz?
          </h2>
        </summary>
        <div className="text-[14px] lowercase leading-[150%]">
          <li className="flex items-center gap-1">
            {check_list} Hidrata profundamente e revitaliza a pele
          </li>
          <li className="flex items-center gap-1">
            {check_list} Ajuda na cicatrização de feridas e redução de manchas
          </li>
          <li className="flex items-center gap-1">
            {check_list} Fortalece a barreira natural da pele
          </li>
          <li className="flex items-center gap-1">
            {check_list} Previne o envelhecimento precoce
          </li>
          <li className="flex items-center gap-1">
            {check_list} Nutre e aumenta a elasticidade
          </li>
          <li className="flex items-center gap-1">
            {check_list} Estimula a renovação celular
          </li>
          <li className="flex items-center gap-1">
            {check_list} Repara danos causados por agentes externos
          </li>
          <li className="flex items-center gap-1">
            {check_list} Proporciona maciez e toque sedoso​
          </li>
        </div>
      </div>
    </>
  );
}
