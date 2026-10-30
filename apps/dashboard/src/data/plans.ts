import { allPlans } from "@openstatus/db/src/schema/plan/config";
import type { Limits } from "@openstatus/db/src/schema/plan/schema";
import type React from "react";

export const plans = allPlans;

export const config: Record<
  string,
  {
    label: string;
    features: {
      value: keyof Limits;
      label: string;
      description?: React.ReactNode; // tooltip informations
      badge?: string;
      monthly?: boolean;
    }[];
  }
> = {
  "status-pages": {
    label: "Páginas de status",
    features: [
      {
        value: "status-pages",
        label: "Número de páginas de status",
      },
      {
        value: "page-components",
        label: "Número de componentes",
      },
      {
        value: "maintenance",
        label: "Status de manutenção",
      },
      {
        value: "slack-agent",
        label: "Agente do Slack",
      },
      {
        value: "monitor-values-visibility",
        label: "Alternar visibilidade dos números",
      },
      // {
      //   value: "uptime-history",
      //   label: "Uptime history (24 months)",
      // },
      {
        value: "status-subscribers",
        label: "Assinantes",
      },
      {
        value: "custom-domain",
        label: "Domínio personalizado",
      },
      {
        value: "white-label",
        label: "White label",
      },
      {
        value: "custom-theme",
        label: "Tema personalizado",
      },
    ],
  },
  "status-page-audience": {
    label: "Público da página de status",
    features: [
      {
        value: "password-protection",
        label: "Proteção por senha (básica)",
      },
      {
        value: "email-domain-protection",
        label: "Link mágico (autenticação)",
      },
      {
        value: "ip-restriction",
        label: "Restrição por IP",
      },
    ],
  },
  monitors: {
    label: "Monitores",
    features: [
      {
        value: "periodicity",
        label: "Frequência",
      },
      {
        value: "monitors",
        label: "Número de monitores",
      },
      {
        value: "multi-region",
        label: "Monitoramento multirregião",
      },
      { value: "regions", label: "Total de regiões" },
      { value: "max-regions", label: "Regiões por monitor" },
      { value: "data-retention", label: "Retenção de dados" },
      { value: "response-logs", label: "Logs de resposta" },
      { value: "otel", label: "Exportador OTel" },
      {
        value: "synthetic-checks",
        label: "Verificações sintéticas de API",
        monthly: true,
      },
    ],
  },
  notifications: {
    label: "Notificações",
    features: [
      {
        value: "notifications",
        label: "Slack, Discord, Email, Webhook, ntfy.sh",
      },
      {
        value: "sms",
        label: "SMS",
      },
      {
        value: "pagerduty",
        label: "PagerDuty",
      },
      {
        value: "opsgenie",
        label: "OpsGenie",
      },
      {
        value: "grafana-oncall",
        label: "Grafana OnCall",
      },
      {
        value: "whatsapp",
        label: "WhatsApp",
      },
      {
        value: "notification-channels",
        label: "Número de canais de notificação",
      },
    ],
  },
  collaboration: {
    label: "Colaboração",
    features: [
      {
        value: "members",
        label: "Membros da equipe",
      },
      {
        value: "audit-log",
        label: "Log de auditoria",
      },
      {
        value: "sso",
        label: "Single sign-on SAML",
      },
    ],
  },
};
