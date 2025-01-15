"use client";

import { ReactNode, useState } from "react";
import { IoChevronDown, IoChevronUp } from "react-icons/io5";

export default function DoubtsItem({
  title,
  text,
}: {
  title: ReactNode;
  text: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="cursor-pointer" onClick={() => setOpen(!open)}>
      <div className="mb-[10px] flex justify-between gap-2 pt-[20px]">
        <h4 className="text-[16px] leading-[1]">{title}</h4>
        <span className="">
          {open ? <IoChevronUp size={14} /> : <IoChevronDown size={14} />}
        </span>
      </div>
      <div className={`${open ? "block" : "hidden"}`}>
        <p className="text-[14px] leading-[1.5]">{text}</p>
      </div>
    </div>
  );
}
