import { ClearCart } from "@/deprecated/components/cart/CleanCart/clean-cart";
import Link from "next/link";

export const metadata = {
  title: "Lové Cosméticos - Confirmação",
};

export default async function ConfirmacaoPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="mb-6 text-center text-4xl font-extrabold">
        Compra realizada com sucesso!
      </h1>
      <p className="mb-4 text-center text-lg">
        Obrigado por comprar conosco. Seu pedido foi processado com sucesso e
        será enviado em breve.
      </p>
      <p className="mb-8 text-center text-lg">
        Entraremos em contato por whatsapp para confirmar o pedido e o endereço
        de entrega.
      </p>
      <Link
        href="/"
        className="rounded bg-blue-500 px-6 py-3 text-white transition-colors hover:bg-blue-600"
      >
        Voltar para a loja
      </Link>

      <ClearCart />
    </div>
  );
}
