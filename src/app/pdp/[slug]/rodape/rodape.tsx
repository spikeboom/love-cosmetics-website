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
            <small className="">
              2024 Sallve. Todos os direitos reservados.
            </small>
            <small className="">
              Rua Cônego Eugênio Leite, 767 - São Paulo/SP - CEP: 05414-012.
              CNPJ: 32.124.385/0001-95
            </small>
            <small className="">
              <a className="" href="https://www.sallve.com.br/pages/termos">
                termos de uso
              </a>
              <a
                className=""
                href="https://www.sallve.com.br/pages/privacidade"
              >
                política de privacidade
              </a>
            </small>
          </div>
        </div>
      </div>
    </div>
  );
}
