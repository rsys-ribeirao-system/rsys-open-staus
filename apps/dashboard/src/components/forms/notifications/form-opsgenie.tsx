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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@openstatus/ui/components/ui/select";
import { cn } from "@openstatus/ui/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { isTRPCClientError } from "@trpc/client";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import {
  FormCardContent,
  FormCardSeparator,
} from "@/components/forms/form-card";
import { CheckboxTree } from "@/components/ui/checkbox-tree";
import { useTRPC } from "@/lib/trpc/client";

const schema = z.object({
  name: z.string().trim().min(1, "O nome é obrigatório"),
  provider: z.literal("opsgenie"),
  data: z.object({
    apiKey: z.string().trim().min(1, "A chave de API é obrigatória"),
    region: z.enum(["us", "eu"], {
      message: "Selecione uma região",
    }),
  }),
  monitors: z.array(z.number()),
});

type FormValues = z.infer<typeof schema>;

export function FormOpsGenie({
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
      provider: "opsgenie",
      data: {
        apiKey: "",
        region: undefined,
      },
      monitors: [],
    },
  });
  const [isPending, startTransition] = useTransition();
  const trpc = useTRPC();

  const sendTestMutation = useMutation(
    trpc.notification.sendTest.mutationOptions(),
  );

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

    // Validate API key field before sending test
    const data = form.getValues("data");
    if (!data.apiKey || data.apiKey.trim() === "") {
      toast.error("Informe uma chave de API antes de enviar o teste");
      return;
    }

    // Validate region field before sending test
    if (!data.region) {
      toast.error("Selecione uma região antes de enviar o teste");
      return;
    }

    startTransition(async () => {
      try {
        const provider = form.getValues("provider");
        const promise = sendTestMutation.mutateAsync({
          provider,
          data: {
            opsgenie: data,
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
            name="data.apiKey"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Chave de API</FormLabel>
                <FormControl>
                  <Input placeholder="sua-chave-de-api" {...field} />
                </FormControl>
                <FormMessage />
                <FormDescription>
                  Informe sua chave de API do OpsGenie.
                </FormDescription>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="data.region"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Região</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma região" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="us">US</SelectItem>
                    <SelectItem value="eu">EU</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
                <FormDescription>
                  Selecione sua região do OpsGenie.
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
