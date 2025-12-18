import Link from "next/link";

export const metadata = {
  title: "Lové Cosméticos - Figma Designs",
  description: "Navegação das páginas de design do projeto Figma",
};

export default function FigmaIndexPage() {
  const pages = [
    {
      title: "Design",
      href: "/figma/design",
      description: "Página de design principal",
    },
    {
      title: "Produto (PDP)",
      href: "/figma/product",
      description: "Página de detalhes do produto",
    },
    {
      title: "Busca",
      href: "/figma/search",
      description: "Página de busca e navegação por categorias",
    },
    {
      title: "Grupo VIP",
      href: "/figma/vip",
      description: "Landing page do Grupo VIP WhatsApp",
    },
  ];

  return (
    <main className="min-h-screen bg-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="font-cera-pro font-bold text-4xl mb-2 text-black">
          Páginas Figma
        </h1>
        <p className="text-gray-600 mb-8">
          Navegue entre todas as páginas desenvolvidas com base no design do
          Figma
        </p>

        <div className="grid gap-4">
          {pages.map((page) => (
            <Link
              key={page.href}
              href={page.href}
              className="block p-6 border border-[#d2d2d2] rounded-lg hover:border-[#254333] hover:bg-[#f8f3ed] transition-all"
            >
              <h2 className="font-cera-pro font-bold text-xl text-black mb-2">
                {page.title}
              </h2>
              <p className="text-gray-600 text-sm">{page.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
