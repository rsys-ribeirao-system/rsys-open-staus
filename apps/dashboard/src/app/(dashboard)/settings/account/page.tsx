"use client";

import { Button } from "@openstatus/ui/components/ui/button";
import { Input } from "@openstatus/ui/components/ui/input";
import { Label } from "@openstatus/ui/components/ui/label";
import { useMutation, useQuery } from "@tanstack/react-query";
import { signOut } from "next-auth/react";

import { Link } from "@/components/common/link";
import {
  Section,
  SectionGroup,
  SectionHeader,
  SectionTitle,
} from "@/components/content/section";
import { FormAlertDialog } from "@/components/forms/form-alert-dialog";
import {
  FormCardDescription,
  FormCardFooterInfo,
  FormCardHeader,
  FormCardTitle,
  FormCardUpgrade,
} from "@/components/forms/form-card";
import {
  FormCard,
  FormCardContent,
  FormCardFooter,
} from "@/components/forms/form-card";
import { ThemeToggle } from "@/components/theme-toggle";
import { useTRPC } from "@/lib/trpc/client";

export default function Page() {
  const trpc = useTRPC();
  const { data: user } = useQuery(trpc.user.get.queryOptions());
  const { data: workspace } = useQuery(trpc.workspace.get.queryOptions());
  const { data: members } = useQuery(trpc.member.list.queryOptions());

  const deleteAccountMutation = useMutation(
    trpc.user.deleteAccount.mutationOptions(),
  );

  if (!user || !workspace || !members) return null;

  const isOwner = members.find((m) => m.user.id === user.id)?.role === "owner";
  const hasPaidPlan = !!workspace.plan && workspace.plan !== "free";
  const isDeleteDisabled = isOwner && hasPaidPlan;

  return (
    <SectionGroup>
      <Section>
        <SectionHeader>
          <SectionTitle>Conta</SectionTitle>
        </SectionHeader>
        <FormCard id="personal-information">
          <FormCardUpgrade />
          <FormCardHeader>
            <FormCardTitle>Informações pessoais</FormCardTitle>
            <FormCardDescription>
              Gerencie suas informações pessoais.
            </FormCardDescription>
          </FormCardHeader>
          <FormCardContent>
            <form className="grid gap-4">
              <div className="grid gap-1.5">
                <Label>Nome</Label>
                <Input defaultValue={user?.name ?? undefined} />
              </div>
              <div className="grid gap-1.5">
                <Label>E-mail</Label>
                <Input defaultValue={user?.email ?? undefined} />
              </div>
            </form>
          </FormCardContent>
          <FormCardFooter className="[&>:last-child]:ml-0">
            <FormCardFooterInfo>
              Entre em contato conosco se quiser alterar seu e-mail ou nome.
            </FormCardFooterInfo>
          </FormCardFooter>
        </FormCard>
        <FormCard id="appearance">
          <FormCardHeader>
            <FormCardTitle>Aparência</FormCardTitle>
            <FormCardDescription>
              Escolha seu tema preferido.
            </FormCardDescription>
          </FormCardHeader>
          <FormCardContent className="pb-4">
            <ThemeToggle />
          </FormCardContent>
        </FormCard>
        <FormCard id="delete-account" variant="destructive">
          <FormCardHeader>
            <FormCardTitle>Excluir conta</FormCardTitle>
            <FormCardDescription>
              Isso excluirá sua conta permanentemente e removerá você de todos
              os workspaces. Esta ação não pode ser desfeita.
            </FormCardDescription>
          </FormCardHeader>
          {isDeleteDisabled ? (
            <FormCardContent>
              <p className="text-destructive text-sm">
                Você precisa cancelar sua assinatura antes de excluir sua conta.
                Acesse{" "}
                <a
                  href="/settings/billing"
                  className="font-medium underline underline-offset-4"
                >
                  Cobrança
                </a>{" "}
                para gerenciar sua assinatura.
              </p>
            </FormCardContent>
          ) : null}
          <FormCardFooter variant="destructive">
            <FormCardFooterInfo>
              Precisa de ajuda? Fale conosco em{" "}
              <Link href="mailto:ping@openstatus.dev">ping@openstatus.dev</Link>
              .
            </FormCardFooterInfo>
            <FormAlertDialog
              confirmationValue={user.email || user.name || "delete-account"}
              submitAction={async () => {
                await deleteAccountMutation.mutateAsync();
                await signOut({ redirectTo: "/" });
              }}
            >
              <Button
                variant="destructive"
                size="sm"
                disabled={isDeleteDisabled}
              >
                Excluir
              </Button>
            </FormAlertDialog>
          </FormCardFooter>
        </FormCard>
      </Section>
    </SectionGroup>
  );
}
