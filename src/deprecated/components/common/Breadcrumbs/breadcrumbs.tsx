export function Breadcrumbs({
  items,
}: {
  items: { id: number; nome: string; link: string }[];
}) {
  return (
    <div className="px-[18px] pb-[4px] pt-[16px] text-[14px] text-[#828282]">
      <section className="">
        <nav className="">
          <ol className="flex gap-2">
            <li className="">
              <a href="/" className="underline" rel="home" title="Love">
                Início
              </a>
            </li>

            {items?.map((item) => (
              <div key={item.id} className="flex gap-2">
                <li className="">/</li>

                <li className="">
                  <span className="font-bold">{item?.nome}</span>
                </li>
              </div>
            ))}
          </ol>
        </nav>
      </section>
    </div>
  );
}
