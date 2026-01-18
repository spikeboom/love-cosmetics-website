import Image from "next/image";

export default function SobrePage() {
  return (
    <main className="min-h-screen bg-[#f8f3ed]">
      {/* Hero Section */}
      <section className="relative w-full h-[300px] lg:h-[400px] bg-[#254333] flex items-center justify-center">
        <div className="text-center px-4">
          <h1 className="font-ivypresto text-[32px] lg:text-[48px] text-white mb-4">
            Sobre a Lovè
          </h1>
          <p className="font-cera-pro font-light text-[16px] lg:text-[18px] text-white/90 max-w-[600px]">
            Beleza que vem da Amazônia, com ciência e propósito
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="w-full max-w-[1200px] mx-auto px-4 py-12 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h2 className="font-ivypresto text-[24px] lg:text-[32px] text-[#254333] mb-6">
              Nossa História
            </h2>
            <p className="font-cera-pro font-light text-[14px] lg:text-[16px] text-[#254333] leading-relaxed mb-4">
              A Lovè nasceu do encontro entre a riqueza da biodiversidade amazônica e a mais avançada tecnologia cosmética.
              Somos uma marca brasileira comprometida em levar o melhor da natureza para sua rotina de cuidados com a pele.
            </p>
            <p className="font-cera-pro font-light text-[14px] lg:text-[16px] text-[#254333] leading-relaxed">
              Cada produto é desenvolvido com ingredientes selecionados da floresta amazônica,
              combinados com fórmulas cientificamente comprovadas para entregar resultados reais.
            </p>
          </div>
          <div className="relative w-full h-[300px] lg:h-[400px] rounded-lg overflow-hidden">
            <Image
              src="/new-home/hero-desktop.png"
              alt="Lovè Cosméticos"
              fill
              className="object-cover"
            />
          </div>
        </div>

        {/* Valores */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="w-12 h-12 bg-[#254333] rounded-full flex items-center justify-center mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="#ba7900"/>
              </svg>
            </div>
            <h3 className="font-ivypresto text-[20px] text-[#254333] mb-3">
              Qualidade
            </h3>
            <p className="font-cera-pro font-light text-[14px] text-[#254333]/80 leading-relaxed">
              Produtos desenvolvidos com os mais altos padrões de qualidade e segurança.
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="w-12 h-12 bg-[#254333] rounded-full flex items-center justify-center mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.04L12 21.35Z" fill="#ba7900"/>
              </svg>
            </div>
            <h3 className="font-ivypresto text-[20px] text-[#254333] mb-3">
              Sustentabilidade
            </h3>
            <p className="font-cera-pro font-light text-[14px] text-[#254333]/80 leading-relaxed">
              Compromisso com práticas sustentáveis e respeito à biodiversidade amazônica.
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="w-12 h-12 bg-[#254333] rounded-full flex items-center justify-center mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z" fill="#ba7900"/>
              </svg>
            </div>
            <h3 className="font-ivypresto text-[20px] text-[#254333] mb-3">
              Resultados
            </h3>
            <p className="font-cera-pro font-light text-[14px] text-[#254333]/80 leading-relaxed">
              Fórmulas cientificamente desenvolvidas para entregar resultados visíveis.
            </p>
          </div>
        </div>

        {/* Diferenciais */}
        <div className="bg-[#254333] rounded-lg p-8 lg:p-12 text-center">
          <h2 className="font-ivypresto text-[24px] lg:text-[32px] text-white mb-6">
            Nossos Diferenciais
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <p className="font-ivypresto text-[32px] text-[#ba7900] mb-2">100%</p>
              <p className="font-cera-pro font-light text-[14px] text-white">Ingredientes naturais</p>
            </div>
            <div>
              <p className="font-ivypresto text-[32px] text-[#ba7900] mb-2">Cruelty-Free</p>
              <p className="font-cera-pro font-light text-[14px] text-white">Não testamos em animais</p>
            </div>
            <div>
              <p className="font-ivypresto text-[32px] text-[#ba7900] mb-2">Vegano</p>
              <p className="font-cera-pro font-light text-[14px] text-white">Produtos 100% veganos</p>
            </div>
            <div>
              <p className="font-ivypresto text-[32px] text-[#ba7900] mb-2">Amazônia</p>
              <p className="font-cera-pro font-light text-[14px] text-white">Ativos da floresta</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
