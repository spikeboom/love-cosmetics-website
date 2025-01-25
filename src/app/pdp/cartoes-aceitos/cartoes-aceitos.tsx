import Image from "next/image";

export function CartoesAceitos() {
  return (
    <div className="mb-[24px] mt-[40px]">
      <div className="relative h-[29px] w-[220px]">
        <Image
          src={"/footer/cards.avif"}
          alt={`cred cards`}
          fill
          style={{
            objectFit: "contain",
          }}
        />
      </div>
    </div>
  );
}
