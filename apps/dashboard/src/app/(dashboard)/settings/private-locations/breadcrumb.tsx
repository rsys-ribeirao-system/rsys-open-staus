"use client";

import { Settings, Globe } from "@openstatus/icons";

import { NavBreadcrumb } from "@/components/nav/nav-breadcrumb";

export function Breadcrumb() {
  return (
    <NavBreadcrumb
      items={[
        {
          type: "link",
          label: "Configurações",
          icon: Settings,
          href: "/settings/general",
        },
        { type: "page", label: "Localizações privadas", icon: Globe },
      ]}
    />
  );
}
