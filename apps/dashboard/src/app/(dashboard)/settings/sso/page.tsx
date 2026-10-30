"use client";

import { allPlans } from "@openstatus/db/src/schema/plan/config";
import { Check, Shield } from "@openstatus/icons";
import { Badge } from "@openstatus/ui/components/ui/badge";
import { Button } from "@openstatus/ui/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@openstatus/ui/components/ui/dialog";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import {
  Section,
  SectionDescription,
  SectionGroup,
  SectionHeader,
  SectionTitle,
} from "@/components/content/section";
import { UpgradeDialog } from "@/components/dialogs/upgrade";
import {
  FormCard,
  FormCardContent,
  FormCardDescription,
  FormCardFooter,
  FormCardFooterInfo,
  FormCardGroup,
  FormCardHeader,
  FormCardTitle,
} from "@/components/forms/form-card";
import { useTRPC } from "@/lib/trpc/client";

const RETURN_PATH = "/settings/sso";

function StepBadge({ done, index }: { done: boolean; index: number }) {
  return (
    <Badge variant={done ? "default" : "outline"} className="size-6 p-0">
      {done ? <Check className="size-3" /> : index}
    </Badge>
  );
}

export default function Page() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [disableOpen, setDisableOpen] = useState(false);

  const { data: workspace } = useQuery(trpc.workspace.get.queryOptions());
  const { data: user } = useQuery(trpc.user.get.queryOptions());
  const { data: members } = useQuery(trpc.member.list.queryOptions());
  const { data: sso, isPending } = useQuery(trpc.sso.get.queryOptions());

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: trpc.sso.get.queryKey() });

  const enableMutation = useMutation(
    trpc.sso.enable.mutationOptions({
      onSuccess: () => invalidate(),
      onError: (error) => toast.error(error.message),
    }),
  );
  const disableMutation = useMutation(
    trpc.sso.disable.mutationOptions({
      onSuccess: () => {
        setDisableOpen(false);
        invalidate();
      },
      onError: (error) => toast.error(error.message),
    }),
  );
  const portalLinkMutation = useMutation(
    trpc.sso.portalLink.mutationOptions({
      onError: (error) => toast.error(error.message),
    }),
  );

  if (!workspace || !user || !members) return null;

  const isOwner =
    members.find((member) => member.user.id === user.id)?.role === "owner";

  if (!isOwner) {
    return (
      <SectionGroup>
        <Section>
          <SectionHeader>
            <SectionTitle>Single Sign-On</SectionTitle>
            <SectionDescription>
              Apenas proprietários do workspace podem gerenciar o SSO.
            </SectionDescription>
          </SectionHeader>
        </Section>
      </SectionGroup>
    );
  }

  const allowed = workspace.limits.sso;
  // SSO is a paid add-on on every plan, never bundled — the free plan carries no
  // addons at all, so those workspaces have to move up a plan before buying it.
  const ssoAddon = allPlans[workspace.plan].addons.sso;

  async function openPortal(intent: "sso" | "domain_verification") {
    const result = await portalLinkMutation.mutateAsync({
      intent,
      returnUrl: `${window.location.origin}${RETURN_PATH}`,
    });
    if (result?.link) window.location.href = result.link;
  }

  const configured = Boolean(sso?.configured);
  const hasVerifiedDomain = Boolean(
    sso?.domains.some((entry) => entry.verifiedAt !== null),
  );
  const connectionActive = sso?.connection === "active";

  return (
    <SectionGroup>
      <Section>
        <SectionHeader>
          <SectionTitle>Single Sign-On</SectionTitle>
          <SectionDescription>
            Permita que sua equipe entre pelo seu provedor de identidade com
            SAML. GitHub e Google continuam disponíveis para todos.
          </SectionDescription>
        </SectionHeader>

        {!allowed ? (
          <FormCardGroup>
            <FormCard>
              <FormCardHeader>
                <FormCardTitle>Disponível como complemento</FormCardTitle>
                <FormCardDescription>
                  {ssoAddon
                    ? "O single sign-on SAML é um complemento pago para o seu plano."
                    : "O single sign-on SAML é um complemento pago, disponível em qualquer plano pago."}
                </FormCardDescription>
              </FormCardHeader>
              <FormCardFooter>
                <FormCardFooterInfo>
                  {ssoAddon
                    ? "Adicione-o para conectar Okta, Entra ID ou qualquer provedor SAML."
                    : "Faça upgrade para conectar Okta, Entra ID ou qualquer provedor SAML."}
                </FormCardFooterInfo>
                <Button size="sm" onClick={() => setUpgradeOpen(true)}>
                  {ssoAddon ? "Adicionar SSO" : "Fazer upgrade"}
                </Button>
              </FormCardFooter>
            </FormCard>
          </FormCardGroup>
        ) : (
          <FormCardGroup>
            <FormCard>
              <FormCardHeader>
                <FormCardTitle>
                  <span className="flex items-center gap-2">
                    <StepBadge done={configured} index={1} />
                    Ativar SSO
                  </span>
                </FormCardTitle>
                <FormCardDescription>
                  Cria a organização que contém sua conexão e seus domínios.
                </FormCardDescription>
              </FormCardHeader>
              <FormCardFooter>
                <FormCardFooterInfo>
                  {configured
                    ? `Organização ${sso?.organizationId}`
                    : "Ainda não ativado."}
                </FormCardFooterInfo>
                {configured ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setDisableOpen(true)}
                  >
                    Desativar SSO
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    disabled={enableMutation.isPending || isPending}
                    onClick={() => enableMutation.mutate(undefined)}
                  >
                    Ativar SSO
                  </Button>
                )}
              </FormCardFooter>
            </FormCard>

            <FormCard>
              <FormCardHeader>
                <FormCardTitle>
                  <span className="flex items-center gap-2">
                    <StepBadge done={hasVerifiedDomain} index={2} />
                    Verifique seu domínio
                  </span>
                </FormCardTitle>
                <FormCardDescription>
                  Os usuários só podem entrar com SSO a partir de um domínio que
                  você verificou.
                </FormCardDescription>
              </FormCardHeader>
              <FormCardContent>
                {sso?.domains.length ? (
                  <ul className="flex flex-col gap-2">
                    {sso.domains.map((entry) => (
                      <li
                        key={entry.domain}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="font-commit-mono">{entry.domain}</span>
                        <Badge
                          variant={entry.verifiedAt ? "default" : "outline"}
                        >
                          {entry.verifiedAt ? "Verificado" : "Pendente"}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground text-sm">
                    Nenhum domínio ainda. Até que um seja verificado, o login
                    com SSO será recusado.
                  </p>
                )}
              </FormCardContent>
              <FormCardFooter>
                <FormCardFooterInfo>
                  A propriedade do domínio é comprovada com um registro DNS.
                </FormCardFooterInfo>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!configured || portalLinkMutation.isPending}
                  onClick={() => openPortal("domain_verification")}
                >
                  Verificar um domínio
                </Button>
              </FormCardFooter>
            </FormCard>

            <FormCard>
              <FormCardHeader>
                <FormCardTitle>
                  <span className="flex items-center gap-2">
                    <StepBadge done={connectionActive} index={3} />
                    Conecte seu provedor de identidade
                  </span>
                </FormCardTitle>
                <FormCardDescription>
                  Configure o SAML no Okta, Entra ID ou em qualquer provedor
                  compatível.
                </FormCardDescription>
              </FormCardHeader>
              <FormCardFooter>
                <FormCardFooterInfo>
                  {sso?.ready ? (
                    <span className="flex items-center gap-1">
                      <Shield className="size-3" />
                      Pronto — sua equipe pode entrar com SSO.
                    </span>
                  ) : (
                    `Conexão: ${sso?.connection ?? "nenhuma"}`
                  )}
                </FormCardFooterInfo>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!configured || portalLinkMutation.isPending}
                  onClick={() => openPortal("sso")}
                >
                  Configurar no WorkOS
                </Button>
              </FormCardFooter>
            </FormCard>
          </FormCardGroup>
        )}
      </Section>

      <UpgradeDialog
        open={upgradeOpen}
        onOpenChange={setUpgradeOpen}
        limit="sso"
      />

      <Dialog open={disableOpen} onOpenChange={setDisableOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Desativar SSO?</DialogTitle>
            <DialogDescription>
              Sua equipe não poderá mais entrar pelo seu provedor de identidade.
              Ninguém perde acesso ao workspace — os membros existentes
              continuam entrando com GitHub ou Google, e a configuração do
              provedor é mantida para que você possa reativá-la depois.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDisableOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              disabled={disableMutation.isPending}
              onClick={() => disableMutation.mutate(undefined)}
            >
              Desativar SSO
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SectionGroup>
  );
}
