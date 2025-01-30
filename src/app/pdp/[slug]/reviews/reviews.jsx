"use client";

import Review from "./review/review";

const reviewsArray = [
  {
    cliente: "Gabriela R.",
    data: "10/01/2025",
    nota: 3.5,
    comentario: (
      <>
        Comprei achando que ia ser prático, um preço caro por negócio durar 5 “
        vezes” literalmente usei 5 vezes, um absurdo completo
      </>
    ),
    questions: {
      recomenda: "não",
      idade: "entre 18 e 24 anos",
      tipo_pele: "mista",
      pele_rosto_sensivel: "não",
    },
    resposta: {
      usuario: "Sallve",
      resposta: (
        <>
          oi Gabriela, sentimos muito que o bastão antiatrito não tenha atendido
          suas expectativas em relação ao rendimento. queremos entender melhor o
          que aconteceu e ajudar da melhor forma possível. vamos entrar em
          contato com você por e-mail para conversarmos mais sobre sua
          experiência.
        </>
      ),
    },
  },
  {
    cliente: "Carlos M.",
    data: "11/01/2025",
    nota: 4.0,
    comentario: (
      <>
        Gostei do produto, mas acho que poderia ter um pouco mais de rendimento.
        Usei durante algumas semanas e já acabou.
      </>
    ),
    questions: {
      recomenda: "sim",
      idade: "entre 25 e 34 anos",
      tipo_pele: "oleosa",
      pele_rosto_sensivel: "sim",
    },
    resposta: {
      usuario: "Sallve",
      resposta: (
        <>
          oi Carlos, ficamos felizes que gostou do produto! entendemos sua
          observação sobre o rendimento e agradecemos seu feedback. sua opinião
          é muito importante para continuarmos melhorando. qualquer dúvida,
          estamos por aqui!
        </>
      ),
    },
  },
  {
    cliente: "Mariana F.",
    data: "12/01/2025",
    nota: 5.0,
    comentario: (
      <>
        Produto excelente! Cumpre o que promete e tem um cheiro muito agradável.
        Super recomendo para quem pratica esportes.
      </>
    ),
    questions: {
      recomenda: "sim",
      idade: "entre 25 e 34 anos",
      tipo_pele: "normal",
      pele_rosto_sensivel: "não",
    },
    resposta: null,
  },
  {
    cliente: "João P.",
    data: "13/01/2025",
    nota: 2.0,
    comentario: (
      <>
        Não gostei do produto. Achei que fosse ajudar mais, mas deixou minha
        pele irritada após algumas aplicações.
      </>
    ),
    questions: {
      recomenda: "não",
      idade: "entre 35 e 44 anos",
      tipo_pele: "seca",
      pele_rosto_sensivel: "sim",
    },
    resposta: {
      usuario: "Sallve",
      resposta: (
        <>
          oi João, sentimos muito que teve essa experiência com o nosso produto.
          queremos entender melhor o que aconteceu e oferecer o suporte
          necessário. nossa equipe entrará em contato com você por e-mail.
          agradecemos o seu feedback!
        </>
      ),
    },
  },
];

const Reviews = ({ avaliacoes }) => {
  return (
    <div className="font-poppins">
      {avaliacoes?.map((review, index) => (
        <Review key={review.id} review={review} />
      ))}
    </div>
  );
};

export default Reviews;
