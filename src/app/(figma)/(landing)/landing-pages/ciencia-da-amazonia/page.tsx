import type { Metadata } from "next";
import CoCriacaoLandingClient from "../CoCriacaoLandingClient";
import { landingVariants } from "../content";

const variant = landingVariants.lp3;

export const metadata: Metadata = {
  title: `${variant.headline} | Nova Lovè`,
  description: variant.subheadline,
  openGraph: {
    title: variant.headline,
    description: variant.subheadline,
    type: "website",
  },
};

export default function CienciaDaAmazoniaPage() {
  return <CoCriacaoLandingClient variant={variant} />;
}
