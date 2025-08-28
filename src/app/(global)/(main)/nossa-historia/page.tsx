"use client";

import Image from "next/image";
import { Container } from "@mui/material";

export default function NossaHistoria() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-rose-50">
      <Container maxWidth="lg" className="py-16 px-4">
        <div className="space-y-16">
          <section className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-rose-900 mb-6">
              Lovè
              <span className="block text-2xl md:text-3xl font-normal text-rose-700 mt-2">
                Cosméticos da Amazônia
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-700 max-w-3xl mx-auto italic leading-relaxed">
              "Somos uma marca que acredita que a verdadeira beleza nasce do equilíbrio 
              entre a natureza e o cuidado humano. Inspirados pela Amazônia, transformamos 
              sua biodiversidade em cosméticos que cuidam de você e preservam a floresta."
            </p>
          </section>

          <section className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-rose-900">Propósito e Missão</h2>
              <div className="space-y-4">
                <div className="bg-white rounded-lg p-6 shadow-md border-l-4 border-rose-400">
                  <h3 className="font-semibold text-rose-800 mb-2">Nosso Propósito</h3>
                  <p className="text-gray-700">
                    Ser a maior representante dos ativos amazônicos e de preservação 
                    da floresta em pé para o Mundo.
                  </p>
                </div>
                <div className="bg-white rounded-lg p-6 shadow-md border-l-4 border-rose-400">
                  <h3 className="font-semibold text-rose-800 mb-2">Nossa Missão</h3>
                  <p className="text-gray-700">
                    Levar ao mundo a beleza e a eficácia dos ativos amazônicos de 
                    forma sustentável.
                  </p>
                </div>
              </div>
            </div>
            <div className="relative h-[300px] md:h-[400px] rounded-2xl overflow-hidden shadow-xl">
              <div className="absolute inset-0 bg-gradient-to-br from-rose-300 to-rose-500 opacity-20"></div>
              <div className="flex items-center justify-center h-full">
                <span className="text-6xl">🌿</span>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-2xl p-8 md:p-12 shadow-lg">
            <h2 className="text-3xl font-bold text-rose-900 mb-8">História da Marca</h2>
            <p className="text-gray-700 leading-relaxed text-lg">
              A Love Cosméticos nasceu da paixão de uma doutora em biotecnologia, 
              pesquisadora de ativos amazônicos e especialista em cosméticos. 
              Ao idealizar seus próprios produtos de skincare, produziu uma primeira 
              coleção que rapidamente se esgotou. O sucesso inicial abriu caminho 
              para que o projeto fosse submetido à <span className="font-semibold text-rose-700">Jornada Amazônia</span>, 
              onde recebeu prêmio financeiro e consultoria – impulso decisivo para 
              transformar um sonho em realidade.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-rose-900 mb-8 text-center">Nossos Valores</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: "🌱", title: "Sustentabilidade", desc: "Respeito ao meio ambiente" },
                { icon: "🦋", title: "Biodiversidade", desc: "Valorização da Amazônia" },
                { icon: "🔬", title: "Ciência", desc: "Inovação e cuidado humano" },
                { icon: "💚", title: "Ética", desc: "Produção responsável" }
              ].map((valor, idx) => (
                <div key={idx} className="bg-gradient-to-br from-rose-50 to-white rounded-xl p-6 text-center hover:shadow-lg transition-shadow">
                  <div className="text-4xl mb-4">{valor.icon}</div>
                  <h3 className="font-semibold text-rose-800 mb-2">{valor.title}</h3>
                  <p className="text-gray-600 text-sm">{valor.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="grid md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-rose-900">Diferenciais</h2>
              <ul className="space-y-3">
                {[
                  "Cosméticos naturais com ingredientes exclusivos da Amazônia",
                  "Produção ética, sem crueldade animal",
                  "Processos sustentáveis e rastreáveis",
                  "Mistura o conhecimento tradicional local e inovação (biotecnologia)"
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start">
                    <span className="text-rose-500 mr-3 mt-1">✓</span>
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-rose-900">Conexão com a Amazônia</h2>
              <div className="bg-gradient-to-r from-emerald-50 to-rose-50 rounded-xl p-6">
                <p className="text-gray-700 mb-4">
                  Utilizamos ativos da maior floresta tropical do mundo, transformando 
                  a riqueza da Amazônia em cosméticos de forma responsável e sustentável.
                </p>
                <p className="text-gray-700 mb-4">
                  Valorizamos comunidades locais e incentivamos a floresta a permanecer 
                  em pé, através da disseminação do conhecimento sobre os benefícios 
                  dos ativos amazônicos.
                </p>
                <p className="text-gray-700">
                  Investimos em biotecnologia e pesquisa, para transformar os ingredientes 
                  naturais em fórmulas seguras, eficazes e inovadoras, sem agredir o 
                  meio ambiente.
                </p>
              </div>
            </div>
          </section>

          <section className="bg-gradient-to-r from-rose-100 to-rose-200 rounded-2xl p-8 md:p-12">
            <h2 className="text-3xl font-bold text-rose-900 mb-8">Impacto Social e Ambiental</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { 
                  icon: "👥", 
                  title: "Apoio às Comunidades",
                  desc: "Apoio a comunidades ribeirinhas, extrativistas ou indígenas"
                },
                {
                  icon: "🤝",
                  title: "Parcerias Locais", 
                  desc: "Parcerias que geram renda local e preservação da floresta"
                },
                {
                  icon: "🌳",
                  title: "Responsabilidade",
                  desc: "Projetos de reflorestamento ou responsabilidade social"
                }
              ].map((item, idx) => (
                <div key={idx} className="bg-white rounded-xl p-6 text-center">
                  <div className="text-4xl mb-4">{item.icon}</div>
                  <h3 className="font-semibold text-rose-800 mb-2">{item.title}</h3>
                  <p className="text-gray-600 text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="text-center bg-white rounded-2xl p-8 md:p-12 shadow-lg">
            <h2 className="text-3xl font-bold text-rose-900 mb-6">Compromisso com o Cliente</h2>
            <div className="space-y-4 max-w-2xl mx-auto">
              <div className="flex items-center justify-center space-x-8">
                <div className="text-center">
                  <span className="text-3xl">✨</span>
                  <p className="text-sm text-gray-600 mt-2">Produtos seguros</p>
                </div>
                <div className="text-center">
                  <span className="text-3xl">🔍</span>
                  <p className="text-sm text-gray-600 mt-2">Transparência</p>
                </div>
                <div className="text-center">
                  <span className="text-3xl">💖</span>
                  <p className="text-sm text-gray-600 mt-2">Beleza consciente</p>
                </div>
              </div>
              
              <p className="text-lg text-rose-700 font-medium mt-8 italic">
                "Cada escolha pelos nossos produtos é um gesto de cuidado com você 
                e com a natureza."
              </p>
            </div>
          </section>
        </div>
      </Container>
    </div>
  );
}