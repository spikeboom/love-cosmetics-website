import { LuShoppingCart } from "react-icons/lu";
import { IoClose } from "react-icons/io5";

export function CartHeader({ onClose }: { onClose: () => void }) {
  return (
    <div className="mt-[4px] flex items-center justify-between px-[16px] pb-[8px] pt-[8px]">
      <div className="flex items-center gap-3">
        <LuShoppingCart size={16} />
        <h2 className="font-poppins text-[14px]">seu carrinho</h2>
      </div>
      <IoClose size={16} className="cursor-pointer" onClick={onClose} />
    </div>
  );
}
