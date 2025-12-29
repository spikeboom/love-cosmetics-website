"use client";

import { Divider } from "@mui/material";
import Image from "next/image";
import Link from "next/link";
import {
  FaFacebook,
  FaInstagram,
  FaLinkedin,
  FaPinterest,
  FaSpotify,
  FaTiktok,
  FaWhatsapp,
  FaXTwitter,
  FaYoutube,
} from "react-icons/fa6";

export function Rodape() {
  return (
    <div className="flex w-full flex-col items-center">
      <div className="flex w-full flex-col items-center justify-center md:flex-row md:gap-[16px]">
        <div className="flex w-full max-w-[400px] flex-col items-center">
          <div className="relative h-[140px] w-full max-w-[400px] md:mb-[32px]">
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

        <div className="w-full md:hidden">
          <Divider
            variant="middle"
            component="div"
            style={{
              marginTop: "16px",
              marginBottom: "32px",
            }}
          />
        </div>

        <div className="my-[32px] mb-[42px] ml-[-24px] mr-[8px] hidden h-[170px] md:block">
          <Divider
            variant="middle"
            component="div"
            orientation="vertical"
            className="h-full"
          />
        </div>

        <div className="mb-[32px] flex w-full max-w-[300px] flex-wrap md:mb-0">
          <Link
            href="https://www.facebook.com/share/15wd5HjTTF/?mibextid=wwXIfr"
            target="_blank"
            className="mb-6 flex w-1/4 justify-center"
          >
            <FaFacebook size={32} />
          </Link>
          <Link
            href="https://www.instagram.com/cosmeticoslove_?igsh=MTVjejYzZ2J1MHVpbg=="
            target="_blank"
            className="mb-6 flex w-1/4 justify-center"
          >
            <FaInstagram size={32} />
          </Link>
          <Link
            href="https://wa.me/message/JPCGPYCZS7ENN1"
            target="_blank"
            className="mb-6 flex w-1/4 justify-center"
          >
            <FaWhatsapp size={32} />
          </Link>
          <Link
            href="https://www.tiktok.com/@lov.cosmticos?_t=ZM-8v65G7Hjo86&_r=1"
            target="_blank"
            className="mb-6 flex w-1/4 justify-center"
          >
            <FaTiktok size={32} />
          </Link>
          {/* <div className="mb-6 flex w-1/4 justify-center">
            <FaYoutube size={32} className="opacity-[0.5]" />
          </div>
          <div className="mb-6 flex w-1/4 justify-center">
            <FaSpotify size={32} className="opacity-[0.5]" />
          </div>
          <div className="mb-6 flex w-1/4 justify-center">
            <FaLinkedin size={32} className="opacity-[0.5]" />
          </div>
          <div className="mb-6 flex w-1/4 justify-center">
            <FaXTwitter size={32} className="opacity-[0.5]" />
          </div> */}
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
