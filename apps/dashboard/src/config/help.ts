import { Api, Docs, Schedule, Support } from "@openstatus/icons";
import { DiscordIcon, GitHubIcon } from "@openstatus/icons/brand";
import type * as React from "react";

// Nucleo/lucide icons and the custom brand icons both accept svg props.
export type HelpIcon = React.ComponentType<React.ComponentProps<"svg">>;

// Single source of truth for the Get Help menu (sidebar nav-help) and the
// command-menu "Get Help" group so their icons stay in sync.
export const HELP_SUPPORT = {
  label: "Suporte",
  icon: Support as HelpIcon,
  keywords: ["feedback", "help", "contact"],
};

export type HelpLink = {
  label: string;
  href: string;
  icon: HelpIcon;
  keywords?: string[];
};

export const HELP_LINKS = [
  {
    label: "Documentação",
    href: "https://www.openstatus.dev/docs",
    icon: Docs,
    keywords: ["documentation"],
  },
  {
    label: "Referência da API",
    href: "https://api.openstatus.dev/openapi",
    icon: Api,
    keywords: ["openapi", "swagger"],
  },
  {
    label: "Agendar uma chamada",
    href: "https://openstatus.dev/cal",
    icon: Schedule,
    keywords: ["demo", "meeting"],
  },
  {
    label: "Comunidade",
    href: "https://openstatus.dev/discord",
    icon: DiscordIcon,
    keywords: ["discord", "chat"],
  },
  {
    label: "GitHub",
    href: "https://openstatus.dev/github",
    icon: GitHubIcon,
    keywords: ["source", "repo", "issues"],
  },
] satisfies HelpLink[];
