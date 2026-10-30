"use client";

import { Monitor } from "@openstatus/icons";

import { NavBreadcrumb } from "@/components/nav/nav-breadcrumb";

export function Breadcrumb() {
  return (
    <NavBreadcrumb
      items={[
        {
          type: "link",
          label: "Monitores",
          href: "/monitors",
          icon: Monitor,
        },
        { type: "page", label: "Criar monitor" },
      ]}
    />
  );
}
