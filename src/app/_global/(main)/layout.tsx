export default function GlobalLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="mx-auto w-full max-w-[1400px]">{children}</div>;
}
