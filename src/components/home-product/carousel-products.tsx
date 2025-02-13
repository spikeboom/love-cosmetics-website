import Image from "next/image";
import IconSacola from "./icon-sacola";
import "./style.css";
import Link from "next/link";

export const Product = ({ data }: any) => (
  <Link href={`/pdp/[slug]`} as={`/pdp/${data.slug}`} className="w-full">
    <div className="w-full">
      <div className="relative aspect-[1/1] w-full">
        <Image
          src={data.image}
          alt="Product 1"
          fill
          style={{
            objectFit: "cover",
          }}
        />
      </div>
      <div className="w-full px-8">
        <div className="px-[12px] py-[8px] text-center">
          <p className="mb-[8px] text-[14px] leading-[1.3]">
            <span className="">{data.name}</span>
          </p>
          <span className="text-[16px] font-semibold leading-[1] text-[#333]">
            <span className="">R$ {data.price}</span>
          </span>
        </div>
        <div className="w-full">
          <button className="flex w-full items-center justify-center rounded-[100px] bg-[#FF69B4] px-[32px] py-[8px]">
            <span className="text-[16px] font-semibold leading-[130%] text-[#FFF]">
              comprar
            </span>
            <span className="ml-[4px]">
              <IconSacola />
            </span>
          </button>
        </div>
      </div>
    </div>
  </Link>
);
