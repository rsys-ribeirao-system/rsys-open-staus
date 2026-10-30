import type {
  AgentToolInput,
  AgentToolOutput,
} from "@openstatus/services/agent-tools";

import { TableCellDate } from "@/components/data-table/table-cell-date";
import { TableCellNumber } from "@/components/data-table/table-cell-number";
import { TableCellText } from "@/components/data-table/table-cell-text";

import type { DetailsTableData } from "./details-table";

type Input = AgentToolInput<"get_monitor_summary">;
type Output = AgentToolOutput<"get_monitor_summary">;

export function getMonitorSummaryDetails(
  input: Input,
  output: Output,
): DetailsTableData {
  const lastPingDate = output.lastPingAt ? new Date(output.lastPingAt) : null;
  return {
    sections: [
      {
        title: "Monitor",
        rows: [
          {
            label: "ID",
            value: <TableCellNumber value={output.monitorId} />,
          },
          { label: "Janela", value: <TableCellText value={input.timeRange} /> },
          {
            label: "Última verificação",
            value: <TableCellDate value={lastPingDate} />,
          },
        ],
      },
      {
        title: "Verificações",
        rows: [
          {
            label: "Sucesso",
            value: (
              <TableCellNumber
                value={output.totalSuccessful}
                className="text-success"
              />
            ),
          },
          {
            label: "Degradado",
            value: (
              <TableCellNumber
                value={output.totalDegraded}
                className="text-warning"
              />
            ),
          },
          {
            label: "Falha",
            value: (
              <TableCellNumber
                value={output.totalFailed}
                className="text-destructive"
              />
            ),
          },
        ],
      },
      {
        title: "Latência",
        rows: [
          {
            label: "p50",
            value: <TableCellNumber value={output.p50} unit="ms" />,
          },
          {
            label: "p75",
            value: <TableCellNumber value={output.p75} unit="ms" />,
          },
          {
            label: "p90",
            value: <TableCellNumber value={output.p90} unit="ms" />,
          },
          {
            label: "p95",
            value: <TableCellNumber value={output.p95} unit="ms" />,
          },
          {
            label: "p99",
            value: <TableCellNumber value={output.p99} unit="ms" />,
          },
        ],
      },
    ],
  };
}
