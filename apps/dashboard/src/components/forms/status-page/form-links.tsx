import { zodResolver } from "@hookform/resolvers/zod";
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
import { isTRPCClientError } from "@trpc/client";
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

const schema = z.object({
  homepageUrl: z.string().optional(),
  contactUrl: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export function FormLinks({
  defaultValues,
  onSubmit,
}: {
  defaultValues?: FormValues;
  onSubmit: (values: FormValues) => Promise<void>;
}) {
  const [isPending, startTransition] = useTransition();
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues ?? {
      homepageUrl: "",
      contactUrl: "",
    },
  });

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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(submitAction)}>
        <FormCard>
          <FormCardHeader>
            <FormCardTitle>Links</FormCardTitle>
            <FormCardDescription>
              Configure os links da página de status.
            </FormCardDescription>
          </FormCardHeader>
          <FormCardContent className="grid gap-4 sm:grid-cols-3">
            <FormField
              control={form.control}
              name="homepageUrl"
              render={({ field }) => (
                <FormItem className="sm:col-span-full">
                  <FormLabel>URL da página inicial</FormLabel>
                  <FormControl>
                    <Input placeholder="https://acme.com" {...field} />
                  </FormControl>
                  <FormMessage />
                  <FormDescription>
                    Para qual URL o logo deve apontar? Deixe vazio para ocultar.
                  </FormDescription>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="contactUrl"
              render={({ field }) => (
                <FormItem className="sm:col-span-full">
                  <FormLabel>URL de contato</FormLabel>
                  <FormControl>
                    <Input placeholder="https://acme.com/contact" {...field} />
                  </FormControl>
                  <FormMessage />
                  <FormDescription>
                    Informe a URL da sua página de contato. Ou comece com{" "}
                    <code className="bg-muted rounded-md px-1 py-0.5">
                      mailto:
                    </code>{" "}
                    para abrir o cliente de e-mail. Deixe vazio para ocultar.
                  </FormDescription>
                </FormItem>
              )}
            />
          </FormCardContent>
          <FormCardFooter>
            <FormCardFooterInfo>
              Saiba mais sobre{" "}
              <Link
                href="https://www.openstatus.dev/docs/tutorial/how-to-configure-status-page/#3-links"
                rel="noreferrer"
                target="_blank"
              >
                links
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
