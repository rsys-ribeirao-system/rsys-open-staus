import type {
  AgentToolInput,
  AgentToolOutput,
} from "@openstatus/services/agent-tools";

import { TableCellBoolean } from "@/components/data-table/table-cell-boolean";
import { TableCellNumber } from "@/components/data-table/table-cell-number";
import { TableCellText } from "@/components/data-table/table-cell-text";

import type {
  DetailsRow,
  DetailsSection,
  DetailsTableData,
} from "./details-table";

type Input = AgentToolInput<"get_monitor">;
type Output = AgentToolOutput<"get_monitor">;

export function getMonitorDetails(
  _input: Input,
  output: Output,
): DetailsTableData {
  const identity: DetailsRow[] = [
    { label: "ID", value: <TableCellNumber value={output.id} /> },
    { label: "Nome", value: <TableCellText value={output.name} /> },
    { label: "URL", value: <TableCellText value={output.url} /> },
    {
      label: "Tipo",
      value: <TableCellText value={output.jobType.toUpperCase()} />,
    },
  ];
  if (output.method) {
    identity.push({
      label: "Método",
      value: <TableCellText value={output.method} />,
    });
  }
  identity.push({
    label: "Ativo",
    value: <TableCellBoolean value={output.active} />,
  });

  const behavior: DetailsRow[] = [
    {
      label: "Frequência",
      value: <TableCellText value={output.periodicity} />,
    },
    {
      label: "Regiões",
      value: <TableCellText value={output.regions.join(", ")} />,
    },
    {
      label: "Timeout",
      value: <TableCellNumber value={output.timeout} unit="ms" />,
    },
  ];
  if (output.degradedAfter !== null) {
    behavior.push({
      label: "Degradado após",
      value: <TableCellNumber value={output.degradedAfter} unit="ms" />,
    });
  }
  behavior.push(
    {
      label: "Novas tentativas",
      value: <TableCellNumber value={output.retry} />,
    },
    {
      label: "Seguir redirecionamentos",
      value: <TableCellBoolean value={output.followRedirects} />,
    },
  );

  const visibility: DetailsRow[] = [
    { label: "Público", value: <TableCellBoolean value={output.public} /> },
    {
      label: "Tags",
      value: (
        <TableCellText value={output.tags.map((t) => t.name).join(", ")} />
      ),
    },
    {
      label: "Notificações",
      value: (
        <TableCellText
          value={output.notifications
            .map((n) => `${n.name} (${n.provider})`)
            .join(", ")}
        />
      ),
    },
  ];

  const sections: DetailsSection[] = [
    { title: "Monitor", rows: identity },
    { title: "Comportamento", rows: behavior },
    { title: "Visibilidade", rows: visibility },
  ];
  if (output.privateLocationIds.length > 0) {
    sections.push({
      title: "Localizações privadas",
      rows: [
        {
          label: "IDs",
          value: <TableCellText value={output.privateLocationIds.join(", ")} />,
        },
      ],
    });
  }
  return { sections };
}
