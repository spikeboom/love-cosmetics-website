"use client";

import { useState } from "react";
import { IoChevronDown, IoChevronUp } from "react-icons/io5";

export function Tabs() {
  const [activeTab, setActiveTab] = useState(0);

  const [openDetailsTab1, setOpenDetailsTab1] = useState(false);

  const tabTitles = [
    <button className={`px-[8px] py-[16px] font-poppins text-[14px]`}>
      o que ele tem
    </button>,
    <button className={`px-[8px] py-[16px] font-poppins text-[14px]`}>
      o que ele é
    </button>,
    <button className={`px-[8px] py-[16px] font-poppins text-[14px]`}>
      resultados
    </button>,
  ];

  const tabContent = [
    <div className="pt-[12px] lowercase">
      <div className="flex flex-wrap">
        <div className="my-[8px] flex w-full justify-center">
          <button
            className="flex items-center gap-1 font-poppins text-[10px] leading-[150%] text-[#FF69B4] underline"
            onClick={() => setOpenDetailsTab1(!openDetailsTab1)}
            style={!openDetailsTab1 ? { display: "none" } : {}}
          >
            fechar detalhes
            <IoChevronUp color="#FF69B4" size={10} />
          </button>
        </div>
        <h2 className="m-[1%] px-[14px] py-[6px] font-poppins text-[14px]">
          Niacinamida (Vitamina B3)
        </h2>
        <p
          className="mb-[16px] font-poppins text-[14px] leading-[150%]"
          style={!openDetailsTab1 ? { display: "none" } : {}}
        >
          Hidrata profundamente, controla a oleosidade, uniformiza o tom, reduz
          manchas e melhora a textura da pele. Auxilia na reestruturação da
          barreira cutânea e na prevenção do envelhecimento precoce.
        </p>
        <h2 className="m-[1%] px-[14px] py-[6px] font-poppins text-[14px]">
          Ácido Hialurônico
        </h2>
        <p
          className="mb-[16px] font-poppins text-[14px] leading-[150%]"
          style={!openDetailsTab1 ? { display: "none" } : {}}
        >
          Atrai e retém água, reduz rugas e linhas de expressão, suaviza
          olheiras e aumenta a flexibilidade e firmeza da pele. Estimula a
          produção de colágeno e ajuda na cicatrização.
        </p>
        <h2 className="m-[1%] px-[14px] py-[6px] font-poppins text-[14px]">
          Manteiga de Tucumã
        </h2>
        <p
          className="mb-[16px] font-poppins text-[14px] leading-[150%]"
          style={!openDetailsTab1 ? { display: "none" } : {}}
        >
          Rica em vitaminas, promove nutrição intensa, hidratação, elasticidade
          e regeneração da pele. Reduz ressecamentos e rachaduras, deixando a
          pele macia e sedosa.
        </p>
        <h2 className="m-[1%] px-[14px] py-[6px] font-poppins text-[14px]">
          Ação antioxidante
        </h2>
        <p
          className="mb-[16px] font-poppins text-[14px] leading-[150%]"
          style={!openDetailsTab1 ? { display: "none" } : {}}
        >
          Protege contra radicais livres, combate o envelhecimento precoce e
          fortalece a barreira natural da pele.
        </p>
        <h2 className="m-[1%] px-[14px] py-[6px] font-poppins text-[14px]">
          Reparação intensiva
        </h2>
        <p
          className="mb-[16px] font-poppins text-[14px] leading-[150%]"
          style={!openDetailsTab1 ? { display: "none" } : {}}
        >
          Estimula a renovação celular e repara danos causados por exposição ao
          sol, poluição e outros agentes externos.
        </p>
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
            className="flex items-center gap-1 font-poppins text-[10px] leading-[150%] text-[#FF69B4] underline"
            onClick={() => setOpenDetailsTab1(!openDetailsTab1)}
            style={openDetailsTab1 ? { display: "none" } : {}}
          >
            ver detalhes dos ingredientes
            <IoChevronDown color="#FF69B4" size={10} />
          </button>
          <button
            className="flex items-center gap-1 font-poppins text-[10px] leading-[150%] text-[#FF69B4] underline"
            onClick={() => setOpenDetailsTab1(!openDetailsTab1)}
            style={!openDetailsTab1 ? { display: "none" } : {}}
          >
            fechar detalhes
            <IoChevronUp color="#FF69B4" size={10} />
          </button>
        </div>
      </div>
    </div>,
    <div className="pt-[12px] lowercase">
      <h2 className="leadin-[150%] my-[16px] font-poppins text-[20px] font-semibold text-[#FF69B4]">
        ele é
      </h2>
      <p className="mb-[16px] font-poppins text-[14px] leading-[150%]">
        um hidratante facial prático e ideal para uso diário, com poderosa ação
        hidratante que fortalece a barreira natural da pele. Sua fórmula leve e
        nutritiva auxilia na prevenção e no tratamento de ressecamentos, manchas
        e inflamações, promovendo conforto e revitalização para a pele do rosto.
        Seus ativos antioxidantes, calmantes e reparadores ajudam a regenerar
        áreas sensibilizadas, acalmando a pele imediatamente e deixando-a mais
        uniforme e macia. Além disso, oferece rápida absorção e não deixa a pele
        oleosa ou pegajosa​.
      </p>
    </div>,
    <div className="pt-[12px] font-poppins lowercase">
      <p className="mb-[16px] font-poppins text-[14px] leading-[150%]">
        Antes de chegar até você, o nosso Hidratante Facial passou por uma série
        de avaliações de segurança e eficácia em um Instituto de Pesquisa
        Clínica independente, com participantes que fizeram uso do produto
        diariamente. Estes são os resultados de algumas avaliações:
      </p>
      <h2 className="my-[16px] font-poppins text-[20px] font-semibold text-[#FF69B4]">
        após 28 dias de uso:
      </h2>
      <table className="mb-[16px]">
        <tbody>
          <tr>
            <td className="px-[8px]">
              <h2 className="my-[32px] text-center font-poppins text-[40px] font-semibold leading-[130%] text-[#FF69B4]">
                100%
              </h2>
              <p className="mb-[16px] text-center text-[12px] leading-[130%]">
                sentiram a pele profundamente hidratada e revitalizada*
              </p>
            </td>
            <td className="px-[8px]">
              <h2 className="my-[32px] text-center font-poppins text-[40px] font-semibold leading-[130%] text-[#FF69B4]">
                98%
              </h2>
              <p className="mb-[16px] text-center text-[12px] leading-[130%]">
                notaram melhora na uniformidade e textura da pele**
              </p>
            </td>
          </tr>
          <tr>
            <td className="px-[8px]">
              <h2 className="my-[32px] text-center font-poppins text-[40px] font-semibold leading-[130%] text-[#FF69B4]">
                95%
              </h2>
              <p className="mb-[16px] text-center text-[12px] leading-[130%]">
                perceberam redução de áreas ressecadas e sinais de inflamação**
              </p>
            </td>
          </tr>
        </tbody>
      </table>

      <h2 className="my-[16px] font-poppins text-[20px] font-semibold text-[#FF69B4]">
        avaliações de segurança
      </h2>
      <p className="mb-[16px] text-[14px] leading-[150%]">
        <strong>Dermatologicamente e Clinicamente testado</strong> - produto
        seguro para uso em todos os tipos de pele, incluindo as mais sensíveis.
      </p>

      <p className="mb-[16px] text-[14px] leading-[150%]">
        <i>
          * Eficácia instrumental da hidratação e renovação celular realizada em
          Instituto de Pesquisa Clínica independente. ** Eficácia comprovada em
          pesquisa realizada por Instituto de Pesquisa Clínica independente, com
          participantes que usaram o produto diariamente​ .
        </i>
      </p>
    </div>,
  ];

  return (
    <>
      <div className="flex w-full justify-between border-b-[1px] border-b-[silver]">
        {tabTitles.map((tab, index) => (
          <div
            key={index}
            onClick={() => setActiveTab(index)}
            className={`cursor-pointer ${
              activeTab === index
                ? "border-b-[3px] border-b-[#FF69B4] font-semibold text-[#FF69B4]"
                : "text-[#999]"
            }`}
          >
            {tab}
          </div>
        ))}
      </div>

      {tabContent[activeTab]}
    </>
  );
}
