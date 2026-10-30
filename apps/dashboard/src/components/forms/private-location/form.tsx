"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Add, Check, Close, Copy } from "@openstatus/icons";
import { Button } from "@openstatus/ui/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@openstatus/ui/components/ui/form";
import { Input } from "@openstatus/ui/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@openstatus/ui/components/ui/input-group";
import { useCopyToClipboard } from "@openstatus/ui/hooks/use-copy-to-clipboard";
import { cn } from "@openstatus/ui/lib/utils";
import { isTRPCClientError } from "@trpc/client";
import React, { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import {
  EmptyStateContainer,
  EmptyStateTitle,
} from "@/components/content/empty-state";
import {
  FormCardContent,
  FormCardSeparator,
} from "@/components/forms/form-card";
import { useFormSheetDirty } from "@/components/forms/form-sheet";
import { CheckboxTree } from "@/components/ui/checkbox-tree";

const schema = z.object({
  name: z.string().min(1, "O nome é obrigatório"),
  token: z.string(),
  monitors: z.array(z.number()),
  metadata: z
    .array(
      z.object({
        key: z.string().min(1, "A chave é obrigatória").max(64),
        value: z.string().max(256),
      }),
    )
    .max(20, "No máximo 20 entradas de metadados")
    .refine(
      (rows) => new Set(rows.map((r) => r.key)).size === rows.length,
      "As chaves de metadados devem ser únicas",
    ),
});

export type FormValues = z.infer<typeof schema>;

export function FormPrivateLocation({
  defaultValues,
  onSubmit,
  className,
  monitors,
  ...props
}: Omit<React.ComponentProps<"form">, "onSubmit"> & {
  defaultValues?: FormValues;
  monitors: { id: number; name: string; url: string }[];
  onSubmit: (values: FormValues) => Promise<void>;
}) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues ?? {
      name: "",
      token: crypto.randomUUID(),
      monitors: [],
      metadata: [],
    },
  });
  const [isPending, startTransition] = useTransition();
  const { copy, isCopied } = useCopyToClipboard();
  const { setIsDirty } = useFormSheetDirty();

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

  return (
    <Form {...form}>
      <form
        className={cn("grid gap-4", className)}
        onSubmit={form.handleSubmit(submitAction)}
        {...props}
      >
        <FormCardContent>
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome</FormLabel>
                <FormControl>
                  <Input placeholder="Meu Raspberry Pi" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </FormCardContent>
        <FormCardSeparator />
        <FormCardContent>
          <FormField
            control={form.control}
            name="token"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Token</FormLabel>
                <FormControl>
                  <InputGroup>
                    <InputGroupInput
                      placeholder="Token da localização privada"
                      readOnly
                      value={field.value}
                    />
                    <InputGroupAddon align="inline-end">
                      <InputGroupButton
                        aria-label="Copiar"
                        title="Copiar"
                        size="icon-xs"
                        onClick={() => {
                          copy(field.value, {
                            successMessage:
                              "Token copiado para a área de transferência",
                          });
                        }}
                      >
                        {isCopied ? <Check /> : <Copy />}
                      </InputGroupButton>
                    </InputGroupAddon>
                  </InputGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
                  Os monitores conectados serão ativados automaticamente para a
                  localização privada.
                </FormDescription>
                {monitors.length ? (
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
                ) : (
                  <EmptyStateContainer>
                    <EmptyStateTitle>Nenhum monitor encontrado</EmptyStateTitle>
                  </EmptyStateContainer>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        </FormCardContent>
        <FormCardSeparator />
        <FormCardContent>
          <FormField
            control={form.control}
            name="metadata"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Metadados</FormLabel>
                <FormDescription>
                  Rótulos opcionais de chave/valor para armazenar informações
                  personalizadas sobre esta localização.
                </FormDescription>
                {field.value.map((entry, index) => (
                  <div key={index} className="grid gap-2 sm:grid-cols-5">
                    <Input
                      placeholder="Chave"
                      className="col-span-2"
                      value={entry.key}
                      onChange={(e) => {
                        const next = [...field.value];
                        next[index] = { ...next[index], key: e.target.value };
                        field.onChange(next);
                      }}
                    />
                    <Input
                      placeholder="Valor"
                      className="col-span-2"
                      value={entry.value}
                      onChange={(e) => {
                        const next = [...field.value];
                        next[index] = { ...next[index], value: e.target.value };
                        field.onChange(next);
                      }}
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      type="button"
                      aria-label="Remover entrada de metadados"
                      onClick={() => {
                        field.onChange(
                          field.value.filter((_, i) => i !== index),
                        );
                      }}
                    >
                      <Close />
                    </Button>
                  </div>
                ))}
                <div>
                  <Button
                    size="sm"
                    variant="outline"
                    type="button"
                    disabled={field.value.length >= 20}
                    onClick={() => {
                      field.onChange([...field.value, { key: "", value: "" }]);
                    }}
                  >
                    <Add />
                    Adicionar metadados
                  </Button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </FormCardContent>
      </form>
    </Form>
  );
}
