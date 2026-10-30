import {
  Download,
  FileJson,
  ApiKey as KeyIcon,
  Login,
  Report,
  StatusPage,
  Terminal,
} from "@openstatus/icons";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@openstatus/ui/components/ui/tabs";
import React from "react";

import { Code } from "@/components/common/code";
import { Link } from "@/components/common/link";
import {
  SectionDescription,
  SectionGroup,
  SectionHeader,
  SectionTitle,
} from "@/components/content/section";
import { Section } from "@/components/content/section";

const OS = ["macOs", "Windows", "Linux"] as const;

const installs = [
  {
    title: "Instalar a CLI",
    icon: Terminal,
    description:
      "Instale a CLI do OpenStatus para configurar seus monitores direto no seu código.",
    command: {
      macOs: [
        "brew install openstatusHQ/cli/openstatus --cask",
        "curl -fsSL https://raw.githubusercontent.com/openstatusHQ/cli/refs/heads/main/install.sh | bash",
      ],
      Linux: [
        "curl -fsSL https://raw.githubusercontent.com/openstatusHQ/cli/refs/heads/main/install.sh | bash",
      ],
      Windows: [
        "iwr https://raw.githubusercontent.com/openstatusHQ/cli/refs/heads/main/install.ps1| iex",
      ],
    },
  },
  {
    title: "Login",
    icon: Login,
    description: "Salve seu token de API para usar nos comandos seguintes.",
    command: "openstatus login",
  },
  {
    title: "Adicionar chave de API",
    icon: KeyIcon,
    description: (
      <>
        Ou defina-a como variável de ambiente. Crie uma chave de API nas
        <Link href="/settings/general">configurações</Link> do seu workspace.
      </>
    ),
    command: {
      macOs: ["export OPENSTATUS_API_TOKEN=<your-api-token>"],
      Windows: ["set OPENSTATUS_API_TOKEN=<your-api-token>"],
      Linux: ["export OPENSTATUS_API_TOKEN=<your-api-token>"],
    },
  },
  {
    title: "Listar páginas de status",
    icon: StatusPage,
    description: "Lista todas as páginas de status do seu workspace.",
    command: "openstatus status-page list",
  },
  {
    title: "Listar relatórios de status",
    icon: Report,
    description: "Lista todos os relatórios de status do seu workspace.",
    command: "openstatus status-report list",
  },
  {
    title: "Importar monitores",
    icon: Download,
    description: "Importa os monitores do seu workspace para um arquivo YAML.",
    command: "openstatus monitors import",
  },
  {
    title: "Gerenciar monitores",
    icon: FileJson,
    description:
      "Adicione, remova ou atualize monitores a partir de um arquivo YAML e aplique suas alterações.",
    command: "openstatus monitors apply",
  },
] satisfies {
  title: string;
  icon: React.ElementType;
  description: React.ReactNode;
  command: string | Record<(typeof OS)[number], string[]>;
}[];

const commands = [
  {
    command: "openstatus monitors list [options]",
    description: "Lista todos os monitores do seu workspace.",
  },
  {
    command: "openstatus monitors info [monitor-id] [options]",
    description: "Obtém informações sobre um monitor específico.",
  },
  {
    command: "openstatus monitors trigger [monitor-id] [options]",
    description: "Dispara um monitor.",
  },
  {
    command: "openstatus status-page list [options]",
    description: "Lista todas as páginas de status.",
  },
  {
    command: "openstatus status-page info [page-id]",
    description: "Obtém os detalhes da página de status.",
  },
  {
    command:
      'openstatus status-report create --title "..." --status investigating --message "..." --page-id 123',
    description: "Cria um relatório de status.",
  },
  {
    command:
      'openstatus status-report add-update [report-id] --status resolved --message "..."',
    description: "Adiciona uma atualização a um relatório de status.",
  },
  {
    command: "openstatus status-report list [options]",
    description: "Lista todos os relatórios de status.",
  },
];

const templates = [
  {
    description: "Servidor MCP",
    template: `# yaml-language-server: $schema=https://www.openstatus.dev/schema.json

mcp-server:
  name: "HF MCP Server"
  description: "Hugging Face MCP server monitoring"
  frequency: "1m"
  active: true
  regions: ["iad", "ams", "lax"]
  retry: 3
  kind: http
  request:
    url: https://hf.co/mcp
    method: POST
    body: >
      {
        "jsonrpc": "2.0",
        "id": "openstatus",
        "method": "ping"
      }
    headers:
      User-Agent: OpenStatus
      Accept: application/json, text/event-stream
      Content-Type: application/json
  assertions:
    - kind: statusCode
      compare: eq
      target: 200
    - kind: textBody
      compare: eq
      target: '{"result":{},"jsonrpc":"2.0","id":"openstatus"}'
`,
  },
];

const githubActions = [
  {
    description: "Executar testes sintéticos",
    template: `name: OpenStatus
on: [push]

jobs:
  run-synthetic-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: OpenStatus GitHub Action
        uses: openstatusHQ/openstatus-github-action@v1
        with:
          api_key: \${{ secrets.OPENSTATUS_API_KEY }}`,
  },
  {
    description: "Aplicar configuração de monitores",
    template: `name: OpenStatus
on: [push]

jobs:
  apply-monitors:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: OpenStatus CLI Action
        uses: openstatusHQ/cli-action@v1
        with:
          args: monitors apply
        env:
          OPENSTATUS_API_TOKEN: \${{ secrets.OPENSTATUS_API_TOKEN }}`,
  },
];

export default function Page() {
  return (
    <SectionGroup>
      <Section>
        <SectionHeader>
          <SectionTitle>CLI</SectionTitle>
          <SectionDescription>
            Comece a usar a CLI para exportar e gerenciar seus monitores no seu
            código.{" "}
            <Link
              href="https://www.openstatus.dev/docs/reference/cli-reference/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Saiba mais
            </Link>
            .
          </SectionDescription>
        </SectionHeader>
        <Tabs defaultValue={OS[0]} className="flex flex-col gap-3">
          <TabsList>
            {OS.map((os) => (
              <TabsTrigger key={os} value={os}>
                {os}
              </TabsTrigger>
            ))}
          </TabsList>
          {OS.map((os) => (
            <TabsContent key={os} value={os} className="flex flex-col gap-6">
              {installs.map((step, i) => {
                const commands =
                  typeof step.command === "string"
                    ? step.command
                    : step.command[os];
                return (
                  <div key={i} className="flex flex-col gap-3">
                    <div className="flex flex-col gap-1">
                      <p className="flex items-center gap-2 text-sm font-medium">
                        <step.icon className="size-4" />
                        {step.title}
                      </p>
                      <p className="text-muted-foreground text-sm">
                        {step.description}
                      </p>
                    </div>
                    {typeof commands === "string" ? (
                      <Code>{commands}</Code>
                    ) : (
                      <>
                        {commands.map((command, i) => (
                          <React.Fragment key={command}>
                            <Code>{command}</Code>
                            {i < commands.length - 1 && (
                              <span className="text-muted-foreground">ou</span>
                            )}
                          </React.Fragment>
                        ))}
                      </>
                    )}
                  </div>
                );
              })}
            </TabsContent>
          ))}
        </Tabs>
      </Section>
      <Section>
        <SectionHeader>
          <SectionTitle>Comandos</SectionTitle>
          <SectionDescription>
            Temos mais alguns comandos para executar. Consulte a{" "}
            <Link
              href="https://www.openstatus.dev/docs/reference/cli-reference/"
              target="_blank"
              rel="noopener noreferrer"
            >
              documentação
            </Link>{" "}
            para saber mais.
          </SectionDescription>
        </SectionHeader>
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
      <Section>
        <SectionHeader>
          <SectionTitle>Skills</SectionTitle>
          <SectionDescription>
            Adicione a skill do openstatus para permitir que agentes de IA
            gerenciem seus monitores, páginas de status e relatórios de status
            por você.
          </SectionDescription>
        </SectionHeader>
        <Code>npx skills add openstatushq/cli</Code>
      </Section>
      <Section>
        <SectionHeader>
          <SectionTitle>GitHub Action</SectionTitle>
          <SectionDescription>
            Oferecemos uma GitHub Action caso você queira usar a CLI nos seus
            workflows de CI/CD. Consulte a página de{" "}
            <Link
              href="https://github.com/openstatusHQ/openstatus-github-action"
              target="_blank"
              rel="noopener noreferrer"
            >
              integração com o GitHub
            </Link>{" "}
            ou nosso{" "}
            <Link
              href="https://www.openstatus.dev/docs/guides/how-to-run-synthetic-test-github-action/"
              target="_blank"
              rel="noopener noreferrer"
            >
              guia
            </Link>{" "}
            para executar testes sintéticos em uma GitHub Action.
          </SectionDescription>
        </SectionHeader>
        <div className="flex flex-col gap-6">
          {githubActions.map((action, i) => (
            <div key={i} className="flex flex-col gap-0.5">
              <p className="text-muted-foreground text-xs">
                {action.description}
              </p>
              <Code>{action.template}</Code>
            </div>
          ))}
        </div>
      </Section>
      <Section>
        <SectionHeader>
          <SectionTitle>Templates</SectionTitle>
          <SectionDescription>
            Temos alguns templates para ajudar você a começar. Consulte o
            repositório{" "}
            <Link
              href="https://github.com/openstatusHQ/cli-template"
              target="_blank"
              rel="noopener noreferrer"
            >
              <code>@openstatusHQ/cli-template</code>
            </Link>{" "}
            para ver mais.
          </SectionDescription>
        </SectionHeader>
        <div className="flex flex-col gap-6">
          {templates.map((template, i) => (
            <div key={i} className="flex flex-col gap-0.5">
              <p className="text-muted-foreground text-xs">
                {template.description}
              </p>
              <Code>{template.template}</Code>
            </div>
          ))}
        </div>
      </Section>
    </SectionGroup>
  );
}
