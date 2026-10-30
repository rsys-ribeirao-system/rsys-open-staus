"use client";

import { ExternalLink } from "@openstatus/icons";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@openstatus/ui/components/ui/tooltip";
import { useCopyToClipboard } from "@openstatus/ui/hooks/use-copy-to-clipboard";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

import { Link } from "@/components/common/link";
import { TableCellLink } from "@/components/data-table/table-cell-link";
import { SidebarRight } from "@/components/nav/sidebar-right";
import { useTRPC } from "@/lib/trpc/client";

export function Sidebar() {
  const { id } = useParams<{ id: string }>();
  const trpc = useTRPC();
  const { data: statusPage } = useQuery(
    trpc.page.get.queryOptions({ id: Number.parseInt(id) }),
  );
  const { copy } = useCopyToClipboard();

  if (!statusPage) return null;

  const BADGE_URL = `https://${
    statusPage.customDomain || `${statusPage.slug}.openstatus.dev`
  }/badge/v2`;

  return (
    <SidebarRight
      header="Página de status"
      metadata={[
        {
          label: "Visão geral",
          items: [
            {
              label: "Slug",
              value: (
                <Link
                  href={`https://${
                    statusPage.customDomain ||
                    `${statusPage.slug}.openstatus.dev`
                  }`}
                  target="_blank"
                >
                  {statusPage.slug}
                </Link>
              ),
            },
            {
              label: "Tipo de acesso",
              value: statusPage.accessType,
            },
            { label: "Domínio", value: statusPage.customDomain || "-" },
            {
              label: "Favicon",
              value: statusPage.icon ? (
                <div className="bg-muted size-4 overflow-hidden rounded border">
                  <img src={statusPage.icon} alt="favicon" />
                </div>
              ) : (
                "-"
              ),
            },
            {
              label: "Badge",
              value: (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger className="align-middle">
                      <img
                        className="h-5 rounded-sm border"
                        src={BADGE_URL}
                        alt="badge"
                      />
                    </TooltipTrigger>
                    <TooltipContent
                      className="cursor-pointer"
                      side="left"
                      onClick={() => copy(BADGE_URL, { withToast: true })}
                    >
                      {BADGE_URL}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ),
            },
          ],
        },
        {
          label: "Configuração",
          items: [
            {
              label: "Tema",
              value: statusPage.configuration?.theme ?? "-",
            },
            {
              label: "Valor da barra",
              value: statusPage.configuration?.type ?? "-",
            },
            {
              label: "Valor do card",
              value: statusPage.configuration?.value ?? "-",
            },
            {
              label: "Mostrar disponibilidade",
              value: statusPage.configuration?.uptime ? "Sim" : "Não",
            },
          ],
        },
        {
          label: "Monitores",
          emptyMessage: "Nenhum monitor vinculado",
          items: statusPage.pageComponents.flatMap((component) => {
            const arr = [];
            arr.push({
              label: "Nome",
              value: (
                <TableCellLink
                  href={`/status-pages/${statusPage.id}/components`}
                  value={component.name}
                />
              ),
            });
            arr.push({
              label: "Tipo",
              value: component.type,
              isNested: true,
            });
            return arr;
          }),
        },
      ]}
      footerButton={{
        onClick: () =>
          typeof window !== "undefined" &&
          window.open(
            `https://${
              statusPage.customDomain || `${statusPage.slug}.openstatus.dev`
            }`,
            "_blank",
          ),
        children: (
          <>
            <ExternalLink />
            <span>Visitar página de status</span>
          </>
        ),
      }}
    />
  );
}
