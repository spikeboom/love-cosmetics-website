
export default function SobrePage() {
  return (
    <main className="min-h-screen bg-[#f8f3ed]">
      {/* Hero Section */}
      <section className="relative w-full h-[300px] lg:h-[400px] bg-[#254333] flex items-center justify-center">
        <div className="text-center px-4">
          <h1 className="font-ivypresto text-[32px] lg:text-[48px] text-white mb-4">
            Lovè
          </h1>
          <p className="font-cera-pro font-light text-[18px] lg:text-[24px] text-white/90 max-w-[700px]">
            Cosméticos da Amazônia
          </p>
          <p className="font-cera-pro font-light text-[14px] lg:text-[16px] text-white/80 max-w-[700px] mt-4 italic">
            "Somos uma marca que acredita que a verdadeira beleza nasce do equilíbrio
            entre a natureza e o cuidado humano."
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="w-full max-w-[1200px] mx-auto px-4 py-12 lg:py-20">

        {/* Propósito e Missão */}
        <div className="grid lg:grid-cols-2 gap-8 mb-16">
          <div className="bg-white rounded-lg p-6 lg:p-8 shadow-sm border-l-4 border-[#ba7900]">
            <h3 className="font-ivypresto text-[20px] lg:text-[24px] text-[#254333] mb-4">
              Nosso Propósito
            </h3>
            <p className="font-cera-pro font-light text-[14px] lg:text-[16px] text-[#254333]/80 leading-relaxed">
              Ser a maior representante dos ativos amazônicos e de preservação
              da floresta em pé para o Mundo.
            </p>
          </div>
          <div className="bg-white rounded-lg p-6 lg:p-8 shadow-sm border-l-4 border-[#ba7900]">
            <h3 className="font-ivypresto text-[20px] lg:text-[24px] text-[#254333] mb-4">
              Nossa Missão
            </h3>
            <p className="font-cera-pro font-light text-[14px] lg:text-[16px] text-[#254333]/80 leading-relaxed">
              Levar ao mundo a beleza e a eficácia dos ativos amazônicos de
              forma sustentável.
            </p>
          </div>
        </div>

        {/* História da Marca */}
        <div className="bg-white rounded-lg p-6 lg:p-10 shadow-sm mb-16">
          <h2 className="font-ivypresto text-[24px] lg:text-[32px] text-[#254333] mb-6">
            Nossa História
          </h2>
          <p className="font-cera-pro font-light text-[14px] lg:text-[16px] text-[#254333] leading-relaxed mb-4">
            A Lovè nasceu da paixão de uma doutora em biotecnologia,
            pesquisadora de ativos amazônicos e especialista em cosméticos.
            Ao idealizar seus próprios produtos de skincare, produziu uma primeira
            coleção que rapidamente se esgotou.
          </p>
          <p className="font-cera-pro font-light text-[14px] lg:text-[16px] text-[#254333] leading-relaxed mb-4">
            O sucesso inicial abriu caminho para que o projeto fosse submetido à
            <span className="font-medium text-[#ba7900]"> Jornada Amazônia</span>,
            onde recebeu prêmio financeiro e consultoria – impulso decisivo para
            transformar um sonho em realidade.
          </p>
          <p className="font-cera-pro font-light text-[14px] lg:text-[16px] text-[#254333] leading-relaxed">
            Cada produto é desenvolvido com ingredientes selecionados da floresta amazônica,
            combinados com fórmulas cientificamente comprovadas para entregar resultados reais.
          </p>
        </div>

        {/* Valores */}
        <div className="mb-16">
          <h2 className="font-ivypresto text-[24px] lg:text-[32px] text-[#254333] mb-8 text-center">
            Nossos Valores
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg p-6 shadow-sm text-center">
              <div className="w-12 h-12 bg-[#254333] rounded-full flex items-center justify-center mb-4 mx-auto">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C13.1 2 14 2.9 14 4C14 4.74 13.6 5.39 13 5.73V7H14C17.31 7 20 9.69 20 13V20C20 21.1 19.1 22 18 22H6C4.9 22 4 21.1 4 20V13C4 9.69 6.69 7 10 7H11V5.73C10.4 5.39 10 4.74 10 4C10 2.9 10.9 2 12 2ZM7 13V20H17V13C17 11.34 15.66 10 14 10H10C8.34 10 7 11.34 7 13Z" fill="#ba7900"/>
                </svg>
              </div>
              <h3 className="font-ivypresto text-[18px] text-[#254333] mb-3">
                Sustentabilidade
              </h3>
              <p className="font-cera-pro font-light text-[14px] text-[#254333]/80 leading-relaxed">
                Respeito ao meio ambiente em cada etapa
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm text-center">
              <div className="w-12 h-12 bg-[#254333] rounded-full flex items-center justify-center mb-4 mx-auto">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22L6.66 19.7C7.14 19.87 7.64 20 8 20C19 20 22 3 22 3C21 5 14 5.25 9 6.25C4 7.25 2 11.5 2 13.5C2 15.5 3.75 17.25 3.75 17.25C7 8 17 8 17 8Z" fill="#ba7900"/>
                </svg>
              </div>
              <h3 className="font-ivypresto text-[18px] text-[#254333] mb-3">
                Biodiversidade
              </h3>
              <p className="font-cera-pro font-light text-[14px] text-[#254333]/80 leading-relaxed">
                Valorização da riqueza amazônica
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm text-center">
              <div className="w-12 h-12 bg-[#254333] rounded-full flex items-center justify-center mb-4 mx-auto">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7 2V13H10V22L17 10H13L17 2H7Z" fill="#ba7900"/>
                </svg>
              </div>
              <h3 className="font-ivypresto text-[18px] text-[#254333] mb-3">
                Ciência
              </h3>
              <p className="font-cera-pro font-light text-[14px] text-[#254333]/80 leading-relaxed">
                Inovação e biotecnologia avançada
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm text-center">
              <div className="w-12 h-12 bg-[#254333] rounded-full flex items-center justify-center mb-4 mx-auto">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.04L12 21.35Z" fill="#ba7900"/>
                </svg>
              </div>
              <h3 className="font-ivypresto text-[18px] text-[#254333] mb-3">
                Ética
              </h3>
              <p className="font-cera-pro font-light text-[14px] text-[#254333]/80 leading-relaxed">
                Produção responsável e consciente
              </p>
            </div>
          </div>
        </div>

        {/* Diferenciais e Conexão com Amazônia */}
        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          <div>
            <h2 className="font-ivypresto text-[24px] lg:text-[32px] text-[#254333] mb-6">
              Nossos Diferenciais
            </h2>
            <ul className="space-y-4">
              {[
                "Cosméticos naturais com ingredientes exclusivos da Amazônia",
                "Produção ética, sem crueldade animal",
                "Processos sustentáveis e rastreáveis",
                "União do conhecimento tradicional local com biotecnologia"
              ].map((item, idx) => (
                <li key={idx} className="flex items-start">
                  <div className="w-6 h-6 bg-[#254333] rounded-full flex items-center justify-center mr-3 mt-0.5 shrink-0">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z" fill="#ba7900"/>
                    </svg>
                  </div>
                  <span className="font-cera-pro font-light text-[14px] lg:text-[16px] text-[#254333]">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="font-ivypresto text-[24px] lg:text-[32px] text-[#254333] mb-6">
              Conexão com a Amazônia
            </h2>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <p className="font-cera-pro font-light text-[14px] lg:text-[16px] text-[#254333]/80 leading-relaxed mb-4">
                Utilizamos ativos da maior floresta tropical do mundo, transformando
                a riqueza da Amazônia em cosméticos de forma responsável e sustentável.
              </p>
              <p className="font-cera-pro font-light text-[14px] lg:text-[16px] text-[#254333]/80 leading-relaxed mb-4">
                Valorizamos comunidades locais e incentivamos a floresta a permanecer
                em pé, através da disseminação do conhecimento sobre os benefícios
                dos ativos amazônicos.
              </p>
              <p className="font-cera-pro font-light text-[14px] lg:text-[16px] text-[#254333]/80 leading-relaxed">
                Investimos em biotecnologia e pesquisa para transformar os ingredientes
                naturais em fórmulas seguras, eficazes e inovadoras.
              </p>
            </div>
          </div>
        </div>

        {/* Impacto Social e Ambiental */}
        <div className="bg-[#254333] rounded-lg p-8 lg:p-12 mb-16">
          <h2 className="font-ivypresto text-[24px] lg:text-[32px] text-white mb-8 text-center">
            Impacto Social e Ambiental
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white/10 rounded-lg p-6 text-center">
              <div className="w-14 h-14 bg-[#ba7900] rounded-full flex items-center justify-center mb-4 mx-auto">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16 11C17.66 11 18.99 9.66 18.99 8C18.99 6.34 17.66 5 16 5C14.34 5 13 6.34 13 8C13 9.66 14.34 11 16 11ZM8 11C9.66 11 10.99 9.66 10.99 8C10.99 6.34 9.66 5 8 5C6.34 5 5 6.34 5 8C5 9.66 6.34 11 8 11ZM8 13C5.67 13 1 14.17 1 16.5V19H15V16.5C15 14.17 10.33 13 8 13ZM16 13C15.71 13 15.38 13.02 15.03 13.05C16.19 13.89 17 15.02 17 16.5V19H23V16.5C23 14.17 18.33 13 16 13Z" fill="#254333"/>
                </svg>
              </div>
              <h3 className="font-ivypresto text-[18px] text-white mb-3">
                Apoio às Comunidades
              </h3>
              <p className="font-cera-pro font-light text-[14px] text-white/80 leading-relaxed">
                Apoio a comunidades ribeirinhas, extrativistas e indígenas
              </p>
            </div>

            <div className="bg-white/10 rounded-lg p-6 text-center">
              <div className="w-14 h-14 bg-[#ba7900] rounded-full flex items-center justify-center mb-4 mx-auto">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11.5 2C11.5 2 10.45 3.95 10.45 5.45C10.45 6.95 11.72 8.05 11.72 8.05C11.72 8.05 12.95 7.05 12.95 5.45C12.95 3.95 11.5 2 11.5 2ZM6.5 9C6.5 9 4.45 10.95 4.45 13.45C4.45 15.95 7.22 18.05 7.22 18.05C7.22 18.05 9.95 15.55 9.95 13.45C9.95 10.95 6.5 9 6.5 9ZM17.5 9C17.5 9 14.05 10.95 14.05 13.45C14.05 15.55 16.78 18.05 16.78 18.05C16.78 18.05 19.55 15.95 19.55 13.45C19.55 10.95 17.5 9 17.5 9ZM12 10.5C12 10.5 8.5 13.45 8.5 17C8.5 20.55 12 22 12 22C12 22 15.5 20.55 15.5 17C15.5 13.45 12 10.5 12 10.5Z" fill="#254333"/>
                </svg>
              </div>
              <h3 className="font-ivypresto text-[18px] text-white mb-3">
                Parcerias Locais
              </h3>
              <p className="font-cera-pro font-light text-[14px] text-white/80 leading-relaxed">
                Parcerias que geram renda local e preservação da floresta
              </p>
            </div>

            <div className="bg-white/10 rounded-lg p-6 text-center">
              <div className="w-14 h-14 bg-[#ba7900] rounded-full flex items-center justify-center mb-4 mx-auto">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L4.5 20.29L5.21 21L12 18L18.79 21L19.5 20.29L12 2Z" fill="#254333"/>
                </svg>
              </div>
              <h3 className="font-ivypresto text-[18px] text-white mb-3">
                Responsabilidade
              </h3>
              <p className="font-cera-pro font-light text-[14px] text-white/80 leading-relaxed">
                Projetos de reflorestamento e responsabilidade social
              </p>
            </div>
          </div>
        </div>

        {/* Compromisso com o Cliente */}
        <div className="bg-white rounded-lg p-8 lg:p-12 shadow-sm text-center">
          <h2 className="font-ivypresto text-[24px] lg:text-[32px] text-[#254333] mb-8">
            Compromisso com Você
          </h2>
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <div>
              <p className="font-ivypresto text-[28px] lg:text-[32px] text-[#ba7900] mb-2">100%</p>
              <p className="font-cera-pro font-light text-[14px] text-[#254333]">Ingredientes naturais</p>
            </div>
            <div>
              <p className="font-ivypresto text-[28px] lg:text-[32px] text-[#ba7900] mb-2">Cruelty-Free</p>
              <p className="font-cera-pro font-light text-[14px] text-[#254333]">Não testamos em animais</p>
            </div>
            <div>
              <p className="font-ivypresto text-[28px] lg:text-[32px] text-[#ba7900] mb-2">Vegano</p>
              <p className="font-cera-pro font-light text-[14px] text-[#254333]">Produtos 100% veganos</p>
            </div>
            <div>
              <p className="font-ivypresto text-[28px] lg:text-[32px] text-[#ba7900] mb-2">Amazônia</p>
              <p className="font-cera-pro font-light text-[14px] text-[#254333]">Ativos da floresta</p>
            </div>
          </div>
          <p className="font-cera-pro font-light text-[16px] lg:text-[18px] text-[#254333] italic max-w-[600px] mx-auto">
            "Cada escolha pelos nossos produtos é um gesto de cuidado com você
            e com a natureza."
          </p>
        </div>
      </section>
    </main>
  );
}
