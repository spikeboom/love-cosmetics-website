import IconCredCard from "../payments/icon-credcard";
import IconPix from "../payments/icon-pix";
import IconReembolso from "../payments/icon-reembolso";

export function PagueCom() {
  return (
    <div className="my-[16px] flex flex-col rounded-[8px] border-[1px] border-[#ddd]">
      <h2 className="mt-[10px] self-center font-poppins text-[14px] text-[#dcafad]">
        Pague com
      </h2>
      <div className="flex justify-center gap-[8px]">
        <span className="flex items-center gap-1 p-[8px] text-[12px] text-[#666]">
          <IconPix /> <span>pix</span>
        </span>
        <span className="flex items-center gap-1 p-[8px] text-[12px] text-[#666]">
          <IconCredCard /> <span>cartão de crédito em 3x</span>
        </span>
      </div>
      <div className="flex justify-center gap-[8px] border-t-[1px] border-[#ddd]">
        <span className="flex items-center gap-1 p-[8px] text-[12px] text-[#666]">
          <IconReembolso />
          <span>reembolso garantido em 30 dias em compras no site</span>
        </span>
      </div>
    </div>
  );
}
