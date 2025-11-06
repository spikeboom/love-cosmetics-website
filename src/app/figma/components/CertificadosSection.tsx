import Image from "next/image";

interface CertificadoCardProps {
  icon: string;
  titulo: string;
  subtitulo: string;
  imagemFundo?: string;
}

function CertificadoCard({ icon, titulo, subtitulo, imagemFundo }: CertificadoCardProps) {
  return (
    <div className="relative flex items-center lg:w-[380px] w-full h-[64px] bg-white rounded-xl shadow-[0px_1px_2px_0px_rgba(0,0,0,0.3),0px_1px_3px_1px_rgba(0,0,0,0.15)] overflow-hidden">
      {/* Texto e Ícone */}
      <div className="flex-1 flex items-center gap-2 h-full p-4">
        {/* Ícone */}
        <div className="lg:w-8 lg:h-8 w-6 h-6 shrink-0 flex items-center justify-center">
          <Image
            src={`/new-home/icons/${icon}.svg`}
            alt=""
            width={32}
            height={32}
            className="w-full h-full"
          />
        </div>

        {/* Textos */}
        <div className="flex flex-col gap-1 lg:gap-2 flex-1">
          <p className="font-cera-pro font-bold lg:text-[20px] text-[16px] text-[#1d1b20] leading-none">
            {titulo}
          </p>
          <p className="font-cera-pro font-light lg:text-[14px] text-[12px] text-[#1d1b20] leading-none">
            {subtitulo}
          </p>
        </div>
      </div>

      {/* Mídia lateral */}
      {imagemFundo && (
        <div className="relative lg:w-20 w-16 h-full shrink-0">
          <Image
            src={imagemFundo}
            alt=""
            fill
            className="object-cover"
          />
        </div>
      )}
    </div>
  );
}

export function CertificadosSection() {
  return (
    <section className="bg-[#f8f3ed] w-full flex flex-col gap-4 items-center py-6 px-0">
      {/* Mobile: Coluna única */}
      <div className="lg:hidden flex flex-col gap-4 items-center px-4 w-full">
        <CertificadoCard
          icon="verified"
          titulo="Certificado"
          subtitulo="Pela Anvisa"
          imagemFundo="/new-home/certificados/cert-anvisa.png"
        />
        <CertificadoCard
          icon="verified-user"
          titulo="Site seguro"
          subtitulo="Certificado SSL"
          imagemFundo="/new-home/certificados/cert-ssl.png"
        />
        <CertificadoCard
          icon="verified"
          titulo="Certificado"
          subtitulo="Pela Anvisa"
          imagemFundo="/new-home/certificados/cert-anvisa.png"
        />
      </div>

      {/* Desktop: Linha horizontal */}
      <div className="hidden lg:flex gap-8 items-start justify-center px-4 w-full">
        <CertificadoCard
          icon="verified"
          titulo="Certificado"
          subtitulo="Pela Anvisa"
          imagemFundo="/new-home/certificados/cert-anvisa.png"
        />
        <CertificadoCard
          icon="verified-user"
          titulo="Site seguro"
          subtitulo="Certificado SSL"
          imagemFundo="/new-home/certificados/cert-ssl.png"
        />
        <CertificadoCard
          icon="verified"
          titulo="Certificado"
          subtitulo="Pela Anvisa"
          imagemFundo="/new-home/certificados/cert-anvisa.png"
        />
      </div>
    </section>
  );
}
