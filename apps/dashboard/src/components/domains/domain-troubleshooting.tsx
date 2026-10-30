"use client";

import { ExternalLink } from "@openstatus/icons";
import { Button } from "@openstatus/ui/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@openstatus/ui/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@openstatus/ui/components/ui/collapsible";
import { useState } from "react";

import { Link } from "@/components/common/link";

import { InlineSnippet } from "./domain-configuration";

const tools = [
  {
    label: "Let's Debug",
    href: (domain: string) =>
      `https://letsdebug.net/${encodeURIComponent(domain)}`,
    description: "Diagnostique falhas de emissão do Let's Encrypt.",
  },
  {
    label: "DNSViz",
    href: (domain: string) =>
      `https://dnsviz.net/d/${encodeURIComponent(domain)}/dnssec/`,
    description: "Visualize o comportamento de DNS e DNSSEC.",
  },
  {
    label: "DNS Checker",
    href: (domain: string) =>
      `https://dnschecker.org/#A/${encodeURIComponent(domain)}`,
    description: "Verifique a propagação global do DNS.",
  },
  {
    label: "Google Public DNS",
    href: (domain: string) =>
      `https://dns.google/query?name=${encodeURIComponent(domain)}&rr_type=A`,
    description: "Resolva registros usando um resolvedor público.",
  },
] as const;

export function DomainTroubleshooting({ domain }: { domain: string }) {
  const [open, setOpen] = useState(false);
  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="w-full cursor-pointer rounded-xl">
        <Card className="gap-0 border-dashed py-0 text-left shadow-none">
          <CardHeader className="px-4 py-3 select-none">
            <CardTitle className="text-sm">Solução de problemas</CardTitle>
            <CardDescription>
              Se a configuração continuar pendente ou inválida por mais de
              alguns minutos, normalmente a causa é uma destas.
            </CardDescription>
          </CardHeader>
          <CollapsibleContent
            onClick={(e) => e.stopPropagation()}
            className="cursor-auto"
          >
            <CardContent className="space-y-4 px-4 pb-4">
              <ul className="list-disc space-y-2 pl-5 text-sm">
                <li>
                  <span className="font-medium">
                    Registros CAA bloqueiam o Let's Encrypt.
                  </span>{" "}
                  Se o seu domínio tiver algum registro{" "}
                  <InlineSnippet>CAA</InlineSnippet>, um deles precisa permitir{" "}
                  <InlineSnippet>letsencrypt.org</InlineSnippet>. Verifique com{" "}
                  <InlineSnippet>{`dig CAA ${domain}`}</InlineSnippet>.
                </li>
                <li>
                  <span className="font-medium">
                    Registro <InlineSnippet>_acme-challenge</InlineSnippet>{" "}
                    antigo.
                  </span>{" "}
                  Um registro TXT que sobrou de um provedor anterior pode
                  bloquear a emissão. Verifique com{" "}
                  <InlineSnippet>{`dig TXT _acme-challenge.${domain}`}</InlineSnippet>
                  .
                </li>
                <li>
                  <span className="font-medium">
                    Registro <InlineSnippet>AAAA</InlineSnippet> apontando para
                    outro lugar.
                  </span>{" "}
                  IPv6 não é suportado em domínios personalizados; remova todos
                  os registros <InlineSnippet>AAAA</InlineSnippet> do domínio.
                </li>
                <li>
                  <span className="font-medium">
                    Scripts ou proxy de DNS interferem no desafio.
                  </span>{" "}
                  Recursos como scripts do Bunny DNS ou o proxy (nuvem laranja)
                  da Cloudflare podem retornar respostas diferentes para a
                  autoridade certificadora e para o seu navegador. Desative-os
                  para o registro e tente novamente.
                </li>
                <li>
                  <span className="font-medium">
                    CNAME copiado incorretamente.
                  </span>{" "}
                  Não inclua o domínio no campo{" "}
                  <InlineSnippet>Name</InlineSnippet> e mantenha o ponto final
                  no valor se o seu provedor exigir.
                </li>
                <li>
                  <span className="font-medium">O DNS ainda não propagou.</span>{" "}
                  As alterações podem levar até uma hora (mais, se o TTL
                  anterior era alto).
                </li>
              </ul>
              <div className="space-y-2">
                <p className="text-sm font-medium">
                  Executar diagnósticos externos
                </p>
                <div className="flex flex-wrap gap-2">
                  {tools.map((tool) => (
                    <Button
                      key={tool.label}
                      variant="outline"
                      size="sm"
                      asChild
                    >
                      <Link
                        href={tool.href(domain)}
                        target="_blank"
                        rel="noreferrer"
                        title={tool.description}
                      >
                        {tool.label}
                        <ExternalLink className="ml-1 h-3 w-3" />
                      </Link>
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </CollapsibleTrigger>
    </Collapsible>
  );
}
