"use server";

export const fetchProdutoBySlug = async ({
  slug,
}: {
  slug: string;
}): Promise<any> => {
  const baseURL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";
  const endpoint = `${baseURL}/api/produtos?filters[slug][$eq]=${slug}&populate[0]=breadcrumbItems&populate[1]=carouselImagensPrincipal.imagem&populate[2]=listaDescricao&populate[3]=o_que_ele_tem&populate[4]=como_usar_essa_formula&populate[5]=duvidas&populate[6]=resultados.itens_resultado&populate[7]=detalhe_notas&populate[8]=avaliacoes`;

  const response = await fetch(endpoint, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}`,
    },
    cache: "no-store", // Ajuste conforme necessário: "no-store" para evitar cache em SSR
  });

  if (!response.ok) {
    throw new Error("Failed to fetch produto by slug");
  }

  return response.json();
};

export const fetchProdutosForHome = async (): Promise<any> => {
  const baseURL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";
  const endpoint = `${baseURL}/api/produtos?populate[0]=breadcrumbItems&populate[1]=carouselImagensPrincipal.imagem&populate[2]=listaDescricao&populate[3]=o_que_ele_tem&populate[4]=como_usar_essa_formula&populate[5]=duvidas&populate[6]=resultados.itens_resultado&populate[7]=detalhe_notas&populate[8]=avaliacoes`;

  const response = await fetch(endpoint, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}`,
    },
    cache: "no-store", // Ajuste conforme necessário: "no-store" para evitar cache em SSR
  });

  if (!response.ok) {
    // logue o por que do erro
    console.error("Failed to fetch produtos for home", response);
    throw new Error("Failed to fetch produtos for home");
  }

  return response.json();
};

export const fetchProdutosForHome_Kit = async (): Promise<any> => {
  const baseURL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";
  const endpoint = `${baseURL}/api/produtos?populate[0]=breadcrumbItems&populate[1]=carouselImagensPrincipal.imagem&populate[2]=listaDescricao&populate[3]=o_que_ele_tem&populate[4]=como_usar_essa_formula&populate[5]=duvidas&populate[6]=resultados.itens_resultado&populate[7]=detalhe_notas&populate[8]=avaliacoes&filters[nome][$containsi]=Kit`;

  const response = await fetch(endpoint, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}`,
    },
    cache: "no-store", // Ajuste conforme necessário: "no-store" para evitar cache em SSR
  });

  if (!response.ok) {
    // logue o por que do erro
    console.error("Failed to fetch produtos for home", response);
    throw new Error("Failed to fetch produtos for home");
  }

  return response.json();
};

export const fetchProdutosForHome_NotKit = async (): Promise<any> => {
  const baseURL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";
  const endpoint = `${baseURL}/api/produtos?populate[0]=breadcrumbItems&populate[1]=carouselImagensPrincipal.imagem&populate[2]=listaDescricao&populate[3]=o_que_ele_tem&populate[4]=como_usar_essa_formula&populate[5]=duvidas&populate[6]=resultados.itens_resultado&populate[7]=detalhe_notas&populate[8]=avaliacoes&filters[nome][$notContainsi]=Kit`;

  const response = await fetch(endpoint, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}`,
    },
    cache: "no-store", // Ajuste conforme necessário: "no-store" para evitar cache em SSR
  });

  if (!response.ok) {
    // logue o por que do erro
    console.error("Failed to fetch produtos for home", response);
    throw new Error("Failed to fetch produtos for home");
  }

  return response.json();
};

export const fetchProdutosForCarouselPDP = async (): Promise<any> => {
  const baseURL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";
  const endpoint = `${baseURL}/api/produtos?populate[0]=breadcrumbItems&populate[1]=carouselImagensPrincipal.imagem&populate[2]=listaDescricao&populate[3]=o_que_ele_tem&populate[4]=como_usar_essa_formula&populate[5]=duvidas&populate[6]=resultados.itens_resultado&populate[7]=detalhe_notas&populate[8]=avaliacoes`;

  const response = await fetch(endpoint, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}`,
    },
    cache: "no-store", // Ajuste conforme necessário: "no-store" para evitar cache em SSR
  });

  if (!response.ok) {
    // logue o por que do erro
    console.error("Failed to fetch produtos for home", response);
    throw new Error("Failed to fetch produtos for home");
  }

  return response.json();
};
