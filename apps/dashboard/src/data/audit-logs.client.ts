import type { PrivateLocation } from "@openstatus/db/src/schema";
import { Alert, Success, Failed, Send, Incident } from "@openstatus/icons";
import { getRegionInfo } from "@openstatus/regions";

import { formatMilliseconds } from "@/lib/formatter";

export const config = {
  "incident.created": {
    icon: Incident,
    color: "text-destructive",
    title: "Incidente criado",
  },
  "incident.resolved": {
    icon: Success,
    color: "text-success",
    title: "Incidente resolvido",
  },
  "monitor.failed": {
    icon: Failed,
    color: "text-destructive",
    title: "Monitor falhou",
  },
  "notification.sent": {
    icon: Send,
    color: "text-info",
    title: "Notificação enviada",
  },
  "monitor.recovered": {
    icon: Success,
    color: "text-success",
    title: "Monitor recuperado",
  },
  "monitor.degraded": {
    icon: Alert,
    color: "text-warning",
    title: "Monitor degradado",
  },
} as const;

export const getMetadata = (privateLocations?: PrivateLocation[]) => {
  return {
    region: {
      label: "Região",
      key: "region",
      unit: undefined,
      visible: () => true,
      format: (value) => {
        const regionInfo = getRegionInfo(`${value}`, {
          location: privateLocations?.find(
            (location) => String(location.id) === String(value),
          )?.name,
        });
        return `${regionInfo.location} (${regionInfo.provider})`;
      },
    },
    cronTimestamp: {
      label: "Data/hora",
      key: "timestamp",
      unit: undefined,
      visible: () => false,
      format: (value) => String(value),
    },
    statusCode: {
      label: "Código de status",
      key: "status",
      unit: undefined,
      visible: (_value) => typeof _value === "number" && _value !== -1,
      format: (value) => String(value),
    },
    latency: {
      label: "Latência",
      key: "latency",
      unit: "ms",
      visible: () => true,
      format: (value) => formatMilliseconds(Number(value)),
    },
    provider: {
      label: "Provedor",
      key: "provider",
      unit: undefined,
      visible: () => true,
      format: (value) => String(value),
    },
  } as const satisfies Record<
    string,
    {
      label: string;
      key: string;
      unit?: string | undefined;
      visible: (value: string | number) => boolean;
      format: (value: string | number) => string;
    }
  >;
};
