"use client";

import { Lock } from "@openstatus/icons";
import { Badge } from "@openstatus/ui/components/ui/badge";
import { Button } from "@openstatus/ui/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { Link } from "@/components/common/link";
import {
  FormCard,
  FormCardContent,
  FormCardDescription,
  FormCardFooter,
  FormCardFooterInfo,
  FormCardHeader,
  FormCardTitle,
  FormCardUpgrade,
} from "@/components/forms/form-card";
import { useTRPC } from "@/lib/trpc/client";

const SERVER_URL =
  process.env.NODE_ENV === "production"
    ? "https://api.openstatus.dev"
    : "http://localhost:3000";

interface SlackIntegrationCardProps {
  locked?: boolean;
  integration: {
    id: number;
    externalId: string;
    data: { teamName?: string };
  } | null;
}

export function SlackIntegrationCard({
  locked,
  integration,
}: SlackIntegrationCardProps) {
  const router = useRouter();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const isConnected = !!integration;

  const deleteIntegration = useMutation(
    trpc.integrationRouter.deleteIntegration.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.integrationRouter.list.queryKey(),
        });
        router.refresh();
      },
    }),
  );

  const generateToken = useMutation(
    trpc.integrationRouter.generateInstallToken.mutationOptions({
      onSuccess: (data) => {
        window.location.href = `${SERVER_URL}/slack/install?token=${data.token}`;
      },
    }),
  );

  const handleInstall = () => {
    generateToken.mutate();
  };

  const handleDisconnect = () => {
    if (!integration) return;
    deleteIntegration.mutate({ integrationId: integration.id });
  };

  return (
    <FormCard>
      {locked ? <FormCardUpgrade /> : null}
      <FormCardHeader>
        <div className="flex items-center gap-2">
          <FormCardTitle>Slack</FormCardTitle>
          {isConnected && <Badge variant="secondary">Conectado</Badge>}
        </div>
        <FormCardDescription>
          Gerencie relatórios de status direto do Slack. Mencione o bot em um
          canal para criar e atualizar incidentes.
        </FormCardDescription>
      </FormCardHeader>
      <FormCardContent>
        {isConnected ? (
          <p className="text-muted-foreground text-sm">
            Conectado a{" "}
            <strong>
              {integration.data?.teamName ?? "workspace do Slack"}
            </strong>
          </p>
        ) : (
          <p className="text-muted-foreground text-sm">
            Conecte seu workspace do Slack para começar.
          </p>
        )}
      </FormCardContent>
      <FormCardFooter>
        <FormCardFooterInfo>
          Saiba mais sobre o{" "}
          <Link
            href="https://www.openstatus.dev/blog/openstatus-slack-agent"
            rel="noreferrer"
            target="_blank"
          >
            agente do Slack
          </Link>
          .
        </FormCardFooterInfo>
        {locked ? (
          <Button type="button" asChild>
            <Link href="/settings/billing">
              <Lock />
              Fazer upgrade
            </Link>
          </Button>
        ) : isConnected ? (
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDisconnect}
            disabled={deleteIntegration.isPending}
          >
            {deleteIntegration.isPending ? "Desconectando..." : "Desconectar"}
          </Button>
        ) : (
          <Button
            size="sm"
            onClick={handleInstall}
            disabled={generateToken.isPending}
          >
            {generateToken.isPending ? "Conectando..." : "Adicionar ao Slack"}
          </Button>
        )}
      </FormCardFooter>
    </FormCard>
  );
}
