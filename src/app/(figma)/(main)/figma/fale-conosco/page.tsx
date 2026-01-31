"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

const WHATSAPP_NUMBER = "5592981918872";

export default function FaleConoscoPage() {
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    assunto: "",
    mensagem: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Mapeia o assunto para texto legível
    const assuntoTexto: Record<string, string> = {
      duvidas: "Dúvidas sobre produtos",
      pedido: "Informações sobre pedido",
      troca: "Trocas e devoluções",
      parceria: "Parcerias",
      outro: "Outro",
    };

    // Monta a mensagem para o WhatsApp
    const texto = `Olá! Vim pelo site da Lovè Cosméticos.

*Nome:* ${formData.nome}
*E-mail:* ${formData.email}
*Assunto:* ${assuntoTexto[formData.assunto] || formData.assunto}

*Mensagem:*
${formData.mensagem}`;

    // Codifica a mensagem para URL
    const mensagemCodificada = encodeURIComponent(texto);

    // Abre o WhatsApp com a mensagem
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${mensagemCodificada}`, "_blank");
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
            <h2 className="font-ivypresto text-[24px] text-[#254333] mb-2">
              Envie sua mensagem
            </h2>
            <p className="font-cera-pro font-light text-[14px] text-[#254333]/70 mb-6">
              Preencha o formulário e você será redirecionado para o WhatsApp
            </p>
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
                className="w-full h-[48px] bg-[#25D366] rounded-lg font-cera-pro font-medium text-[14px] text-white hover:bg-[#1fb855] transition-colors mt-2 flex items-center justify-center gap-2"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Enviar pelo WhatsApp
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
                <Link
                  href={`https://wa.me/${WHATSAPP_NUMBER}`}
                  target="_blank"
                  className="flex items-start gap-4 hover:opacity-80 transition-opacity"
                >
                  <div className="w-10 h-10 bg-[#25D366] rounded-full flex items-center justify-center shrink-0">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                  </div>
                  <div>
                    <p className="font-cera-pro font-medium text-[14px] text-[#254333] mb-1">
                      WhatsApp
                    </p>
                    <p className="font-cera-pro font-light text-[14px] text-[#254333]/80">
                      (92) 98191-8872
                    </p>
                    <p className="font-cera-pro font-light text-[12px] text-[#254333]/60">
                      Segunda a Sexta, 9h às 18h
                    </p>
                  </div>
                </Link>

                <Link
                  href="mailto:contato@lovecosmetics.com.br"
                  className="flex items-start gap-4 hover:opacity-80 transition-opacity"
                >
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
                      contato@lovecosmetics.com.br
                    </p>
                  </div>
                </Link>

                <Link
                  href="https://www.instagram.com/cosmeticoslove_"
                  target="_blank"
                  className="flex items-start gap-4 hover:opacity-80 transition-opacity"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#F77737] rounded-full flex items-center justify-center shrink-0">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </div>
                  <div>
                    <p className="font-cera-pro font-medium text-[14px] text-[#254333] mb-1">
                      Instagram
                    </p>
                    <p className="font-cera-pro font-light text-[14px] text-[#254333]/80">
                      @cosmeticoslove_
                    </p>
                  </div>
                </Link>
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
