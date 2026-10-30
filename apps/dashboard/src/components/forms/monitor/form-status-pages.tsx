"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Badge } from "@openstatus/ui/components/ui/badge";
import { Button } from "@openstatus/ui/components/ui/button";
import { Checkbox } from "@openstatus/ui/components/ui/checkbox";
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
import { cn } from "@openstatus/ui/lib/utils";
import { isTRPCClientError } from "@trpc/client";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import {
  EmptyStateContainer,
  EmptyStateTitle,
} from "@/components/content/empty-state";
import {
  FormCard,
  FormCardContent,
  FormCardDescription,
  FormCardFooter,
  FormCardHeader,
  FormCardSeparator,
  FormCardTitle,
} from "@/components/forms/form-card";

const schema = z.object({
  description: z.string().optional(),
  externalName: z.string().optional(),
  statusPages: z.array(z.number()),
});

type FormValues = z.infer<typeof schema>;

export function FormStatusPages({
  defaultValues,
  onSubmit,
  statusPages,
  ...props
}: Omit<React.ComponentProps<"form">, "onSubmit"> & {
  defaultValues?: FormValues;
  onSubmit: (values: FormValues) => Promise<void>;
  statusPages: { id: number; title: string; slug: string }[];
}) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues ?? {
      description: "",
      externalName: "",
      statusPages: [],
    },
  });
  const [isPending, startTransition] = useTransition();
  const watchStatusPages = form.watch("statusPages");

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
      <form onSubmit={form.handleSubmit(submitAction)} {...props}>
        <FormCard>
          <FormCardHeader>
            <FormCardTitle>Páginas de status</FormCardTitle>
            <FormCardDescription>
              Adicione páginas de status ao seu monitor e configure o nome
              externo e a descrição exibidos na página de status.
            </FormCardDescription>
          </FormCardHeader>
          <FormCardContent className="grid gap-4 sm:grid-cols-3">
            <FormField
              control={form.control}
              name="externalName"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Nome externo</FormLabel>
                  <FormControl>
                    <Input placeholder="OpenStatus API" {...field} />
                  </FormControl>
                  <FormDescription>
                    Nome externo na página de status, no feed ou nas
                    notificações dos assinantes. Se não for informado, o nome do
                    monitor será usado.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="sm:col-span-full">
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Input placeholder="Minha página de status" {...field} />
                  </FormControl>
                  <FormDescription>
                    Uma dica com informações extras sobre o monitor será
                    exibida.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </FormCardContent>
          <FormCardSeparator />
          <FormCardContent>
            {statusPages.length > 0 ? (
              <FormField
                control={form.control}
                name="statusPages"
                render={() => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel className="text-base">
                        Lista de páginas de status
                      </FormLabel>
                      <Button
                        variant="ghost"
                        size="sm"
                        type="button"
                        className={cn(
                          watchStatusPages.length === statusPages.length &&
                            "text-muted-foreground",
                        )}
                        onClick={() => {
                          const allSelected = statusPages.every((item) =>
                            watchStatusPages.includes(item.id),
                          );

                          if (!allSelected) {
                            form.setValue(
                              "statusPages",
                              statusPages.map((item) => item.id),
                            );
                          } else {
                            form.setValue("statusPages", []);
                          }
                        }}
                      >
                        Selecionar todas
                      </Button>
                    </div>
                    {statusPages.map((item) => (
                      <FormField
                        key={item.id}
                        control={form.control}
                        name="statusPages"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={item.id}
                              className="flex items-center"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={
                                    field.value?.includes(item.id) || false
                                  }
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([
                                          ...field.value,
                                          item.id,
                                        ])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== item.id,
                                          ),
                                        );
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="text-sm font-normal">
                                {item.title}{" "}
                                <Badge
                                  variant="secondary"
                                  className="px-1.5 py-px font-mono text-[10px]"
                                >
                                  {item.slug}
                                </Badge>
                              </FormLabel>
                            </FormItem>
                          );
                        }}
                      />
                    ))}
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : (
              <EmptyStateContainer>
                <EmptyStateTitle>Nenhuma página de status</EmptyStateTitle>
              </EmptyStateContainer>
            )}
          </FormCardContent>
          <FormCardFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Enviando..." : "Enviar"}
            </Button>
          </FormCardFooter>
        </FormCard>
      </form>
    </Form>
  );
}
