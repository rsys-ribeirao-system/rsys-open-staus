"use client";

import { Button } from "@openstatus/ui/components/ui/button";
import { useQuery } from "@tanstack/react-query";

import { Link } from "@/components/common/link";
import {
  EmptyStateDescription,
  EmptyStateTitle,
} from "@/components/content/empty-state";
import { EmptyStateContainer } from "@/components/content/empty-state";
import { DataTable } from "@/components/data-table/settings/api-key/data-table";
import { CreateApiKeyDialog } from "@/components/forms/api-key/dialog";
import {
  FormCard,
  FormCardContent,
  FormCardDescription,
  FormCardFooter,
  FormCardFooterInfo,
  FormCardHeader,
  FormCardTitle,
} from "@/components/forms/form-card";
import { useTRPC } from "@/lib/trpc/client";

// we should prefetch the api key on the server (layout)

export function FormApiKey() {
  const trpc = useTRPC();
  const { data: apiKeys = [], refetch } = useQuery(
    trpc.apiKey.list.queryOptions(),
  );

  return (
    <FormCard id="api-keys">
      <FormCardHeader>
        <FormCardTitle>Chaves de API</FormCardTitle>
        <FormCardDescription>
          Crie e gerencie suas chaves de API.
        </FormCardDescription>
      </FormCardHeader>
      <FormCardContent>
        {apiKeys.length === 0 ? (
          <EmptyStateContainer>
            <EmptyStateTitle>Nenhuma chave de API</EmptyStateTitle>
            <EmptyStateDescription>
              Acesse seus dados via API.
            </EmptyStateDescription>
          </EmptyStateContainer>
        ) : (
          <DataTable apiKeys={apiKeys} refetch={refetch} />
        )}
      </FormCardContent>
      <FormCardFooter>
        <FormCardFooterInfo>
          Dispare monitores via CLI, CI/CD ou crie sua própria página de status.{" "}
          <Link
            href="https://api.openstatus.dev/v1"
            rel="noreferrer"
            target="_blank"
          >
            Saiba mais
          </Link>
          .
        </FormCardFooterInfo>
        <CreateApiKeyDialog>
          <Button size="sm">Criar</Button>
        </CreateApiKeyDialog>
      </FormCardFooter>
    </FormCard>
  );
}
