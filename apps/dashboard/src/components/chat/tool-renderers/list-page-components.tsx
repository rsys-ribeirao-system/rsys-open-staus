import type { AgentToolOutput } from "@openstatus/services/agent-tools";

import { TableCellLink } from "@/components/data-table/table-cell-link";
import { TableCellNumber } from "@/components/data-table/table-cell-number";
import { TableCellText } from "@/components/data-table/table-cell-text";

import type { ResultTableData } from "./result-table";

type Output = AgentToolOutput<"list_page_components">;

export function listPageComponentsTable(
  output: Output,
): ResultTableData<"name" | "type" | "page" | "monitor" | "id"> {
  const items = output?.items ?? [];
  return {
    empty: "Nenhum componente de página.",
    columns: [
      { key: "name", header: "Nome" },
      { key: "type", header: "Tipo" },
      { key: "page", header: "Página" },
      { key: "monitor", header: "Monitor" },
      { key: "id", header: "ID" },
    ],
    rows: items.map((c) => ({
      id: c.id,
      cells: {
        name: (
          <TableCellLink
            href={`/status-pages/${c.pageId}/components`}
            value={c.name}
          />
        ),
        type: (
          <TableCellText
            value={c.type}
            className="text-muted-foreground font-mono"
          />
        ),
        page: <TableCellNumber value={c.pageId} />,
        monitor:
          c.monitorId !== null ? (
            <TableCellNumber value={c.monitorId} />
          ) : (
            <TableCellText value={null} />
          ),
        id: <TableCellNumber value={c.id} />,
      },
    })),
  };
}
