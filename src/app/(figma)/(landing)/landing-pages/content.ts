export type LandingVariantId = "lp1" | "lp2" | "lp3";

export interface LandingVariant {
  id: LandingVariantId;
  slug: string;
  label: string;
  headline: string;
  subheadline: string;
  heroImage: {
    desktop: string;
    mobile: string;
    alt: string;
  };
}

export const ctaLabel = "Quero participar da construção da Nova Lovè";

export const landingVariants: Record<LandingVariantId, LandingVariant> = {
  lp1: {
    id: "lp1",
    slug: "biotecnologia-amazonica",
    label: "Biotecnologia",
    headline: "Biotecnologia Amazônica de Alta Performance",
    subheadline: "Transformando a Amazônia em Ciência aplicada à pele.",
    heroImage: {
      desktop: "/landing-pages/hero/biotecnologia-amazonica-desktop.webp",
      mobile: "/landing-pages/hero/biotecnologia-amazonica-mobile.webp",
      alt: "Banner conceitual de biotecnologia amazônica aplicada ao skincare",
    },
  },
  lp2: {
    id: "lp2",
    slug: "poder-da-amazonia",
    label: "Amazônia",
    headline: "O Poder da Amazônia no seu Skincare Diário",
    subheadline:
      "Menos produtos, mais resultados: uma rotina essencial enriquecida pelos bioativos mais poderosos da Amazônia.",
    heroImage: {
      desktop: "/landing-pages/hero/poder-da-amazonia-desktop.webp",
      mobile: "/landing-pages/hero/poder-da-amazonia-mobile.webp",
      alt: "Banner conceitual de rotina de skincare com bioativos amazônicos",
    },
  },
  lp3: {
    id: "lp3",
    slug: "ciencia-da-amazonia",
    label: "Pesquisa",
    headline: "Ciência da Amazônia para a Sua Pele",
    subheadline:
      "O encontro entre pesquisa científica e biodiversidade amazônica para criar uma nova geração de skincare.",
    heroImage: {
      desktop: "/landing-pages/hero/ciencia-da-amazonia-desktop.webp",
      mobile: "/landing-pages/hero/ciencia-da-amazonia-mobile.webp",
      alt: "Banner conceitual de pesquisa científica amazônica para skincare",
    },
  },
};
