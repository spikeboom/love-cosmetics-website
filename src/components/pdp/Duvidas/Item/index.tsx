"use client";

import { ReactNode, useState } from "react";
import { Accordion, AccordionDetails, AccordionSummary } from "../../Tabs";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Typography } from "@mui/material";

export default function DoubtsItem({
  title,
  text,
}: {
  title: ReactNode;
  text: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    // <div className="cursor-pointer" onClick={() => setOpen(!open)}>
    //   <div className="mb-[10px] flex justify-between gap-2 pt-[20px]">
    //     <h4 className="text-[16px] leading-[1]">{title}</h4>
    //     <span className="">
    //       {open ? <IoChevronUp size={14} /> : <IoChevronDown size={14} />}
    //     </span>
    //   </div>
    //   <div className={`${open ? "block" : "hidden"}`}>
    //     <p className="text-[14px] leading-[1.5]">{text}</p>
    //   </div>
    // </div>
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography component="span">
          <span className="font-poppins text-[14px]">{title}</span>
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <span className="text-[14px]">{text}</span>
      </AccordionDetails>
    </Accordion>
  );
}
