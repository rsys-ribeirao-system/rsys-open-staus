"use client";

import { Info, Lock } from "@openstatus/icons";
import { Tabs, TabsList, TabsTrigger } from "@openstatus/ui/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { useParams } from "next/navigation";
import { useQueryStates } from "nuqs";
import { useMemo, useState } from "react";

import { NoteButton } from "@/components/common/note";
import { NoteDismissible } from "@/components/common/note-dismissible";
import {
  BillingOverlay,
  BillingOverlayButton,
  BillingOverlayContainer,
  BillingOverlayDescription,
} from "@/components/content/billing-overlay";
import {
  EmptyStateContainer,
  EmptyStateDescription,
  EmptyStateTitle,
} from "@/components/content/empty-state";
import {
  HintCollapsible,
  HintCollapsibleContent,
  HintCollapsibleDescription,
  HintCollapsibleTitle,
  HintCollapsibleTrigger,
} from "@/components/content/hint-collapsible";
import {
  Section,
  SectionDescription,
  SectionGroup,
  SectionHeader,
  SectionHeaderRow,
  SectionTitle,
} from "@/components/content/section";
import { getColumns } from "@/components/data-table/status-page-history/columns";
import { UpgradeDialog } from "@/components/dialogs/upgrade";
import { FormDialogSupportContact } from "@/components/forms/support-contact/dialog";
import {
  MetricCard,
  MetricCardGroup,
  MetricCardHeader,
  MetricCardTitle,
  MetricCardValue,
} from "@/components/metric/metric-card";
import { DataTable } from "@/components/ui/data-table/data-table";
import {
  HISTORY_WINDOWS,
  getColumnVisibility,
  parseWindow,
  windowKey,
} from "@/data/status-page-history";
import { useTRPC } from "@/lib/trpc/client";

import { buildExampleHistory } from "./examples";
import { searchParamsParsers } from "./search-params";

export function Client() {
  const { id } = useParams<{ id: string }>();
  const trpc = useTRPC();
  const [{ window }, setSearchParams] = useQueryStates(searchParamsParsers);
  const [openDialog, setOpenDialog] = useState(false);

  const { data: workspace } = useQuery(trpc.workspace.get.queryOptions());
  const isLimited = workspace?.limits["uptime-history"] === false;

  // one 24-month fetch; the window tabs only toggle column visibility
  const { data: liveHistory } = useQuery({
    ...trpc.page.getUptimeHistory.queryOptions({ id: Number.parseInt(id) }),
    enabled: !!workspace && !isLimited,
  });

  const exampleHistory = useMemo(
    () => (isLimited ? buildExampleHistory() : null),
    [isLimited],
  );
  const history = isLimited ? exampleHistory : liveHistory;

  const columns = useMemo(
    () => getColumns(history?.months ?? [], window),
    [history?.months, window],
  );
  const columnVisibility = useMemo(
    () => getColumnVisibility(window, history?.months.length ?? 0),
    [window, history?.months.length],
  );

  if (!history) return null;

  const summary = history.summary[windowKey(window)];
  const hasAnyData = history.rows.some((row) =>
    Object.values(row.months).some((value) => value !== null),
  );

  return (
    <SectionGroup>
      <Section>
        <SectionHeader>
          <SectionHeaderRow>
            <div>
              <SectionTitle>Histórico</SectionTitle>
              <SectionDescription>
                Disponibilidade de longo prazo, calculada a partir dos
                componentes da sua página.
              </SectionDescription>
            </div>
            <Tabs
              value={String(window)}
              onValueChange={(v) => setSearchParams({ window: parseWindow(v) })}
            >
              <TabsList>
                {HISTORY_WINDOWS.map((w) => (
                  <TabsTrigger key={w} value={String(w)}>
                    {w} meses
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </SectionHeaderRow>
        </SectionHeader>
      </Section>
      <Section>
        <MetricCardGroup className="md:grid-cols-4 lg:grid-cols-4">
          <MetricCard variant="success">
            <MetricCardHeader>
              <MetricCardTitle className="uppercase">
                Disponibilidade da página
              </MetricCardTitle>
            </MetricCardHeader>
            <MetricCardValue>
              {summary.uptime === null ? "—" : `${summary.uptime.toFixed(3)}%`}
            </MetricCardValue>
          </MetricCard>
          <MetricCard>
            <MetricCardHeader>
              <MetricCardTitle className="uppercase">
                Relatórios
              </MetricCardTitle>
            </MetricCardHeader>
            <MetricCardValue>{summary.reports}</MetricCardValue>
          </MetricCard>
          <MetricCard>
            <MetricCardHeader>
              <MetricCardTitle className="uppercase">
                Componentes
              </MetricCardTitle>
            </MetricCardHeader>
            <MetricCardValue>{history.rows.length}</MetricCardValue>
          </MetricCard>
          <MetricCard>
            <MetricCardHeader>
              <MetricCardTitle className="uppercase">Criado em</MetricCardTitle>
            </MetricCardHeader>
            <MetricCardValue>
              {history.createdAt ? format(history.createdAt, "MMM yy") : "—"}
            </MetricCardValue>
          </MetricCard>
        </MetricCardGroup>
        {isLimited ? (
          <BillingOverlayContainer>
            <div className="overflow-x-auto">
              <DataTable
                columns={columns}
                data={history.rows}
                columnVisibility={columnVisibility}
                defaultPagination={{ pageIndex: 0, pageSize: 100 }}
              />
            </div>
            <BillingOverlay>
              <BillingOverlayButton onClick={() => setOpenDialog(true)}>
                <Lock />
                Fazer upgrade
              </BillingOverlayButton>
              <BillingOverlayDescription>
                Acompanhe seu histórico de disponibilidade dos últimos 24 meses.
              </BillingOverlayDescription>
            </BillingOverlay>
            <UpgradeDialog
              open={openDialog}
              onOpenChange={setOpenDialog}
              limit="uptime-history"
            />
          </BillingOverlayContainer>
        ) : hasAnyData ? (
          <div className="overflow-x-auto">
            <DataTable
              columns={columns}
              data={history.rows}
              columnVisibility={columnVisibility}
              defaultPagination={{ pageIndex: 0, pageSize: 100 }}
            />
          </div>
        ) : (
          <EmptyStateContainer>
            <EmptyStateTitle>Nenhum histórico ainda</EmptyStateTitle>
            <EmptyStateDescription>
              O primeiro{" "}
              <span className="text-foreground font-medium">snapshot</span> é
              congelado no{" "}
              <span className="text-foreground font-medium">
                dia 10 do próximo mês
              </span>{" "}
              — até lá, o mês atual é exibido em tempo real.
            </EmptyStateDescription>
          </EmptyStateContainer>
        )}
        <HintCollapsible>
          <HintCollapsibleTrigger>
            <HintCollapsibleTitle>
              Como a disponibilidade é calculada
            </HintCollapsibleTitle>
            <HintCollapsibleDescription>
              Cada porcentagem depende do modo de cálculo da página e do tipo de
              componente.
            </HintCollapsibleDescription>
          </HintCollapsibleTrigger>
          <HintCollapsibleContent>
            <p className="text-muted-foreground">
              O modo de cálculo é definido para a página inteira nas
              configurações da página de status e se aplica a todos os meses
              exibidos aqui. O que é congelado mensalmente são as contagens
              diárias brutas de verificações — alterar o modo recalcula todos os
              meses a partir dessas contagens imutáveis.
            </p>
            <ul className="space-y-2.5">
              <li>
                <span className="bg-muted rounded px-1 py-0.5 font-mono">
                  requests
                </span>{" "}
                <span className="text-muted-foreground">
                  — Componentes de monitor. A disponibilidade é{" "}
                  <span className="text-foreground font-medium">
                    (ok + degradado) / total de verificações
                  </span>
                  . Respostas degradadas ainda contam como disponíveis.
                </span>
              </li>
              <li>
                <span className="bg-muted rounded px-1 py-0.5 font-mono">
                  duration
                </span>{" "}
                <span className="text-muted-foreground">
                  — Componentes de monitor. A indisponibilidade é medida pelos
                  intervalos de incidentes e relatórios de status, ponderada
                  pelo impacto (indisponibilidade total conta integralmente,
                  parcial pela metade) e mesclada para que eventos sobrepostos
                  nunca sejam contados em dobro.
                </span>
              </li>
              <li>
                <span className="bg-muted rounded px-1 py-0.5 font-mono">
                  manual
                </span>{" "}
                <span className="text-muted-foreground">
                  — Nenhum dado de sonda é considerado; a disponibilidade é
                  derivada inteiramente dos incidentes reportados. Componentes
                  estáticos sempre funcionam assim, com todo o histórico mantido
                  — relatórios nunca expiram.
                </span>
              </li>
            </ul>
            <p className="text-muted-foreground">
              Meses sem verificações registradas aparecem como{" "}
              <span className="text-foreground font-medium">sem dados</span> e
              são excluídos dos totais — nunca contam como indisponibilidade.
            </p>
          </HintCollapsibleContent>
        </HintCollapsible>
        {!isLimited ? (
          <NoteDismissible cookieKey="note_status_page_history_missing_months">
            <Info />
            Se houver meses faltando, entre em contato conosco.
            <FormDialogSupportContact>
              <NoteButton variant="default">Solicitar preenchimento</NoteButton>
            </FormDialogSupportContact>
          </NoteDismissible>
        ) : null}
      </Section>
    </SectionGroup>
  );
}
