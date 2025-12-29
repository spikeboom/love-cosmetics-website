import Link from "next/link";

export function ErrorState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
      <div className="max-w-md w-full text-center">
        <div className="w-24 h-24 mx-auto mb-6 bg-red-500 rounded-full flex items-center justify-center">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </div>
        <h1 className="font-cera-pro font-bold text-[28px] text-red-600 mb-4">
          Algo deu errado
        </h1>
        <p className="font-cera-pro text-[16px] text-[#333333] mb-8">
          Nao conseguimos encontrar seu pedido. Por favor, entre em contato com nosso suporte.
        </p>
        <Link
          href="/figma"
          className="inline-block w-full h-[60px] bg-[#254333] rounded-[8px] flex items-center justify-center hover:bg-[#1a2e24] transition-colors"
        >
          <span className="font-cera-pro font-bold text-[20px] text-white">
            Voltar para a loja
          </span>
        </Link>
      </div>
    </div>
  );
}
