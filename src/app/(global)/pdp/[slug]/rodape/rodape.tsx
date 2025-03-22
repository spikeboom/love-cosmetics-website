export function Rodape() {
  return (
    <div className="w-full bg-[#333] py-[36px] text-[#fff]">
      <div className="px-[24px]">
        <div className="flex flex-col items-center px-[20px] pt-[36px]">
          <div className="mb-[12px]">
            <a href="/" className="font-playfair text-[32px]">
              LOVÉ
            </a>
          </div>

          <div className="flex flex-col items-center gap-[8px] text-center text-[12px]">
            <small className="">2025 Lovè. Todos os direitos reservados.</small>
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
  );
}
