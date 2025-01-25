export const fetchProdutos = async ({
  slug,
}: {
  slug: string;
}): Promise<any> => {
  const baseURL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";
  const endpoint = `${baseURL}/api/produtos?filters[slug][$eq]=${slug}&populate=*`;

  const response = await fetch(endpoint, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}`,
    },
    cache: "no-store", // Ajuste conforme necessário: "no-store" para evitar cache em SSR
  });

  if (!response.ok) {
    throw new Error("Failed to fetch produtos");
  }

  return response.json();
};
