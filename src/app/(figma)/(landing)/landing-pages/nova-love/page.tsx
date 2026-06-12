import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import CoCriacaoLandingClient from "../CoCriacaoLandingClient";
import { landingVariants } from "../content";
import {
  buildFormQueryString,
  buildLandingSiteProperties,
  buildLandingUtmProperties,
  LANDING_EXPERIMENT_COOKIE_NAME,
  LANDING_EXPERIMENT_ROUTE,
  landingExperimentProposalByVariant,
  createLandingVisitorId,
} from "@/lib/posthog/landing-experiment";
import {
  captureLandingEvent,
  getLandingExperimentAssignment,
} from "@/lib/posthog/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Nova Lovè | Love Cosméticos da Amazônia",
  description:
    "Participe da pesquisa de co-criação da Nova Lovè e ajude a construir a próxima geração de cosméticos da Amazônia.",
  openGraph: {
    title: "Nova Lovè",
    description:
      "Participe da pesquisa de co-criação da Nova Lovè e ajude a construir a próxima geração de cosméticos da Amazônia.",
    type: "website",
  },
};

type NovaLovePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function NovaLovePage({ searchParams }: NovaLovePageProps) {
  const params = await searchParams;
  const requestHeaders = await headers();
  const cookieStore = await cookies();
  const siteProperties = buildLandingSiteProperties({
    host:
      requestHeaders.get("x-forwarded-host") || requestHeaders.get("host"),
    protocol: requestHeaders.get("x-forwarded-proto"),
  });
  const distinctId =
    requestHeaders.get("x-nl-variant-user-id") ||
    cookieStore.get(LANDING_EXPERIMENT_COOKIE_NAME)?.value ||
    createLandingVisitorId();

  const utmProperties = buildLandingUtmProperties(params);
  const assignment = await getLandingExperimentAssignment(distinctId, {
    pathname: LANDING_EXPERIMENT_ROUTE,
    ...utmProperties,
  });
  const variant = landingVariants[assignment.variant];

  await captureLandingEvent({
    distinctId,
    event: "landing_viewed",
    flags: assignment.flags?.onlyAccessed(),
    properties: {
      variant: assignment.variant,
      proposal: landingExperimentProposalByVariant[assignment.variant],
      assignment_source: assignment.source,
      pathname: LANDING_EXPERIMENT_ROUTE,
      ...siteProperties,
      ...utmProperties,
    },
  });

  return (
    <CoCriacaoLandingClient
      variant={variant}
      formQueryString={buildFormQueryString(
        params,
        assignment.variant,
        distinctId,
      )}
      trackingContext={{
        assignmentSource: assignment.source,
        distinctId,
        pathname: LANDING_EXPERIMENT_ROUTE,
        siteProperties,
      }}
    />
  );
}
