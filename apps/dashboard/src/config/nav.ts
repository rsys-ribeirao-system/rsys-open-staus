import {
  Agent,
  Chat,
  type IconType,
  Monitor,
  Notification,
  Overview,
  Settings,
  StatusPage,
  Terminal,
} from "@openstatus/icons";

export type NavItem = {
  label: string;
  href: string;
  icon: IconType;
  keywords?: string[];
};

// Single source of truth for primary destinations. Consumed by the sidebar
// (icon + href) and the command menu (icon + href + label + keywords), so an
// icon swap here propagates to both surfaces.
export const NAV = {
  overview: {
    label: "Visão geral",
    href: "/overview",
    icon: Overview,
    keywords: ["home", "dashboard"],
  },
  monitors: {
    label: "Monitores",
    href: "/monitors",
    icon: Monitor,
    keywords: ["checks", "uptime"],
  },
  statusPages: {
    label: "Páginas de status",
    href: "/status-pages",
    icon: StatusPage,
    keywords: ["pages"],
  },
  notifications: {
    label: "Notificações",
    href: "/notifications",
    icon: Notification,
    keywords: ["notifiers", "alerts", "channels"],
  },
  chat: {
    label: "Chat",
    href: "/chat",
    icon: Chat,
    keywords: ["assistant", "ai"],
  },
  agents: {
    label: "Agentes",
    href: "/agents",
    icon: Agent,
    keywords: ["slack"],
  },
  cli: {
    label: "CLI",
    href: "/cli",
    icon: Terminal,
    keywords: ["terminal"],
  },
  settings: {
    label: "Configurações",
    href: "/settings/general",
    icon: Settings,
    keywords: ["workspace"],
  },
} satisfies Record<string, NavItem>;

// Command-menu "Navigation" group order.
export const NAV_MENU_ITEMS: NavItem[] = [
  NAV.overview,
  NAV.monitors,
  NAV.statusPages,
  NAV.notifications,
  NAV.chat,
  NAV.agents,
  NAV.cli,
];
