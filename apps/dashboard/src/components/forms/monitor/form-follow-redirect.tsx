"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@openstatus/ui/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@openstatus/ui/components/ui/form";
import { Switch } from "@openstatus/ui/components/ui/switch";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Link } from "@/components/common/link";
import {
  FormCard,
  FormCardContent,
  FormCardDescription,
  FormCardFooter,
  FormCardFooterInfo,
  FormCardHeader,
  FormCardTitle,
} from "@/components/forms/form-card";

export const FOLLOW_REDIRECTS_DEFAULT = true;

const schema = z.object({
  followRedirects: z.boolean().prefault(true),
});

type FormValues = z.input<typeof schema>;

export function FormFollowRedirect({
  defaultValues,
  onSubmit,
  ...props
}: Omit<React.ComponentProps<"form">, "onSubmit"> & {
  defaultValues?: FormValues;
  onSubmit: (values: FormValues) => Promise<void>;
}) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues ?? {
      followRedirects: FOLLOW_REDIRECTS_DEFAULT,
    },
  });
  const [isPending, startTransition] = useTransition();

  function submitAction(values: FormValues) {
    if (isPending) return;

    startTransition(async () => {
      try {
        const promise = onSubmit(values);
        toast.promise(promise, {
          loading: "Salvando...",
          success: "Salvo",
          error: "Falha ao salvar",
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
            <FormCardTitle>Seguir redirecionamentos</FormCardTitle>
            <FormCardDescription>
              Configure se os redirecionamentos devem ser seguidos.
            </FormCardDescription>
          </FormCardHeader>
          <FormCardContent className="grid gap-4">
            <FormField
              control={form.control}
              name="followRedirects"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between">
                  <div className="space-y-0.5">
                    <FormLabel>Seguir redirecionamentos</FormLabel>
                    <FormDescription>
                      Quando ativado, o monitor seguirá automaticamente os
                      redirecionamentos HTTP (códigos de status 3xx) até o
                      destino final. Isso é útil ao monitorar URLs que podem
                      redirecionar para outros locais.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </FormCardContent>
          <FormCardFooter>
            <FormCardFooterInfo>
              Saiba mais sobre{" "}
              <Link
                href="https://www.openstatus.dev/docs/monitoring/customization/follow-redirects/"
                rel="noreferrer"
                target="_blank"
              >
                seguir redirecionamentos
              </Link>
              .
            </FormCardFooterInfo>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Enviando..." : "Enviar"}
            </Button>
          </FormCardFooter>
        </FormCard>
      </form>
    </Form>
  );
}
