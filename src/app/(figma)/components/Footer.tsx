import Image from "next/image";
import Link from "next/link";

export function Footer() {
  const linksColumn1 = [
    "Link interno SEO",
    "Link interno SEO",
    "Link interno SEO",
    "Link interno SEO",
    "Link interno SEO",
  ];

  const linksColumn2 = [
    "Link interno SEO",
    "Link interno SEO",
    "Link interno SEO",
    "Link interno SEO",
    "Link interno SEO",
  ];

  const linksColumn3 = [
    "Link interno SEO",
    "Link interno SEO",
    "Link interno SEO",
    "Link interno SEO",
    "Link interno SEO",
  ];

  return (
    <footer className="bg-[#254333] w-full flex flex-col items-center">
      {/* Conteúdo principal do footer */}
      <div className="w-full max-w-[1440px] flex flex-col gap-8 items-center py-6 px-12">
        {/* Links e Logo */}
        <div className="w-full flex gap-8 items-start justify-center">
          {/* Coluna 1 */}
          <div className="flex-1 flex flex-col gap-4 items-start py-2 min-h-0 min-w-0">
            {linksColumn1.map((link, index) => (
              <Link
                key={index}
                href="#"
                className="font-cera-pro font-light text-[14px] text-white leading-none hover:underline"
              >
                {link}
              </Link>
            ))}
          </div>

          {/* Coluna 2 */}
          <div className="flex-1 flex flex-col gap-4 items-start py-2 min-h-0 min-w-0">
            {linksColumn2.map((link, index) => (
              <Link
                key={index}
                href="#"
                className="font-cera-pro font-light text-[14px] text-white leading-none hover:underline"
              >
                {link}
              </Link>
            ))}
          </div>

          {/* Coluna 3 */}
          <div className="flex-1 flex flex-col gap-4 items-start py-2 min-h-0 min-w-0">
            {linksColumn3.map((link, index) => (
              <Link
                key={index}
                href="#"
                className="font-cera-pro font-light text-[14px] text-white leading-none hover:underline"
              >
                {link}
              </Link>
            ))}
          </div>

          {/* Logo e Redes Sociais */}
          <div className="flex flex-col gap-6 items-center">
            <div className="relative w-[275px] h-[155px]">
              <Image
                src="/new-home/header/logo.png"
                alt="Lové Cosméticos"
                fill
                className="object-contain"
              />
            </div>

            {/* Ícones de Redes Sociais */}
            <div className="flex gap-4 items-center">
              <Link href="#" className="w-8 h-8">
                <Image
                  src="/new-home/social/facebook.svg"
                  alt="Facebook"
                  width={32}
                  height={32}
                />
              </Link>
              <Link href="#" className="w-8 h-8">
                <Image
                  src="/new-home/social/instagram.svg"
                  alt="Instagram"
                  width={32}
                  height={32}
                />
              </Link>
              <Link href="#" className="w-8 h-8">
                <Image
                  src="/new-home/social/whatsapp.svg"
                  alt="WhatsApp"
                  width={32}
                  height={32}
                />
              </Link>
              <Link href="#" className="w-8 h-8">
                <Image
                  src="/new-home/social/tiktok.svg"
                  alt="TikTok"
                  width={32}
                  height={32}
                />
              </Link>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <p className="font-cera-pro font-light text-[12px] text-[#f2f2f2] text-center leading-[22px] w-full">
          2025 Lovè. Todos os direitos reservados. Rua Benjamim Benchimol, 125 - Conjunto Petro - Manaus/AM CEP: 69083-040 CNPJ: 42.609.440.0001-90
        </p>
      </div>

      {/* Footer branco - Meios de pagamento */}
      <div className="bg-[#f8f3ed] w-full flex flex-col gap-2.5 items-center overflow-hidden py-8">
        <div className="w-full max-w-[1440px] flex gap-10 items-center justify-center px-12">
          {/* Elo */}
          <div className="relative w-[56.447px] h-[21.632px]">
            <Image
              src="/new-home/footer/elo.svg"
              alt="Elo"
              fill
              className="object-contain"
            />
          </div>

          {/* Mastercard */}
          <div className="relative w-[31.502px] h-[24.479px]">
            <Image
              src="/new-home/footer/mastercard.svg"
              alt="Mastercard"
              fill
              className="object-contain"
            />
          </div>

          {/* Visa */}
          <div className="relative w-[45.491px] h-[13.827px]">
            <Image
              src="/new-home/footer/visa.svg"
              alt="Visa"
              fill
              className="object-contain"
            />
          </div>

          {/* Amex */}
          <div className="relative w-[28px] h-[28px]">
            <Image
              src="/new-home/footer/amex.svg"
              alt="American Express"
              fill
              className="object-contain"
            />
          </div>
        </div>
      </div>
    </footer>
  );
}
