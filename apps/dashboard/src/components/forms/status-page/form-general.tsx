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
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@openstatus/ui/components/ui/input-group";
import { Textarea } from "@openstatus/ui/components/ui/textarea";
import { useDebounce } from "@openstatus/ui/hooks/use-debounce";
import { useMutation, useQuery } from "@tanstack/react-query";
import { isTRPCClientError } from "@trpc/client";
import Image from "next/image";
import { useEffect, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import {
  FormCard,
  FormCardContent,
  FormCardDescription,
  FormCardFooter,
  FormCardHeader,
  FormCardSeparator,
  FormCardTitle,
} from "@/components/forms/form-card";
import { useTRPC } from "@/lib/trpc/client";

const SLUG_UNIQUE_ERROR_MESSAGE = "Este slug já está em uso. Escolha outro.";

// Keep in sync with `slugSchema` in
// `packages/db/src/schema/pages/validation.ts`. We can't import that on the
// client because `@openstatus/db` is server-only. Slugs are stored lowercase
// (subdomains are case-insensitive), so we restrict input client-side too.
const SLUG_PATTERN = /^[a-z0-9-]+$/;
const SLUG_PATTERN_MESSAGE =
  "Use apenas dígitos (0-9), hífen (-) ou letras minúsculas (a-z).";

function formatSlug(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const schema = z.object({
  title: z.string().trim().min(1, "O título é obrigatório"),
  slug: z
    .string()
    .min(3, "O slug é obrigatório")
    .regex(SLUG_PATTERN, SLUG_PATTERN_MESSAGE),
  icon: z.string().optional(),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

/** Convert a File to a base64 string without the data: prefix */
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // result is like "data:image/png;base64,XXXX" – we only need the part after the comma
      resolve(result.split(",")[1] || "");
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function FormGeneral({
  disabled,
  defaultValues,
  onSubmit,
  ...props
}: Omit<React.ComponentProps<"form">, "onSubmit"> & {
  defaultValues?: FormValues;
  onSubmit: (values: FormValues) => Promise<void>;
  disabled?: boolean;
}) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues ?? {
      title: "",
      slug: "",
      icon: undefined,
      description: "",
    },
  });
  const [isPending, startTransition] = useTransition();
  const trpc = useTRPC();
  const uploadMutation = useMutation(trpc.blob.upload.mutationOptions());
  const watchSlug = form.watch("slug");
  const watchTitle = form.watch("title");
  const watchIcon = form.watch("icon");
  const debouncedSlug = useDebounce(watchSlug, 500);
  const { data: isUnique } = useQuery(
    trpc.page.getSlugUniqueness.queryOptions(
      { slug: debouncedSlug },
      { enabled: debouncedSlug.length > 0 },
    ),
  );

  useEffect(() => {
    if (!defaultValues?.title) {
      const formattedSlug = formatSlug(watchTitle);
      form.setValue("slug", formattedSlug);
    }
  }, [form, defaultValues?.title, watchTitle]);

  useEffect(() => {
    if (isUnique === undefined) return;
    if (defaultValues?.slug === debouncedSlug) return;

    if (!isUnique) {
      form.setError("slug", { message: SLUG_UNIQUE_ERROR_MESSAGE });
    } else {
      form.clearErrors("slug");
    }
  }, [isUnique, form, debouncedSlug, defaultValues?.slug]);

  function submitAction(values: FormValues) {
    if (isPending || disabled) return;

    startTransition(async () => {
      try {
        if (isUnique === false && defaultValues?.slug !== values.slug) {
          toast.error(SLUG_UNIQUE_ERROR_MESSAGE);
          form.setError("slug", { message: SLUG_UNIQUE_ERROR_MESSAGE });
          return;
        }

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
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(submitAction)} {...props}>
        <FormCard>
          <FormCardHeader>
            <FormCardTitle>Geral</FormCardTitle>
            <FormCardDescription>
              Configure os detalhes essenciais da sua página de status.
            </FormCardDescription>
          </FormCardHeader>
          <FormCardSeparator />
          <FormCardContent className="grid gap-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título</FormLabel>
                  <FormControl>
                    <Input placeholder="Minha página de status" {...field} />
                  </FormControl>
                  <FormMessage />
                  <FormDescription>
                    Informe um nome descritivo para sua página de status.
                  </FormDescription>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug</FormLabel>
                  <InputGroup>
                    <FormControl>
                      <InputGroupInput placeholder="status" {...field} />
                    </FormControl>
                    <InputGroupAddon align="inline-end">
                      .openstatus.dev
                    </InputGroupAddon>
                  </InputGroup>
                  <FormMessage />
                  <FormDescription>
                    Escolha um subdomínio único para sua página de status
                    (mínimo de 3 caracteres).
                  </FormDescription>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="icon"
              render={() => (
                <FormItem>
                  <FormLabel>Ícone</FormLabel>
                  <FormControl>
                    <div className="flex items-center space-x-2">
                      {watchIcon ? (
                        <>
                          <div className="bg-muted size-[36px] overflow-hidden rounded-md border">
                            <Image
                              src={watchIcon}
                              width={36}
                              height={36}
                              alt="Pré-visualização do ícone"
                            />
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            type="button"
                            onClick={() => form.setValue("icon", undefined)}
                          >
                            Remover
                          </Button>
                        </>
                      ) : (
                        <Input
                          type="file"
                          accept="image/png,image/x-icon,image/svg+xml"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const base64String = await fileToBase64(file);
                            try {
                              const blob = await uploadMutation.mutateAsync({
                                filename: file.name,
                                file: base64String,
                              });
                              if (blob?.url) {
                                form.setValue("icon", blob.url as string);
                              }
                            } catch (err) {
                              console.error(err);
                              toast.error("Falha no upload");
                            }
                          }}
                        />
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                  <FormDescription>
                    Selecione um ícone para sua página de status. PNG/ICO:
                    512x512px recomendado. SVG também é suportado. Será usado
                    como favicon.
                  </FormDescription>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                  <FormDescription>
                    Descreva brevemente o propósito da sua página de status.
                  </FormDescription>
                </FormItem>
              )}
            />
          </FormCardContent>
          <FormCardFooter>
            <Button type="submit" disabled={isPending || disabled}>
              {isPending ? "Enviando..." : "Enviar"}
            </Button>
          </FormCardFooter>
        </FormCard>
      </form>
    </Form>
  );
}
