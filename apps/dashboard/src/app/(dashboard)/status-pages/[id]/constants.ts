import type { IconType } from "@openstatus/icons";
import {
  Settings,
  Maintenance,
  Components,
  Report,
  Team,
} from "@openstatus/icons";

export const STATUS_PAGE_TABS: {
  value: string;
  label: string;
  icon: IconType;
}[] = [
  { value: "status-reports", label: "Relatórios de status", icon: Report },
  { value: "maintenances", label: "Manutenções", icon: Maintenance },
  { value: "subscribers", label: "Assinantes", icon: Team },
  { value: "components", label: "Componentes", icon: Components },
  // TODO: hidden in the tabs but still accessible via direct link - can be enabled in the future
  // { value: "history", label: "History", icon: CalendarDays },
  { value: "edit", label: "Configurações", icon: Settings },
];
