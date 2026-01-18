"use client";

import { useState } from "react";
import Image from "next/image";

export default function FaleConoscoPage() {
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    assunto: "",
    mensagem: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implementar envio do formulário
    alert("Mensagem enviada com sucesso! Entraremos em contato em breve.");
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <main className="min-h-screen bg-[#f8f3ed]">
      {/* Hero Section */}
      <section className="relative w-full h-[200px] lg:h-[300px] bg-[#254333] flex items-center justify-center">
        <div className="text-center px-4">
          <h1 className="font-ivypresto text-[32px] lg:text-[48px] text-white mb-4">
            Fale Conosco
          </h1>
          <p className="font-cera-pro font-light text-[16px] lg:text-[18px] text-white/90 max-w-[600px]">
            Estamos aqui para ajudar você
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="w-full max-w-[1200px] mx-auto px-4 py-12 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Formulário */}
          <div className="bg-white rounded-lg p-6 lg:p-8 shadow-sm">
            <h2 className="font-ivypresto text-[24px] text-[#254333] mb-6">
              Envie sua mensagem
            </h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="font-cera-pro font-medium text-[14px] text-[#254333] mb-2 block">
                  Nome completo *
                </label>
                <input
                  type="text"
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  required
                  className="w-full h-[48px] px-4 border border-[#254333]/20 rounded-lg font-cera-pro text-[14px] text-[#254333] focus:outline-none focus:border-[#254333]"
                  placeholder="Seu nome"
                />
              </div>

              <div>
                <label className="font-cera-pro font-medium text-[14px] text-[#254333] mb-2 block">
                  E-mail *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full h-[48px] px-4 border border-[#254333]/20 rounded-lg font-cera-pro text-[14px] text-[#254333] focus:outline-none focus:border-[#254333]"
                  placeholder="seu@email.com"
                />
              </div>

              <div>
                <label className="font-cera-pro font-medium text-[14px] text-[#254333] mb-2 block">
                  Telefone
                </label>
                <input
                  type="tel"
                  name="telefone"
                  value={formData.telefone}
                  onChange={handleChange}
                  className="w-full h-[48px] px-4 border border-[#254333]/20 rounded-lg font-cera-pro text-[14px] text-[#254333] focus:outline-none focus:border-[#254333]"
                  placeholder="(00) 00000-0000"
                />
              </div>

              <div>
                <label className="font-cera-pro font-medium text-[14px] text-[#254333] mb-2 block">
                  Assunto *
                </label>
                <select
                  name="assunto"
                  value={formData.assunto}
                  onChange={handleChange}
                  required
                  className="w-full h-[48px] px-4 border border-[#254333]/20 rounded-lg font-cera-pro text-[14px] text-[#254333] focus:outline-none focus:border-[#254333] bg-white"
                >
                  <option value="">Selecione um assunto</option>
                  <option value="duvidas">Dúvidas sobre produtos</option>
                  <option value="pedido">Informações sobre pedido</option>
                  <option value="troca">Trocas e devoluções</option>
                  <option value="parceria">Parcerias</option>
                  <option value="outro">Outro</option>
                </select>
              </div>

              <div>
                <label className="font-cera-pro font-medium text-[14px] text-[#254333] mb-2 block">
                  Mensagem *
                </label>
                <textarea
                  name="mensagem"
                  value={formData.mensagem}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="w-full px-4 py-3 border border-[#254333]/20 rounded-lg font-cera-pro text-[14px] text-[#254333] focus:outline-none focus:border-[#254333] resize-none"
                  placeholder="Como podemos ajudar?"
                />
              </div>

              <button
                type="submit"
                className="w-full h-[48px] bg-[#254333] rounded-lg font-cera-pro font-medium text-[14px] text-white hover:bg-[#1a3226] transition-colors mt-2"
              >
                Enviar mensagem
              </button>
            </form>
          </div>

          {/* Informações de contato */}
          <div className="flex flex-col gap-8">
            <div className="bg-white rounded-lg p-6 lg:p-8 shadow-sm">
              <h2 className="font-ivypresto text-[24px] text-[#254333] mb-6">
                Outras formas de contato
              </h2>

              <div className="flex flex-col gap-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-[#254333] rounded-full flex items-center justify-center shrink-0">
                    <Image
                      src="/new-home/social/whatsapp.svg"
                      alt="WhatsApp"
                      width={20}
                      height={20}
                      className="brightness-0 invert"
                    />
                  </div>
                  <div>
                    <p className="font-cera-pro font-medium text-[14px] text-[#254333] mb-1">
                      WhatsApp
                    </p>
                    <p className="font-cera-pro font-light text-[14px] text-[#254333]/80">
                      (92) 99999-9999
                    </p>
                    <p className="font-cera-pro font-light text-[12px] text-[#254333]/60">
                      Segunda a Sexta, 9h às 18h
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-[#254333] rounded-full flex items-center justify-center shrink-0">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 8L12 13L4 8V6L12 11L20 6V8Z" fill="white"/>
                    </svg>
                  </div>
                  <div>
                    <p className="font-cera-pro font-medium text-[14px] text-[#254333] mb-1">
                      E-mail
                    </p>
                    <p className="font-cera-pro font-light text-[14px] text-[#254333]/80">
                      contato@lovecosmeticos.com.br
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-[#254333] rounded-full flex items-center justify-center shrink-0">
                    <Image
                      src="/new-home/social/instagram.svg"
                      alt="Instagram"
                      width={20}
                      height={20}
                      className="brightness-0 invert"
                    />
                  </div>
                  <div>
                    <p className="font-cera-pro font-medium text-[14px] text-[#254333] mb-1">
                      Instagram
                    </p>
                    <p className="font-cera-pro font-light text-[14px] text-[#254333]/80">
                      @lovecosmeticos
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 lg:p-8 shadow-sm">
              <h2 className="font-ivypresto text-[24px] text-[#254333] mb-4">
                Endereço
              </h2>
              <p className="font-cera-pro font-light text-[14px] text-[#254333]/80 leading-relaxed">
                Rua Benjamim Benchimol, 125<br />
                Conjunto Petro - Manaus/AM<br />
                CEP: 69083-040
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
