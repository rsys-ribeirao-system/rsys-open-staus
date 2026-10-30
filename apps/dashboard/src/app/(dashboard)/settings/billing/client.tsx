"use client";

import { allPlans } from "@openstatus/db/src/schema/plan/config";
import type { Limits } from "@openstatus/db/src/schema/plan/schema";
import { Button } from "@openstatus/ui/components/ui/button";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useQueryStates } from "nuqs";
import { useEffect, useMemo, useTransition } from "react";
import { toast } from "sonner";

import { BillingAddons } from "@/components/content/billing-addons";
import { BillingProgress } from "@/components/content/billing-progress";
import {
  EmptyStateContainer,
  EmptyStateTitle,
} from "@/components/content/empty-state";
import {
  Section,
  SectionDescription,
  SectionGroup,
  SectionHeader,
  SectionTitle,
} from "@/components/content/section";
import { DataTable } from "@/components/data-table/billing/data-table";
import {
  FormCard,
  FormCardContent,
  FormCardDescription,
  FormCardFooter,
  FormCardFooterInfo,
  FormCardGroup,
  FormCardHeader,
  FormCardSeparator,
  FormCardTitle,
} from "@/components/forms/form-card";
import { useTRPC } from "@/lib/trpc/client";

import { searchParamsParsers } from "./search-params";

const BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://app.openstatus.dev"
    : "http://localhost:3000";

function calculateTotalRequests(limits: Limits) {
  const monitors = limits.monitors;
  const maxRegions = limits["max-regions"];
  const periodicity = limits.periodicity;

  if (periodicity.includes("30s")) {
    return monitors * maxRegions * 2 * 60 * 24 * 30;
  }

  if (periodicity.includes("1m")) {
    return monitors * maxRegions * 60 * 24 * 30;
  }

  if (periodicity.includes("5m")) {
    return monitors * maxRegions * 12 * 24 * 30;
  }

  if (periodicity.includes("10m")) {
    return monitors * maxRegions * 6 * 24 * 30;
  }

  if (periodicity.includes("30m")) {
    return monitors * maxRegions * 2 * 24 * 30;
  }

  if (periodicity.includes("1h")) {
    return monitors * maxRegions * 24 * 30;
  }

  return 0;
}

export function Client() {
  const trpc = useTRPC();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [{ success }, setSearchParams] = useQueryStates(searchParamsParsers);
  const { data: workspace } = useQuery(trpc.workspace.get.queryOptions());
  const { data: usage } = useQuery(trpc.workspace.usage.queryOptions());
  const customerPortalMutation = useMutation(
    trpc.stripeRouter.getUserCustomerPortal.mutationOptions({
      onSuccess: (url) => {
        if (!url) return;
        router.push(url);
      },
    }),
  );
  const { data: httpWorkspace30d } = useQuery({
    ...trpc.tinybird.workspace30d.queryOptions({
      type: "http",
    }),
    enabled: !!workspace,
  });

  const { data: tcpWorkspace30d } = useQuery({
    ...trpc.tinybird.workspace30d.queryOptions({
      type: "tcp",
    }),
    enabled: !!workspace,
  });

  useEffect(() => {
    if (success) {
      setTimeout(() => {
        toast.success("Informações de cobrança atualizadas", {
          duration: 5_000,
          onAutoClose: () => setSearchParams({ success: null }),
          onDismiss: () => setSearchParams({ success: null }),
        });
      }, 500);
    }
  }, [success, setSearchParams]);

  const totalRequests = useMemo(() => {
    const httpRequests = httpWorkspace30d?.data?.reduce(
      (acc, curr) => acc + curr.count,
      0,
    );
    const tcpRequests = tcpWorkspace30d?.data?.reduce(
      (acc, curr) => acc + curr.count,
      0,
    );
    return (httpRequests ?? 0) + (tcpRequests ?? 0);
  }, [httpWorkspace30d, tcpWorkspace30d]);

  if (!workspace) return null;

  const planAddons = allPlans[workspace.plan].addons;

  return (
    <SectionGroup>
      <Section>
        <SectionHeader>
          <SectionTitle>Cobrança</SectionTitle>
          <SectionDescription>
            Gerencie suas informações de cobrança e formas de pagamento.
          </SectionDescription>
        </SectionHeader>
        <FormCardGroup>
          <FormCard>
            <FormCardHeader>
              <FormCardTitle>Uso</FormCardTitle>
              <FormCardDescription>
                Visão geral do seu uso atual, limites e complementos.
              </FormCardDescription>
            </FormCardHeader>
            <FormCardContent>
              <div className="flex flex-col gap-2">
                <BillingProgress
                  label="Monitores"
                  value={usage?.monitors ?? 0}
                  max={workspace.limits.monitors}
                />
                <BillingProgress
                  label="Páginas de status"
                  value={usage?.pages ?? 0}
                  max={workspace.limits["status-pages"]}
                />
                <BillingProgress
                  label="Componentes da página"
                  value={usage?.pageComponents ?? 0}
                  max={workspace.limits["page-components"]}
                />
                <BillingProgress
                  label="Notificações"
                  value={usage?.notifications ?? 0}
                  max={workspace.limits["notification-channels"]}
                />
                <BillingProgress
                  label="Total de requisições nos últimos 30 dias"
                  value={totalRequests}
                  max={calculateTotalRequests(workspace.limits)}
                />
              </div>
            </FormCardContent>
            <FormCardSeparator />
            <FormCardContent>
              <FormCardHeader className="col-span-full px-0 pt-0 pb-0">
                <FormCardTitle>Complementos</FormCardTitle>
                <FormCardDescription>
                  Amplie seus limites com recursos adicionais.
                </FormCardDescription>
              </FormCardHeader>
              <div className="flex flex-col gap-2 pt-4">
                {planAddons["email-domain-protection"] ? (
                  <BillingAddons
                    label={planAddons["email-domain-protection"].title}
                    description={
                      planAddons["email-domain-protection"].description
                    }
                    addon="email-domain-protection"
                    workspace={workspace}
                  />
                ) : null}
                {planAddons["ip-restriction"] ? (
                  <BillingAddons
                    label={planAddons["ip-restriction"].title}
                    description={planAddons["ip-restriction"].description}
                    addon="ip-restriction"
                    workspace={workspace}
                  />
                ) : null}
                {planAddons["white-label"] ? (
                  <BillingAddons
                    label={planAddons["white-label"].title}
                    description={planAddons["white-label"].description}
                    addon="white-label"
                    workspace={workspace}
                  />
                ) : null}
                {planAddons["custom-theme"] ? (
                  <BillingAddons
                    label={planAddons["custom-theme"].title}
                    description={planAddons["custom-theme"].description}
                    addon="custom-theme"
                    workspace={workspace}
                  />
                ) : null}
                {planAddons["status-pages"] ? (
                  <BillingAddons
                    label={planAddons["status-pages"].title}
                    description={planAddons["status-pages"].description}
                    addon="status-pages"
                    workspace={workspace}
                  />
                ) : null}
                {planAddons.sso ? (
                  <BillingAddons
                    label={planAddons.sso.title}
                    description={planAddons.sso.description}
                    addon="sso"
                    workspace={workspace}
                  />
                ) : null}
                {Object.keys(planAddons).length === 0 ? (
                  <EmptyStateContainer>
                    <EmptyStateTitle>
                      Nenhum complemento disponível
                    </EmptyStateTitle>
                  </EmptyStateContainer>
                ) : null}
              </div>
            </FormCardContent>
            <FormCardFooter>
              <FormCardFooterInfo>
                Acesse suas{" "}
                <span className="font-medium">informações de cobrança</span>,{" "}
                <span className="font-medium">faturas</span> e{" "}
                <span className="font-medium">formas de pagamento</span> via
                Stripe.
              </FormCardFooterInfo>
              <Button
                size="sm"
                onClick={() => {
                  startTransition(async () => {
                    await customerPortalMutation.mutateAsync({
                      workspaceSlug: workspace.slug,
                      returnUrl: `${BASE_URL}/settings/billing`,
                    });
                  });
                }}
                disabled={isPending}
              >
                {isPending ? "Carregando..." : "Portal do cliente"}
              </Button>
            </FormCardFooter>
          </FormCard>
          <FormCard>
            <FormCardHeader>
              <FormCardTitle>Planos</FormCardTitle>
              <FormCardDescription>
                Escolha um plano que atenda às suas necessidades.
              </FormCardDescription>
            </FormCardHeader>
            <FormCardSeparator />
            <FormCardContent className="pb-4">
              <DataTable />
            </FormCardContent>
          </FormCard>
        </FormCardGroup>
      </Section>
    </SectionGroup>
  );
}
