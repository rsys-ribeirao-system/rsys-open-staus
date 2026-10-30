"use client";

import { useQuery } from "@tanstack/react-query";
import { KeyRound } from "lucide-react";
import Link from "next/link";

import { NoteButton } from "@/components/common/note";
import { NoteDismissible } from "@/components/common/note-dismissible";
import {
  Section,
  SectionDescription,
  SectionGroup,
  SectionHeader,
  SectionTitle,
} from "@/components/content/section";
import { FormCardGroup } from "@/components/forms/form-card";
import { useTRPC } from "@/lib/trpc/client";

import { SlackIntegrationCard } from "./slack-card";

export default function Page() {
  const trpc = useTRPC();
  //  FIXME: we should use workspace limit here
  const { data: workspace } = useQuery(trpc.workspace.get.queryOptions());

  const { data: integrations } = useQuery(
    trpc.integrationRouter.list.queryOptions(),
  );

  if (!integrations) return null;

  const slackIntegration = integrations.find((i) => i.name === "slack-agent");

  return (
    <SectionGroup>
      <Section>
        <SectionHeader>
          <SectionTitle>Integrações</SectionTitle>
          <SectionDescription>
            Conecte serviços de terceiros ao seu workspace.
          </SectionDescription>
        </SectionHeader>
        <NoteDismissible cookieKey="note_integrations_api_keys">
          <KeyRound />
          Procurando suas chaves de API? Elas ficam na página de configurações
          gerais.
          <NoteButton variant="default" asChild>
            <Link href="/settings/general#api-keys">Ir para chaves de API</Link>
          </NoteButton>
        </NoteDismissible>
        <FormCardGroup>
          <SlackIntegrationCard
            locked={!workspace?.limits["slack-agent"]}
            integration={
              slackIntegration
                ? {
                    id: slackIntegration.id,
                    externalId: slackIntegration.externalId,
                    data: slackIntegration.data as {
                      teamName?: string;
                    },
                  }
                : null
            }
          />
        </FormCardGroup>
      </Section>
    </SectionGroup>
  );
}
