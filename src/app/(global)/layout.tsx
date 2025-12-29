import { Cabecalho } from "@/deprecated/components/layout/Header/cabecalho";
import { Rodape } from "@/deprecated/components/layout/Footer/rodape";
import { ModalMenu } from "@/deprecated/components/layout/Menu/menu";
import { FloatingWhatsApp } from "@/deprecated/components/common/FloatingWhatsApp/FloatingWhatsApp";
import { ModalCart } from "@/deprecated/components/cart/ModalCart/modal-cart";

export default function GlobalLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Cabecalho />

      {children}

      <Rodape />

      <div className="h-[100px] bg-[#333]"></div>

      <ModalMenu />
      
      <ModalCart />

      <FloatingWhatsApp />
    </>
  );
}
