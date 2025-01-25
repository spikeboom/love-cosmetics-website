import { fetchProdutosForHome } from "@/modules/produto/domain";
import Link from "next/link";

type Produto = {
  slug: string;
  // Add other properties of Produto as needed
};

export default async function Home() {
  const { data } = await fetchProdutosForHome();

  return (
    <div className="grid min-h-screen grid-rows-[20px_1fr_20px] items-center justify-items-center gap-16 p-8 pb-20 font-[family-name:var(--font-geist-sans)] sm:p-20">
      <main className="row-start-2 flex flex-col items-center gap-8 sm:items-start">
        {data?.map((item: Produto) => (
          <Link href={`/pdp/${item?.slug}`} key={item?.slug} className="">
            {item?.slug}
          </Link>
        ))}
      </main>
    </div>
  );
}
