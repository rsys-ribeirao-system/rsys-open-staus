import type { IconType } from "@openstatus/icons";
import { Settings, Overview, Logs, Incident } from "@openstatus/icons";

export const MONITOR_TABS: {
  value: string;
  label: string;
  icon: IconType;
}[] = [
  { value: "overview", label: "Visão geral", icon: Overview },
  { value: "logs", label: "Logs", icon: Logs },
  { value: "incidents", label: "Incidentes", icon: Incident },
  { value: "edit", label: "Configurações", icon: Settings },
];
