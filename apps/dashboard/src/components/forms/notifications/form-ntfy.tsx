"use client";

import { zodResolver } from "@hookform/resolvers/zod";
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
import React, { useTransition } from "react";
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
  provider: z.literal("ntfy"),
  data: z.record(z.string(), z.string()),
  monitors: z.array(z.number()),
});

type FormValues = z.infer<typeof schema>;

export function FormNtfy({
  defaultValues,
  onSubmit,
  className,
  monitors,
  ...props
}: Omit<React.ComponentProps<"form">, "onSubmit"> & {
  defaultValues?: FormValues;
  onSubmit: (values: FormValues) => Promise<void>;
  monitors: { id: number; name: string }[];
}) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues ?? {
      name: "",
      provider: "ntfy",
      data: {
        topic: "",
        serverUrl: "",
        token: "",
      },
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

    // Validate topic field before sending test
    const data = form.getValues("data");
    if (!data.topic || data.topic.trim() === "") {
      toast.error("Informe um tópico antes de enviar o teste");
      return;
    }

    startTransition(async () => {
      try {
        const provider = form.getValues("provider");
        const promise = sendTestMutation.mutateAsync({
          provider,
          data: {
            ntfy: data,
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
            name="data.topic"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tópico</FormLabel>
                <FormControl>
                  <Input placeholder="seu-topico" {...field} />
                </FormControl>
                <FormMessage />
                <FormDescription>
                  Informe o tópico das suas notificações do ntfy.
                </FormDescription>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="data.serverUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>URL do servidor</FormLabel>
                <FormControl>
                  <Input placeholder="https://ntfy.sh" {...field} />
                </FormControl>
                <FormMessage />
                <FormDescription>
                  Informe a URL do servidor ntfy. Deixe em branco para usar o
                  padrão.
                </FormDescription>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="data.token"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bearer Token</FormLabel>
                <FormControl>
                  <Input placeholder="tk_iloveopenstatus" {...field} />
                </FormControl>
                <FormMessage />
                <FormDescription>
                  Informe o bearer token para autenticação.
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
