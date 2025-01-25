import IconFragance from "../badges/icon-fragance";
import IconRabbit from "../badges/icon-rabbit";
import IconRecicle from "../badges/icon-recicle";
import IconVegan from "../badges/icon-vegan";

export function Adesivos() {
  return (
    <div className="my-[16px] flex justify-around py-[20px]">
      <figure className="flex flex-col items-center">
        <IconVegan />
        <figcaption className="text-[12px]">vegano</figcaption>
      </figure>
      <figure className="flex flex-col items-center">
        <IconRabbit />
        <figcaption className="text-[12px]">sem crueldade</figcaption>
      </figure>
      <figure className="flex flex-col items-center">
        <IconFragance />
        <figcaption className="text-[12px]">sem fragância</figcaption>
      </figure>
      <figure className="flex flex-col items-center">
        <IconRecicle />
        <figcaption className="text-[12px]">reciclável</figcaption>
      </figure>
    </div>
  );
}
