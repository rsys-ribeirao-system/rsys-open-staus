"use client";

import { Agent } from "@openstatus/icons";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

import { NoteButton } from "@/components/common/note";
import { NoteDismissible } from "@/components/common/note-dismissible";
import {
  EmptyStateContainer,
  EmptyStateTitle,
} from "@/components/content/empty-state";
import {
  SectionDescription,
  SectionGroup,
  SectionHeader,
  SectionHeaderRow,
  SectionTitle,
} from "@/components/content/section";
import { Section } from "@/components/content/section";
import { columns } from "@/components/data-table/overview-events/columns";
import {
  MetricCard,
  MetricCardGroup,
  MetricCardHeader,
  MetricCardLink,
  MetricCardTitle,
  MetricCardValue,
} from "@/components/metric/metric-card";
import { DataTable } from "@/components/ui/data-table/data-table";
import { buildOverviewData } from "@/data/overview-events.client";
import { useTRPC } from "@/lib/trpc/client";

import { CreateEventButtonGroup } from "./create-event-button-group";

export default function Page() {
  const trpc = useTRPC();

  const { data: monitors } = useQuery(trpc.monitor.list.queryOptions());
  const { data: pages } = useQuery(trpc.page.list.queryOptions());
  // no period — an incident open for weeks must still surface here
  const { data: incidents } = useQuery(trpc.incident.list.queryOptions());
  const { data: statusReports } = useQuery(
    trpc.statusReport.list.queryOptions({}),
  );
  const { data: maintenances } = useQuery(trpc.maintenance.list.queryOptions());

  if (!monitors || !pages || !incidents || !statusReports || !maintenances)
    return null;

  const { needsAttention, upcomingMaintenances, recentlyResolved, metrics } =
    buildOverviewData({
      monitors,
      pages,
      incidents,
      statusReports,
      maintenances,
    });

  return (
    <SectionGroup>
      <NoteDismissible cookieKey="note_overview_slack_agent">
        <Agent />
        Use nosso agente do Slack para gerenciar suas páginas de status e
        incidentes.
        <NoteButton variant="default" asChild>
          <Link href="/agents">Saiba mais</Link>
        </NoteButton>
      </NoteDismissible>
      <Section>
        <SectionHeaderRow>
          <SectionHeader>
            <SectionTitle>Visão geral</SectionTitle>
            <SectionDescription>
              Boas-vindas ao seu painel do OpenStatus.
            </SectionDescription>
          </SectionHeader>
          {pages.length > 0 ? <CreateEventButtonGroup /> : null}
        </SectionHeaderRow>
        <MetricCardGroup>
          {metrics.map((metric) => {
            const content = (
              <>
                <MetricCardHeader className="flex items-center justify-between gap-2">
                  <MetricCardTitle className="truncate">
                    {metric.title}
                  </MetricCardTitle>
                  <metric.icon className="size-4 shrink-0" />
                </MetricCardHeader>
                <MetricCardValue>{metric.value}</MetricCardValue>
              </>
            );
            return metric.href ? (
              <MetricCardLink
                key={metric.title}
                href={metric.href}
                variant={metric.variant}
              >
                {content}
              </MetricCardLink>
            ) : (
              <MetricCard key={metric.title} variant={metric.variant}>
                {content}
              </MetricCard>
            );
          })}
        </MetricCardGroup>
      </Section>
      <Section>
        <SectionHeader>
          <SectionTitle>Requer atenção</SectionTitle>
          <SectionDescription>
            Tudo o que ainda não foi resolvido, mais recentes primeiro.
          </SectionDescription>
        </SectionHeader>
        {needsAttention.length > 0 ? (
          <DataTable
            columns={columns}
            data={needsAttention}
            defaultSorting={[{ id: "startedAt", desc: true }]}
            defaultColumnVisibility={{ duration: false, endsAt: false }}
          />
        ) : (
          <EmptyStateContainer>
            <EmptyStateTitle>
              Tudo certo - nada precisa da sua atenção
            </EmptyStateTitle>
          </EmptyStateContainer>
        )}
      </Section>
      {upcomingMaintenances.length > 0 ? (
        <Section>
          <SectionHeader>
            <SectionTitle>Manutenções agendadas</SectionTitle>
            <SectionDescription>
              Janelas de manutenção futuras e em andamento.
            </SectionDescription>
          </SectionHeader>
          <DataTable
            columns={columns}
            data={upcomingMaintenances}
            defaultSorting={[{ id: "startedAt", desc: false }]}
            defaultColumnVisibility={{ action: false, duration: false }}
          />
        </Section>
      ) : null}
      <Section>
        <SectionHeader>
          <SectionTitle>Atividade recente</SectionTitle>
          <SectionDescription>
            Incidentes e relatórios resolvidos e manutenções concluídas nos
            últimos 7 dias.
          </SectionDescription>
        </SectionHeader>
        {recentlyResolved.length > 0 ? (
          <DataTable
            columns={columns}
            data={recentlyResolved}
            defaultSorting={[{ id: "startedAt", desc: true }]}
            defaultColumnVisibility={{ action: false, endsAt: false }}
          />
        ) : (
          <EmptyStateContainer>
            <EmptyStateTitle>Nenhuma atividade recente</EmptyStateTitle>
          </EmptyStateContainer>
        )}
      </Section>
    </SectionGroup>
  );
}
