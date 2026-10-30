"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { PagerDutySchema } from "@openstatus/notification-pagerduty";
import { Button } from "@openstatus/ui/components/ui/button";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@openstatus/ui/components/ui/form";
import { Form } from "@openstatus/ui/components/ui/form";
import { Input } from "@openstatus/ui/components/ui/input";
import { cn } from "@openstatus/ui/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { isTRPCClientError } from "@trpc/client";
import { parseAsString, useQueryState } from "nuqs";
import React, { useEffect, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import {
  FormCardContent,
  FormCardSeparator,
} from "@/components/forms/form-card";
import { useFormSheetDirty } from "@/components/forms/form-sheet";
import { CheckboxTree } from "@/components/ui/checkbox-tree";
import { useTRPC } from "@/lib/trpc/client";

const schema = z.object({
  name: z.string().trim().min(1, "O nome é obrigatório"),
  provider: z.literal("pagerduty"),
  data: z.string().trim().min(1, "PagerDuty configuration is required"),
  monitors: z.array(z.number()),
});

type FormValues = z.infer<typeof schema>;

export function FormPagerDuty({
  monitors,
  defaultValues,
  onSubmit,
  className,
  ...props
}: Omit<React.ComponentProps<"form">, "onSubmit"> & {
  defaultValues?: FormValues;
  onSubmit: (values: FormValues) => Promise<void>;
  monitors: { id: number; name: string }[];
}) {
  const [searchConfig] = useQueryState("config", parseAsString);
  console.log(searchConfig);
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues ?? {
      name: "",
      provider: "pagerduty",
      data: "",
      monitors: [],
    },
  });
  const [isPending, startTransition] = useTransition();
  const { setIsDirty } = useFormSheetDirty();
  const trpc = useTRPC();

  const sendTestMutation = useMutation(
    trpc.notification.sendTest.mutationOptions(),
  );

  const formIsDirty = form.formState.isDirty;
  React.useEffect(() => {
    setIsDirty(formIsDirty);
  }, [formIsDirty, setIsDirty]);

  useEffect(() => {
    if (searchConfig) {
      const data = PagerDutySchema.safeParse(JSON.parse(searchConfig));
      if (data.success) {
        form.setValue("data", JSON.stringify(data.data));
      } else {
        toast.error("Configuração do PagerDuty inválida");
      }
    }
  }, [searchConfig, form]);

  function submitAction(values: FormValues) {
    if (isPending) return;

    startTransition(async () => {
      try {
        const promise = onSubmit(values);
        toast.promise(promise, {
          loading: "Salvando...",
          success: "Salvo",
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

  function testAction() {
    if (isPending) return;

    startTransition(async () => {
      try {
        const provider = form.getValues("provider");
        const data = form.getValues("data");
        if (!data || data.trim() === "") {
          toast.error(
            "Informe a configuração do PagerDuty antes de enviar o teste",
          );
          return;
        }
        const promise = sendTestMutation.mutateAsync({
          provider,
          data: {
            pagerduty: data,
          },
        });
        toast.promise(promise, {
          loading: "Enviando teste...",
          success: "Teste enviado",
          error: (error) => {
            if (error instanceof Error) {
              return error.message;
            }
            return "Falha ao enviar teste";
          },
        });
        await promise;
      } catch (error) {
        console.error(error);
      }
    });
  }

  return (
    <Form {...form}>
      <form
        className={cn("grid gap-4", className)}
        onSubmit={form.handleSubmit(submitAction)}
        {...props}
      >
        <FormCardContent className="grid gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome</FormLabel>
                <FormControl>
                  <Input placeholder="Meu canal de notificação" {...field} />
                </FormControl>
                <FormMessage />
                <FormDescription>
                  Informe um nome descritivo para o seu canal de notificação.
                </FormDescription>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="data"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Configuração</FormLabel>
                <FormControl>
                  <Input placeholder="..." disabled {...field} />
                </FormControl>
                <FormMessage />
                <FormDescription>
                  A configuração do PagerDuty em uso.
                </FormDescription>
              </FormItem>
            )}
          />
          <div>
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={testAction}
            >
              Enviar teste
            </Button>
          </div>
        </FormCardContent>
        <FormCardSeparator />
        <FormCardContent>
          <FormField
            control={form.control}
            name="monitors"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Monitores</FormLabel>
                <FormDescription>
                  Selecione os monitores que você deseja notificar.
                </FormDescription>
                <FormControl>
                  <CheckboxTree
                    items={[
                      {
                        id: -1,
                        label: "Selecionar todos",
                        children: monitors.map((m) => ({
                          id: m.id,
                          label: m.name,
                        })),
                      },
                    ]}
                    value={field.value ?? []}
                    onValueChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </FormCardContent>
      </form>
    </Form>
  );
}
