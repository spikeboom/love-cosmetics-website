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
      <div className="w-full max-w-[1440px] flex flex-col gap-8 items-center py-6 lg:px-12 px-4">
        {/* Logo e Redes Sociais - Mobile First */}
        <div className="flex flex-col gap-6 items-center lg:hidden">
          <div className="relative w-[180px] h-[100px]">
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

        {/* Links - Mobile: 1 coluna, Desktop: 3 colunas + Logo */}
        <div className="w-full flex lg:flex-row flex-col gap-8 items-start justify-center">
          {/* Mobile: Links em uma coluna */}
          <div className="lg:hidden flex flex-col gap-3 items-center w-full">
            {[...linksColumn1, ...linksColumn2, ...linksColumn3].map((link, index) => (
              <Link
                key={index}
                href="#"
                className="font-cera-pro font-light text-[14px] text-white leading-none hover:underline text-center"
              >
                {link}
              </Link>
            ))}
          </div>

          {/* Desktop: 3 colunas + Logo */}
          <div className="hidden lg:flex gap-8 items-start justify-center w-full">
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

            {/* Logo e Redes Sociais - Desktop */}
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
        </div>

        {/* Copyright */}
        <p className="font-cera-pro font-light text-[11px] lg:text-[12px] text-[#f2f2f2] text-center leading-[18px] lg:leading-[22px] w-full">
          2025 Lovè. Todos os direitos reservados. Rua Benjamim Benchimol, 125 - Conjunto Petro - Manaus/AM CEP: 69083-040 CNPJ: 42.609.440.0001-90
        </p>
      </div>

      {/* Footer branco - Meios de pagamento */}
      <div className="bg-[#f8f3ed] w-full flex flex-col gap-2.5 items-center overflow-hidden py-6 lg:py-8">
        <div className="w-full flex gap-6 lg:gap-10 items-center justify-center px-4 lg:px-12">
          {/* Elo */}
          <div className="relative shrink-0 w-[45px] h-[17px] lg:w-[57px] lg:h-[22px]">
            <Image
              src="/new-home/footer/elo.png"
              alt="Elo"
              fill
              className="object-contain"
            />
          </div>

          {/* Mastercard */}
          <div className="relative shrink-0 w-[26px] h-[20px] lg:w-[32px] lg:h-[25px]">
            <Image
              src="/new-home/footer/mastercard.png"
              alt="Mastercard"
              fill
              className="object-contain"
            />
          </div>

          {/* Visa */}
          <div className="relative shrink-0 w-[37px] h-[11px] lg:w-[46px] lg:h-[14px]">
            <Image
              src="/new-home/footer/visa.png"
              alt="Visa"
              fill
              className="object-contain"
            />
          </div>

          {/* Amex */}
          <div className="relative shrink-0 w-[22px] h-[22px] lg:w-[28px] lg:h-[28px]">
            <Image
              src="/new-home/footer/amex.png"
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
