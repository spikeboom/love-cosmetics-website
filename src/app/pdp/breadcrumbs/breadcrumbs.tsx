export function Breadcrumbs() {
  return (
    <div className="px-[18px] pb-[4px] pt-[16px] text-[14px] lowercase text-[#828282]">
      <section className="">
        <nav className="">
          <ol className="flex gap-2">
            <li className="">
              <a href="/pdp" className="underline" rel="home" title="Love">
                início
              </a>
            </li>

            <li className="">/</li>

            <li className="">
              <span className="font-bold">hidratante facial</span>
            </li>
          </ol>
        </nav>
      </section>
    </div>
  );
}
