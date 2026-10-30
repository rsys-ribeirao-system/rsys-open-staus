"use client";

import { Badge } from "@openstatus/ui/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@openstatus/ui/components/ui/tabs";
import { cn } from "@openstatus/ui/lib/utils";

import {
  StepCard,
  StepCardBadge,
  StepCardContent,
  StepCardHeader,
  StepCardIndicator,
  StepCardTitle,
} from "@/components/forms/step-card";
import { getSubdomain } from "@/lib/domains";

import { DomainStatusIcon } from "./domain-status-icon";
import { DomainTroubleshooting } from "./domain-troubleshooting";
import { useDomainStatus } from "./use-domain-status";

export const InlineSnippet = ({
  className,
  children,
}: {
  className?: string;
  children?: string;
}) => {
  return (
    <span
      className={cn(
        "bg-muted inline-block rounded-md px-1 py-0.5 font-mono",
        className,
      )}
    >
      {children}
    </span>
  );
};

const CNAME_VALUE =
  process.env.NEXT_PUBLIC_VERCEL_PROJECT_DNS_CNAME || "cname.vercel-dns.com";
const A_RECORD_VALUE =
  process.env.NEXT_PUBLIC_VERCEL_PROJECT_DNS_A || "76.76.21.21";

export default function DomainConfiguration({ domain }: { domain: string }) {
  const { status, domainJson, steps, isLoading } = useDomainStatus(domain);

  if (isLoading && !domainJson)
    return (
      <div className="flex items-center gap-3 border border-transparent px-4">
        <DomainStatusIcon loading={true} />
        <p className="text-muted-foreground text-sm">
          Verificando status do domínio...
        </p>
      </div>
    );

  if (!status || !domainJson) return null;

  const subdomain =
    domainJson?.name && domainJson?.apexName
      ? getSubdomain(domainJson.name, domainJson.apexName)
      : null;

  const txtVerification =
    (status === "Pending Verification" &&
      domainJson?.verification?.find((x) => x.type === "TXT")) ||
    null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 border border-transparent px-4">
        <DomainStatusIcon status={status} loading={isLoading} />
        <p className="text-sm font-semibold">{status}</p>
        <Badge variant="secondary">{domain}</Badge>
      </div>

      {/* Step 1: DNS Configuration */}
      <StepCard variant={steps.dns}>
        <StepCardHeader>
          <StepCardIndicator step={1} />
          <StepCardTitle>Configurar registros DNS</StepCardTitle>
          <StepCardBadge>Concluído</StepCardBadge>
        </StepCardHeader>
        <StepCardContent>
          {status === "Unknown Error" ? (
            <p className="text-sm">{domainJson?.error?.message}</p>
          ) : (
            <>
              <Tabs defaultValue={subdomain ? "CNAME" : "A"}>
                <TabsList>
                  <TabsTrigger value="A">
                    Registro A{!subdomain && " (recomendado)"}
                  </TabsTrigger>
                  <TabsTrigger value="CNAME">
                    Registro CNAME{subdomain && " (recomendado)"}
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="A" className="space-y-2">
                  <p className="text-sm">
                    Para configurar seu domínio raiz (
                    <InlineSnippet>{domainJson.apexName}</InlineSnippet>
                    ), defina o seguinte registro A no seu provedor de DNS:
                  </p>
                  <div className="bg-muted flex items-center justify-start space-x-10 rounded-md p-2">
                    <div>
                      <p className="text-sm font-bold">Tipo</p>
                      <p className="mt-2 font-mono text-sm">A</p>
                    </div>
                    <div>
                      <p className="text-sm font-bold">Nome</p>
                      <p className="mt-2 font-mono text-sm">@</p>
                    </div>
                    <div>
                      <p className="text-sm font-bold">Valor</p>
                      <p className="mt-2 font-mono text-sm">{A_RECORD_VALUE}</p>
                    </div>
                    <div>
                      <p className="text-sm font-bold">TTL</p>
                      <p className="mt-2 font-mono text-sm">86400</p>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="CNAME">
                  <div className="bg-muted flex items-center justify-start space-x-10 rounded-md p-2">
                    <div>
                      <p className="text-sm font-bold">Tipo</p>
                      <p className="mt-2 font-mono text-sm">CNAME</p>
                    </div>
                    <div>
                      <p className="text-sm font-bold">Nome</p>
                      <p className="mt-2 font-mono text-sm">
                        {subdomain ?? "www"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-bold">Valor</p>
                      <p className="mt-2 font-mono text-sm">{CNAME_VALUE}</p>
                    </div>
                    <div>
                      <p className="text-sm font-bold">TTL</p>
                      <p className="mt-2 font-mono text-sm">86400</p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
              <p className="text-muted-foreground mt-3 text-sm">
                Observação: para o TTL, se <InlineSnippet>86400</InlineSnippet>{" "}
                não estiver disponível, defina o maior valor possível. A
                propagação do domínio pode levar até uma hora.
              </p>
            </>
          )}
        </StepCardContent>
      </StepCard>

      {/* Step 2: Domain Verification */}
      <StepCard variant={steps.verification}>
        <StepCardHeader>
          <StepCardIndicator step={2} />
          <StepCardTitle>Verificar propriedade do domínio</StepCardTitle>
          <StepCardBadge>Concluído</StepCardBadge>
        </StepCardHeader>
        <StepCardContent>
          {txtVerification ? (
            <>
              <p className="text-sm">
                Defina o seguinte registro TXT em{" "}
                <InlineSnippet>{domainJson.apexName}</InlineSnippet> para
                comprovar a propriedade de{" "}
                <InlineSnippet>{domainJson.name}</InlineSnippet>:
              </p>
              <div className="bg-muted my-3 flex items-start justify-start space-x-10 rounded-md p-2">
                <div>
                  <p className="text-sm font-bold">Tipo</p>
                  <p className="mt-2 font-mono text-sm">
                    {txtVerification.type}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-bold">Nome</p>
                  <p className="mt-2 font-mono text-sm">
                    {txtVerification.domain.slice(
                      0,
                      txtVerification.domain.length -
                        (domainJson?.apexName?.length || 0) -
                        1,
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-bold">Valor</p>
                  <p className="mt-2 font-mono text-sm break-all">
                    {txtVerification.value}
                  </p>
                </div>
              </div>
              <p className="text-muted-foreground text-sm">
                Atenção: se você usa este domínio em outro site, definir este
                registro TXT transferirá a propriedade do domínio desse site e
                vai quebrá-lo. Tenha cuidado ao definir este registro.
              </p>
            </>
          ) : (
            <p className="text-muted-foreground text-sm">
              Um registro TXT pode ser necessário para verificar a propriedade
              do domínio. Os valores exatos aparecerão aqui quando o DNS estiver
              configurado.
            </p>
          )}
        </StepCardContent>
      </StepCard>

      {status !== "Valid Configuration" ? (
        <DomainTroubleshooting domain={domain} />
      ) : null}
    </div>
  );
}
