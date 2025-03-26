import Image from "next/image";
import {
  FaFacebook,
  FaInstagram,
  FaLinkedin,
  FaPinterest,
  FaSpotify,
  FaTiktok,
  FaXTwitter,
  FaYoutube,
} from "react-icons/fa6";

export function Rodape() {
  return (
    <div className="flex w-full flex-col items-center">
      <div className="flex w-full flex-col items-center justify-center md:flex-row md:gap-[16px]">
        <div className="flex w-full max-w-[400px] flex-col items-center">
          <div className="relative mb-[32px] h-[140px] w-full max-w-[400px]">
            <Image
              src={"/footer/meios-pagamento.png"}
              alt={`meios de pagamento love`}
              fill
              style={{
                objectFit: "contain",
              }}
            />
          </div>
        </div>

        <div className="mb-[32px] flex flex-wrap md:mb-0">
          <div className="mb-6 flex w-1/4 justify-center">
            <FaFacebook size={32} />
          </div>
          <div className="mb-6 flex w-1/4 justify-center">
            <FaInstagram size={32} />
          </div>
          <div className="mb-6 flex w-1/4 justify-center">
            <FaXTwitter size={32} />
          </div>
          <div className="mb-6 flex w-1/4 justify-center">
            <FaTiktok size={32} />
          </div>
          <div className="mb-6 flex w-1/4 justify-center">
            <FaYoutube size={32} />
          </div>
          <div className="mb-6 flex w-1/4 justify-center">
            <FaPinterest size={32} />
          </div>
          <div className="mb-6 flex w-1/4 justify-center">
            <FaSpotify size={32} />
          </div>
          <div className="mb-6 flex w-1/4 justify-center">
            <FaLinkedin size={32} />
          </div>
        </div>
      </div>

      <div className="w-full bg-[#333] py-[36px] text-[#fff]">
        <div className="px-[24px]">
          <div className="flex flex-col items-center px-[20px] pt-[36px]">
            <div className="mb-[12px]">
              <a href="/">
                <div className="relative h-[40px] w-[140px]">
                  <Image
                    src={"/logo/logo_love_20250324_white.svg"}
                    alt={`logo love`}
                    fill
                    style={{
                      objectFit: "contain",
                    }}
                  />
                </div>
              </a>
            </div>

            <div className="flex flex-col items-center gap-[8px] text-center text-[12px]">
              <small className="">
                2025 Lovè. Todos os direitos reservados.
              </small>
              <small className="">
                Rua Benjamim Benchimol, 125 - Conjunto Petro - Manaus/AM
                <br />
                CEP: 69083-040
                <br />
                CNPJ: 42.609.440.0001-90
              </small>
              <small className="">
                <a className="" href="">
                  termos de uso
                </a>
                <a className="" href="">
                  política de privacidade
                </a>
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
