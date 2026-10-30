"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Lock } from "@openstatus/icons";
import { Button } from "@openstatus/ui/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@openstatus/ui/components/ui/form";
import { Input } from "@openstatus/ui/components/ui/input";
import {
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@openstatus/ui/components/ui/tabs";
import { Tabs } from "@openstatus/ui/components/ui/tabs";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Link } from "@/components/common/link";
import { DataTable as InvitationsDataTable } from "@/components/data-table/settings/invitations/data-table";
import { DataTable as MembersDataTable } from "@/components/data-table/settings/members/data-table";
import {
  FormCardContent,
  FormCardDescription,
  FormCardHeader,
  FormCardSeparator,
  FormCardTitle,
  FormCardUpgrade,
} from "@/components/forms/form-card";
import { FormCard } from "@/components/forms/form-card";

import { FormCardFooter, FormCardFooterInfo } from "../form-card";

const schema = z.object({
  email: z.email(),
  role: z.enum(["member"]),
});

type FormValues = z.infer<typeof schema>;

export function FormMembers({
  locked,
  onCreate,
}: {
  locked?: boolean;
  onCreate: (values: FormValues) => Promise<void>;
}) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      role: "member",
    },
  });
  const [isPending, startTransition] = useTransition();

  function submitAction(values: FormValues) {
    if (isPending) return;

    startTransition(async () => {
      try {
        const promise = onCreate(values);
        toast.promise(promise, {
          loading: "Salvando...",
          success: () => "Saved",
          error: "Falha ao salvar",
        });
        await promise;
        form.reset();
      } catch (error) {
        console.error(error);
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(submitAction)}>
        <FormCard id="team-members">
          {locked ? <FormCardUpgrade /> : null}
          <FormCardHeader>
            <FormCardTitle>Equipe</FormCardTitle>
            <FormCardDescription>
              Gerencie os membros da sua equipe.
            </FormCardDescription>
          </FormCardHeader>
          <FormCardContent>
            <Tabs defaultValue="members">
              <TabsList>
                <TabsTrigger value="members">Membros</TabsTrigger>
                <TabsTrigger value="pending">Pendentes</TabsTrigger>
              </TabsList>
              <TabsContent value="members">
                <MembersDataTable />
              </TabsContent>
              <TabsContent value="pending">
                <InvitationsDataTable />
              </TabsContent>
            </Tabs>
          </FormCardContent>
          <FormCardSeparator />
          <FormCardContent>
            <FormField
              control={form.control}
              disabled={locked}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Adicionar membro</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="E-mail"
                      disabled={locked}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                  <FormCardDescription>
                    Envie um convite para entrar na equipe.
                  </FormCardDescription>
                </FormItem>
              )}
            />
          </FormCardContent>
          <FormCardFooter>
            {locked ? (
              <>
                <FormCardFooterInfo>
                  Este recurso está disponível no{" "}
                  <Link
                    href="https://www.openstatus.dev/changelog/team-invites"
                    rel="noreferrer"
                    target="_blank"
                  >
                    plano Starter
                  </Link>
                  .
                </FormCardFooterInfo>
                <Button type="button" size="sm" asChild>
                  <Link href="/settings/billing">
                    <Lock />
                    Fazer upgrade
                  </Link>
                </Button>
              </>
            ) : (
              <Button type="submit" size="sm" disabled={isPending}>
                {isPending ? "Enviando..." : "Enviar"}
              </Button>
            )}
          </FormCardFooter>
        </FormCard>
      </form>
    </Form>
  );
}
