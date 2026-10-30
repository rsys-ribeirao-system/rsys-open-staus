"use client";

import { Info } from "@openstatus/icons";
import { Button } from "@openstatus/ui/components/ui/button";
import { useQuery } from "@tanstack/react-query";

import { Code } from "@/components/common/code";
import { Link } from "@/components/common/link";
import { Note } from "@/components/common/note";
import {
  SectionDescription,
  SectionGroup,
  SectionHeader,
  SectionTitle,
} from "@/components/content/section";
import { Section } from "@/components/content/section";
import { useTRPC } from "@/lib/trpc/client";

const messages = [
  {
    message:
      "@openstatus crie um incidente para a API de pagamentos – alta latência detectada.",
    description: "Abra um novo incidente e notifique seus assinantes.",
  },
  {
    message:
      "@openstatus mantenha a página de status atualizada informando que ainda estamos monitorando o problema.",
    description: "Atualize o relatório de status para 'Monitorando'.",
  },
  {
    message:
      "@openstatus resolva o incidente em andamento na página de status da minha API.",
    description: "Encerre um incidente ativo e atualize seus assinantes.",
  },
  {
    message:
      "@openstatus agende uma janela de manutenção para meu banco de dados na próxima sexta, das 14h às 15h.",
    description:
      "Planeje a indisponibilidade para que os assinantes sejam avisados com antecedência.",
  },
];

const commands = [
  {
    command: "/openstatus subscribe <status-page-url>",
    description: "Inscreve este canal em uma página de status.",
  },
  {
    command: "/openstatus unsubscribe <status-page-url>",
    description: "Cancela a inscrição deste canal em uma página de status.",
  },
  {
    command: "/openstatus subscriptions",
    description: "Mostra as inscrições deste canal.",
  },
];

export default function Page() {
  const trpc = useTRPC();
  const { data: workspace } = useQuery(trpc.workspace.get.queryOptions());
  return (
    <SectionGroup>
      <Section>
        <SectionHeader>
          <SectionTitle>Agente do Slack</SectionTitle>
          <SectionDescription>
            Use nosso agente do Slack para gerenciar suas páginas de status e
            incidentes.{" "}
            <Link
              href="https://www.openstatus.dev/blog/openstatus-slack-agent"
              target="_blank"
              rel="noopener noreferrer"
            >
              Saiba mais
            </Link>
            .
          </SectionDescription>
        </SectionHeader>
        {!workspace?.limits["slack-agent"] ? (
          <Note color="info" size="sm">
            <Info />
            Este é um recurso pago. Faça upgrade do seu plano para usar o agente
            do Slack.
          </Note>
        ) : null}
        <Button size="sm" asChild>
          <Link href="/settings/integrations">Instalar o agente do Slack</Link>
        </Button>
      </Section>
      <Section>
        <SectionHeader>
          <SectionTitle>Mensagens</SectionTitle>
          <SectionDescription>
            Veja alguns exemplos de mensagens que o agente do Slack consegue
            tratar.
          </SectionDescription>
        </SectionHeader>
        <Note size="sm">
          <Info />
          Mencione o bot @openstatus para acionar uma resposta. Isso mantém as
          threads limpas sem o bot enviar spam para sua equipe.
        </Note>
        <ul className="flex flex-col gap-2">
          {messages.map((message, i) => (
            <li key={i} className="flex flex-col gap-0.5">
              <p className="text-muted-foreground text-xs">
                {message.description}
              </p>
              <Code>{message.message}</Code>
            </li>
          ))}
        </ul>
      </Section>
      <Section>
        <SectionHeader>
          <SectionTitle>Comandos</SectionTitle>
          <SectionDescription>
            Comandos de barra para gerenciar quais páginas de status notificam
            este canal. Também úteis para canais do Slack Connect compartilhados
            com clientes.
          </SectionDescription>
        </SectionHeader>
        <Note size="sm">
          <Info />
          Inscrever-se também adiciona o bot ao canal. Canais privados exigem
          /invite @openstatus primeiro.
        </Note>
        <ul className="flex flex-col gap-2">
          {commands.map((command, i) => (
            <li key={i} className="flex flex-col gap-0.5">
              <p className="text-muted-foreground text-xs">
                {command.description}
              </p>
              <Code>{command.command}</Code>
            </li>
          ))}
        </ul>
      </Section>
    </SectionGroup>
  );
}
