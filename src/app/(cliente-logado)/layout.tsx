import { Cabecalho } from "@/components/layout/Header/cabecalho";
import { Rodape } from "@/components/layout/Footer/rodape";
import { ModalMenu } from "@/components/layout/Menu/menu";
import { FloatingWhatsApp } from "@/components/common/FloatingWhatsApp/FloatingWhatsApp";
import { ModalCart } from "@/components/cart/ModalCart/modal-cart";

export default function ClienteLogadoLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Cabecalho />

      <div className="">{children}</div>

      <Rodape />

      <div className="h-[100px] bg-[#333]"></div>

      <ModalMenu />

      <ModalCart />

      <FloatingWhatsApp />
    </>
  );
}
