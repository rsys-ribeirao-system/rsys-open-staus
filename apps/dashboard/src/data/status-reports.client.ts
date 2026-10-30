import { Settings, Show, Add, Delete } from "@openstatus/icons";

export const actions = [
  {
    id: "edit",
    label: "Configurações",
    icon: Settings,
    variant: "default" as const,
  },
  {
    id: "create-update",
    label: "Criar atualização",
    icon: Add,
    variant: "default" as const,
  },
  {
    id: "view-report",
    label: "Ver relatório",
    icon: Show,
    variant: "default" as const,
  },
  {
    id: "delete",
    label: "Excluir",
    icon: Delete,
    variant: "destructive" as const,
  },
] as const;

export type StatusReportUpdateAction = (typeof actions)[number];

export const getActions = (
  props: Partial<
    Record<StatusReportUpdateAction["id"], () => Promise<void> | void>
  >,
): (StatusReportUpdateAction & { onClick?: () => Promise<void> | void })[] => {
  return actions.map((action) => ({
    ...action,
    onClick: props[action.id as keyof typeof props],
  }));
};
