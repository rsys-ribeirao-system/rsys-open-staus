"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@openstatus/ui/components/ui/button";
import { Checkbox } from "@openstatus/ui/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@openstatus/ui/components/ui/form";
import { Input } from "@openstatus/ui/components/ui/input";
import { SelectItem } from "@openstatus/ui/components/ui/select";
import {
  SelectContent,
  SelectValue,
} from "@openstatus/ui/components/ui/select";
import { SelectTrigger } from "@openstatus/ui/components/ui/select";
import { Select } from "@openstatus/ui/components/ui/select";
import { Textarea } from "@openstatus/ui/components/ui/textarea";
import { cn } from "@openstatus/ui/lib/utils";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

export const types = [
  {
    label: "Reportar um bug",
    value: "bug" as const,
  },
  {
    label: "Agendar uma demonstração",
    value: "demo" as const,
  },
  {
    label: "Sugerir um recurso",
    value: "feature" as const,
  },
  {
    label: "Reportar um problema de segurança",
    value: "security" as const,
  },
  {
    label: "Outro assunto",
    value: "question" as const,
  },
];

export const schema = z.object({
  name: z.string().min(1, {
    error: "O nome é obrigatório",
  }),
  type: z.enum(["bug", "demo", "feature", "security", "question"]),
  email: z.email({
    error: "Endereço de e-mail inválido",
  }),
  message: z.string().min(1, {
    error: "A mensagem é obrigatória",
  }),
  blocker: z.boolean(),
});

export type FormValues = z.infer<typeof schema>;

interface ContactFormProps {
  defaultValues?: Partial<FormValues>;
  onSubmit: (data: FormValues) => Promise<void>;
  className?: string;
}

export function ContactForm({
  defaultValues,
  onSubmit,
  className,
}: ContactFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: defaultValues?.name ?? "",
      email: defaultValues?.email ?? "",
      type: defaultValues?.type ?? undefined,
      message: defaultValues?.message ?? "",
      blocker: defaultValues?.blocker ?? false,
    },
  });
  const [isPending, startTransition] = useTransition();
  const watchType = form.watch("type");

  async function submitAction(values: FormValues) {
    if (isPending) return;

    startTransition(async () => {
      try {
        const promise = onSubmit(values);
        toast.promise(promise, {
          loading: "Enviando mensagem...",
          success: "Mensagem enviada. Retornaremos em breve.",
          error: "Falha ao enviar a mensagem. Tente novamente.",
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
        onSubmit={form.handleSubmit(submitAction)}
        className={cn("grid gap-4 sm:grid-cols-2", className)}
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input placeholder="Max" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>E-mail</FormLabel>
              <FormControl>
                <Input placeholder="max@openstatus.dev" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem className="sm:col-span-full">
              <FormLabel>Tipo</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Com o que você precisa de ajuda" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {types.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        {watchType ? (
          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem className="sm:col-span-full">
                <FormLabel>Mensagem</FormLabel>
                <FormControl>
                  <Textarea placeholder="Conte para nós..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ) : null}
        {watchType === "bug" ? (
          <FormField
            control={form.control}
            name="blocker"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start sm:col-span-full">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel className="leading-none font-normal">
                  Este bug me impede de usar o produto.
                </FormLabel>
              </FormItem>
            )}
          />
        ) : null}
        <Button
          type="submit"
          className="w-full sm:col-span-full"
          disabled={isPending}
        >
          {isPending ? "Enviando..." : "Enviar"}
        </Button>
      </form>
    </Form>
  );
}
