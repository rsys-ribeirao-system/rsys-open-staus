import type { Metadata } from "next";

export const TITLE = "openstatus";
export const DESCRIPTION =
  "Plataforma open source para monitorar seus serviços e manter seus usuários informados.";

const OG_TITLE = "openstatus";
const OG_DESCRIPTION =
  "Monitore seus serviços e mantenha seus usuários informados.";
const FOOTER = "app.openstatus.dev";
const IMAGE = "assets/og/dashboard-v2.png";

export const defaultMetadata: Metadata = {
  title: {
    template: `%s | ${TITLE}`,
    default: TITLE,
  },
  description: DESCRIPTION,
  metadataBase: new URL("https://www.openstatus.dev"),
  robots: {
    index: false,
    follow: false,
  },
};

export const twitterMetadata: Metadata["twitter"] = {
  title: TITLE,
  description: DESCRIPTION,
  card: "summary_large_image",
  images: [
    `/api/og?title=${OG_TITLE}&description=${OG_DESCRIPTION}&footer=${FOOTER}&image=${IMAGE}`,
  ],
};

export const ogMetadata: Metadata["openGraph"] = {
  title: TITLE,
  description: DESCRIPTION,
  type: "website",
  images: [
    `/api/og?title=${OG_TITLE}&description=${OG_DESCRIPTION}&footer=${FOOTER}&image=${IMAGE}`,
  ],
};
