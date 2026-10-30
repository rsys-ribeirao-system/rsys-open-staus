"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Lock } from "@openstatus/icons";
import { Button } from "@openstatus/ui/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormMessage,
} from "@openstatus/ui/components/ui/form";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@openstatus/ui/components/ui/input-group";
import { Label } from "@openstatus/ui/components/ui/label";
import { isTRPCClientError } from "@trpc/client";
import type React from "react";
import { useEffect, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Link } from "@/components/common/link";
import DomainConfiguration from "@/components/domains/domain-configuration";
import { useDomainStatus } from "@/components/domains/use-domain-status";
import {
  FormCard,
  FormCardContent,
  FormCardDescription,
  FormCardFooter,
  FormCardFooterInfo,
  FormCardHeader,
  FormCardSeparator,
  FormCardTitle,
  FormCardUpgrade,
} from "@/components/forms/form-card";

const schema = z.object({
  domain: z.string(),
});

type FormValues = z.infer<typeof schema>;

export function FormCustomDomain({
  locked,
  defaultValues,
  onSubmit,
  ...props
}: Omit<React.ComponentProps<"form">, "onSubmit"> & {
  locked?: boolean;
  defaultValues?: FormValues;
  onSubmit: (values: FormValues) => Promise<void>;
}) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues ?? {
      domain: undefined,
    },
  });
  const [isPending, startTransition] = useTransition();
  const { refresh, isLoading } = useDomainStatus(defaultValues?.domain);

  function submitAction(values: FormValues) {
    if (isPending) return;

    startTransition(async () => {
      try {
        const promise = onSubmit(values);
        toast.promise(promise, {
          loading: "Salvando...",
          success: () => "Salvo",
          error: (error) => {
            if (isTRPCClientError(error)) {
              return error.message;
            }
            return "Falha ao salvar";
          },
        });
        await promise;
      } catch (error) {
        console.error(error);
      }
    });
  }

  // NOTE: poll every 30 seconds to check for the status
  useEffect(() => {
    const interval = setInterval(() => refresh(), 30_000);
    return () => clearInterval(interval);
  }, [refresh]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(submitAction)} {...props}>
        <FormCard>
          {locked ? <FormCardUpgrade /> : null}
          <FormCardHeader>
            <FormCardTitle>Domínio personalizado</FormCardTitle>
            <FormCardDescription>
              Use seu próprio domínio na sua página de status.
            </FormCardDescription>
          </FormCardHeader>
          <FormCardContent>
            <FormField
              control={form.control}
              name="domain"
              render={({ field }) => (
                <FormItem>
                  <Label>Domínio</Label>
                  <InputGroup>
                    <InputGroupAddon align="inline-start">
                      https://
                    </InputGroupAddon>
                    <InputGroupInput
                      placeholder="status.openstatus.dev"
                      disabled={locked}
                      {...field}
                    />
                  </InputGroup>
                  <FormMessage />
                </FormItem>
              )}
            />
          </FormCardContent>
          {defaultValues?.domain ? (
            <>
              <FormCardSeparator />
              <FormCardContent>
                <DomainConfiguration domain={defaultValues?.domain} />
              </FormCardContent>
            </>
          ) : null}
          <FormCardFooter>
            <FormCardFooterInfo>
              Saiba mais sobre{" "}
              <Link
                href="https://www.openstatus.dev/docs/reference/status-page/#custom-domain"
                rel="noreferrer"
                target="_blank"
              >
                Domínio personalizado
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
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  disabled={isPending || isLoading}
                  onClick={refresh}
                  className="hidden sm:block"
                >
                  {isLoading ? "Atualizando..." : "Atualizar configuração"}
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Enviando..." : "Enviar"}
                </Button>
              </div>
            )}
          </FormCardFooter>
        </FormCard>
      </form>
    </Form>
  );
}
