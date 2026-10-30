import type { AgentToolOutput } from "@openstatus/services/agent-tools";

import { TableCellBoolean } from "@/components/data-table/table-cell-boolean";
import { TableCellLink } from "@/components/data-table/table-cell-link";
import { TableCellNumber } from "@/components/data-table/table-cell-number";
import { TableCellText } from "@/components/data-table/table-cell-text";

import type { ResultTableData } from "./result-table";

type Output = AgentToolOutput<"list_monitors">;

export function listMonitorsTable(
  output: Output,
): ResultTableData<
  "name" | "jobType" | "periodicity" | "regions" | "active" | "id"
> {
  const items = output?.items ?? [];
  return {
    empty: "Nenhum monitor.",
    columns: [
      { key: "name", header: "Nome" },
      { key: "jobType", header: "Tipo" },
      { key: "periodicity", header: "Frequência" },
      { key: "regions", header: "Regiões" },
      { key: "active", header: "Ativo" },
      { key: "id", header: "ID" },
    ],
    rows: items.map((m) => ({
      id: m.id,
      cells: {
        name: (
          <TableCellLink href={`/monitors/${m.id}/overview`} value={m.name} />
        ),
        jobType: (
          <TableCellText
            value={m.jobType.toUpperCase()}
            className="text-muted-foreground font-mono"
          />
        ),
        periodicity: (
          <TableCellText
            value={m.periodicity}
            className="text-muted-foreground font-mono"
          />
        ),
        regions: (
          <TableCellText
            value={m.regions.join(", ") || "—"}
            className="text-muted-foreground font-mono"
          />
        ),
        active: <TableCellBoolean value={m.active} />,
        id: <TableCellNumber value={m.id} />,
      },
    })),
  };
}
