"use client";

import DoubtsItem from "./item";

export default function Doubts() {
  return (
    <div className="mb-[30px] pt-[20px] font-poppins lowercase">
      <div className="">
        <div className="mb-[30px] p-[10px]">
          <div className="">
            <h3 className="mb-[10px] text-[18px] font-semibold text-[#333]">
              dúvidas
            </h3>
            <DoubtsItem
              title={
                <>
                  Já utilizo outro hidratante facial, preciso substituir por
                  este?
                </>
              }
              text={
                <>
                  Não é necessário! Este hidratante pode complementar sua rotina
                  de cuidados com a pele, oferecendo benefícios adicionais como
                  maior hidratação, reparação e prevenção de sinais de
                  envelhecimento.
                </>
              }
            />
            <DoubtsItem
              title={<>Ele vai deixar minha pele oleosa?</>}
              text={
                <>
                  Não, sua fórmula leve é de rápida absorção, deixando a pele
                  hidratada e macia sem sensação oleosa ou pegajosa.
                </>
              }
            />
            <DoubtsItem
              title={<>Ele é resistente à água?</>}
              text={
                <>
                  Embora tenha ótima fixação e absorção, recomendamos reaplicar
                  o hidratante após atividades como natação ou banho para
                  garantir todos os seus benefícios.
                </>
              }
            />
            <DoubtsItem
              title={<>Qual o rendimento do produto?</>}
              text={
                <>
                  O rendimento pode variar conforme a quantidade e frequência de
                  uso. Por isso, não é possível fornecer uma estimativa exata.
                </>
              }
            />
            <DoubtsItem
              title={<>Ele demora para ser absorvido pela pele?</>}
              text={
                <>
                  Não, o hidratante facial é rapidamente absorvido,
                  proporcionando uma sensação confortável para o uso diário, sem
                  deixar resíduos visíveis na pele​.
                </>
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}
