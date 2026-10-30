"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import {
  EmptyStateDescription,
  EmptyStateTitle,
} from "@/components/content/empty-state";
import { EmptyStateContainer } from "@/components/content/empty-state";
import {
  Section,
  SectionGroup,
  SectionHeader,
  SectionTitle,
} from "@/components/content/section";
import { FormGeneral } from "@/components/forms/status-page/form-general";
import { useTRPC } from "@/lib/trpc/client";

export function Client() {
  const [isPending, startTransition] = useTransition();
  const trpc = useTRPC();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { refetch } = useQuery(trpc.page.list.queryOptions());
  const createStatusPageMutation = useMutation(
    trpc.page.new.mutationOptions({
      onSuccess: (data) => {
        refetch();
        queryClient.invalidateQueries({
          queryKey: trpc.workspace.usage.queryKey(),
        });
        startTransition(() => {
          router.push(`/status-pages/${data.id}/edit`);
        });
      },
    }),
  );

  return (
    <SectionGroup>
      <Section>
        <SectionHeader>
          <SectionTitle>Criar página de status</SectionTitle>
        </SectionHeader>
        <FormGeneral
          disabled={isPending}
          onSubmit={async (values) => {
            await createStatusPageMutation.mutateAsync({
              title: values.title,
              slug: values.slug,
              icon: values.icon,
              description: values.description,
            });
          }}
        />
      </Section>
      <Section>
        <EmptyStateContainer>
          <EmptyStateTitle>Crie e comece a personalizar</EmptyStateTitle>
          <EmptyStateDescription>
            Conecte seus <span className="text-foreground">monitores</span>,
            configure um{" "}
            <span className="text-foreground">domínio personalizado</span>,{" "}
            <span className="text-foreground">proteja com senha</span> e mais...
          </EmptyStateDescription>
        </EmptyStateContainer>
      </Section>
    </SectionGroup>
  );
}
