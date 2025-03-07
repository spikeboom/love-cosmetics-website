"use client";

import { styled, Typography } from "@mui/material";
import MuiAccordion, { AccordionProps } from "@mui/material/Accordion";
import MuiAccordionSummary, {
  AccordionSummaryProps,
  accordionSummaryClasses,
} from "@mui/material/AccordionSummary";
import MuiAccordionDetails from "@mui/material/AccordionDetails";
import { useState } from "react";
import { IoChevronDown, IoChevronUp } from "react-icons/io5";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ArrowForwardIosSharpIcon from "@mui/icons-material/ArrowForwardIosSharp";

export const Accordion = styled((props: AccordionProps) => (
  <MuiAccordion disableGutters elevation={0} square {...props} />
))(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  "&:not(:last-child)": {
    borderBottom: 0,
  },
  "&::before": {
    display: "none",
  },
}));

export const AccordionSummary = styled((props: AccordionSummaryProps) => (
  <MuiAccordionSummary
    expandIcon={<ArrowForwardIosSharpIcon sx={{ fontSize: "0.9rem" }} />}
    {...props}
  />
))(({ theme }) => ({
  backgroundColor: "rgba(0, 0, 0, .03)",
  flexDirection: "row-reverse",
  [`& .${accordionSummaryClasses.expandIconWrapper}.${accordionSummaryClasses.expanded}`]:
    {
      transform: "rotate(90deg)",
    },
  [`& .${accordionSummaryClasses.content}`]: {
    marginLeft: theme.spacing(1),
  },
  ...theme.applyStyles("dark", {
    backgroundColor: "rgba(255, 255, 255, .05)",
  }),
}));

export const AccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({
  padding: theme.spacing(2),
  borderTop: "1px solid rgba(0, 0, 0, .125)",
}));

export function Tabs({
  o_que_ele_tem,
  o_que_ele_e,
  resultados,
}: {
  o_que_ele_tem: { id: number; titulo: string; descricao: string }[];
  o_que_ele_e: string;
  resultados: {
    texto1: string;
    titulo1: string;
    itens_resultado: { id: number; numero: string; texto: string }[];
    titulo2: string;
    texto2: string;
  };
}) {
  const [activeTab, setActiveTab] = useState(0);

  const [openDetailsTab1, setOpenDetailsTab1] = useState(false);

  const tabTitles = [
    <button className={`px-[8px] font-poppins text-[14px]`}>
      Conheça os ativos presentes
    </button>,
    <button className={`px-[8px] font-poppins text-[14px]`}>
      Conheça mais sobre o produto
    </button>,
    // <button className={`px-[8px] font-poppins text-[14px]`}>resultados</button>,
  ];

  const tabContent = [
    <div className="">
      <div className="flex flex-wrap">
        <div className="my-[8px] flex w-full justify-center">
          <button
            className="flex items-center gap-1 font-poppins text-[10px] leading-[150%] text-[#333] underline"
            onClick={() => setOpenDetailsTab1(!openDetailsTab1)}
            style={!openDetailsTab1 ? { display: "none" } : {}}
          >
            Fechar detalhes
            <IoChevronUp color="#dcafad" size={10} />
          </button>
        </div>

        {o_que_ele_tem?.map((item) => (
          <div key={item.id} className="inline-block">
            <h2 className="m-[1%] whitespace-nowrap px-[14px] py-[6px] font-poppins text-[14px]">
              {item?.titulo}
            </h2>
            <p
              className="mb-[16px] font-poppins text-[14px] leading-[150%]"
              style={!openDetailsTab1 ? { display: "none" } : {}}
            >
              {item?.descricao}
            </p>
          </div>
        ))}

        {/* <div
          className="mt-[24px] text-[10px] leading-[150%]"
          style={!openDetailsTab1 ? { display: "none" } : {}}
        >
          PT BR: Óleo de Semente de Algodão, Triglicerídeo Carpílico/Cáprico,
          Cera de Abelha Sintética, Triglicerídeos C10-18, Cera de Farelo de
          Arroz, Mantiega de Karité, Carbonato de Dicaprilila, Cera Sintética,
          Crospolímero de Metacrilato de Metila, Insaponificáveis do Óleo de
          Abacate, Óleo de Abacate, Palmitato de Ascorbila, Tocoferol, Álcool
          Cetearílico, Ceramida NP, Nicotinamida, Pentaertritil Tetra-Di-T-Butil
          Hidroxi-Hidrocinamato, Óleo de Rícino Hidrogenado PEG-40, Tridecete-9,
          Água, Fenoxietanol, 2-Metil 5-Cicloexilpentano EN: Gossypium Herbaceum
          Seed Oil, Caprylic/Capric Triglyceride, Synthetic Beeswax, C10-18
          Triglycerides, Oryza Sativa Bran Wax, Butyrospermum Parkii Butter,
          Dicaprylyl Carbonate, Synthetic Wax, Methyl Methacrylate Crosspolymer,
          Persea Gratissima Oil Unsaponifiables, Persea Gratissima Oil, Ascorbyl
          Palmitate, Tocopherol, Cetearyl Alcohol, Ceramide NP, Niacinamide,
          Pentaerythrityl Tetra-Di-t-Butyl Hydroxyhydrocinnamate, PEG-40
          Hydrogenated Castor Oil, Trideceth-9, Aqua, Phenoxyethanol, 2-Methyl
          5-Cyclohexylpentanol
        </div> */}
        <div className="mt-[8px] flex w-full justify-center">
          <button
            className="flex items-center gap-1 font-poppins text-[10px] leading-[150%] text-[#333] underline"
            onClick={() => setOpenDetailsTab1(!openDetailsTab1)}
            style={openDetailsTab1 ? { display: "none" } : {}}
          >
            Ver detalhes dos ingredientes
            <IoChevronDown color="#dcafad" size={10} />
          </button>
          <button
            className="flex items-center gap-1 font-poppins text-[10px] leading-[150%] text-[#333] underline"
            onClick={() => setOpenDetailsTab1(!openDetailsTab1)}
            style={!openDetailsTab1 ? { display: "none" } : {}}
          >
            Fechar detalhes
            <IoChevronUp color="#dcafad" size={10} />
          </button>
        </div>
      </div>
    </div>,
    <div className="">
      {/* <h2 className="leadin-[150%] my-[16px] font-poppins text-[20px] font-semibold text-[#dcafad]">
        ele é
      </h2> */}
      <p className="mb-[16px] font-poppins text-[14px] leading-[150%]">
        {o_que_ele_e}
      </p>
    </div>,
    // <div className="font-poppins ">
    //   <p className="mb-[16px] font-poppins text-[14px] leading-[150%]">
    //     {resultados?.texto1}
    //   </p>
    //   <h2 className="my-[16px] font-poppins text-[20px] font-semibold text-[#dcafad]">
    //     {resultados?.titulo1}
    //   </h2>
    //   <div className="mb-[16px] flex flex-wrap">
    //     {resultados?.itens_resultado?.map((item) => (
    //       <div className="w-1/2 px-[8px]" key={item.id}>
    //         <h2 className="my-[32px] text-center font-poppins text-[40px] font-semibold leading-[130%] text-[#dcafad]">
    //           {item?.numero}
    //         </h2>
    //         <p className="mb-[16px] text-center text-[12px] leading-[130%]">
    //           {item?.texto}
    //         </p>
    //       </div>
    //     ))}
    //   </div>

    //   <h2 className="my-[16px] font-poppins text-[20px] font-semibold text-[#dcafad]">
    //     {resultados?.titulo2}
    //   </h2>
    //   <p className="prose mb-[16px] text-[14px] leading-[150%]">
    //     <ReactMarkdown remarkPlugins={[remarkGfm]}>
    //       {resultados?.texto2}
    //     </ReactMarkdown>
    //   </p>
    // </div>,
  ];

  return (
    <>
      <div className="flex w-full flex-col">
        {tabTitles.map((tab, index) => (
          // <div
          //   key={index}
          //   onClick={() => setActiveTab(index)}
          //   className={`cursor-pointer ${
          //     activeTab === index
          //       ? "border-b-[3px] border-b-[#dcafad] font-semibold text-[#dcafad]"
          //       : "text-[#999]"
          //   }`}
          // >
          //   {tab}
          // </div>
          <Accordion>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1-content"
              id="panel1-header"
            >
              <Typography component="span">{tab}</Typography>
            </AccordionSummary>
            <AccordionDetails>{tabContent[index]}</AccordionDetails>
          </Accordion>
        ))}
      </div>
    </>
  );
}
