import { FaChevronDown } from "react-icons/fa6";

export function MaisLinks() {
  return (
    <div className="mt-[40px] flex w-full flex-col gap-[56px] px-[32px] pb-[42px]">
      <div className="">
        <ul className="flex flex-wrap justify-center gap-x-[38px] gap-y-[22px] underline">
          <li>
            <a href="" className="">
              oi@sallve.com.br
            </a>
          </li>
          <li>
            <a href="" className="">
              whatsapp
            </a>
          </li>
          <li>
            <a href="" className="">
              blog da sallve
            </a>
          </li>
          <li>
            <a href="" className="">
              quiz da pele
            </a>
          </li>
          <li>
            <a href="" className="">
              vem ser um afiliado sallve
            </a>
          </li>
          <li>
            <a href="" className="">
              encontre nas farmácias
            </a>
          </li>
          <li>
            <a href="" className="">
              avaliações
            </a>
          </li>
        </ul>
      </div>

      <div className="flex items-center justify-between rounded-[200px] bg-[#efefef] px-[24px] py-[12px] font-poppins text-[14px]">
        <span>mais sobre a sallve</span>
        <FaChevronDown />
      </div>
    </div>
  );
}
