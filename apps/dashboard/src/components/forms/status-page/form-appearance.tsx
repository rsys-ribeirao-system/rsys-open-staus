import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowUpRight, System, Dark, Light } from "@openstatus/icons";
import type { ThemeKey } from "@openstatus/theme-store";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@openstatus/ui/components/ui/select";
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
import { ThemePickerPopover } from "@/components/forms/status-page/theme-picker";

const schema = z.object({
  forceTheme: z.enum(["light", "dark", "system"]),
  configuration: z.object({
    theme: z.string(),
  }),
});

type FormValues = z.infer<typeof schema>;

export function FormAppearance({
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
      forceTheme: "system",
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
            <FormCardTitle>Aparência</FormCardTitle>
            <FormCardDescription>
              O tema forçado substitui a preferência do usuário.
            </FormCardDescription>
          </FormCardHeader>
          <FormCardContent className="grid gap-4 sm:grid-cols-3">
            <FormField
              control={form.control}
              name="forceTheme"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Modo</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione um tema" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="light">
                        <div className="flex items-center gap-2">
                          <Light className="h-4 w-4" />
                          <span>Claro</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="dark">
                        <div className="flex items-center gap-2">
                          <Dark className="h-4 w-4" />
                          <span>Escuro</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="system">
                        <div className="flex items-center gap-2">
                          <System className="h-4 w-4" />
                          <span>Sistema</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                  <FormDescription>
                    Substitui a preferência do usuário.
                  </FormDescription>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="configuration.theme"
              render={({ field }) => (
                <FormItem className="min-w-0">
                  <FormLabel>Estilo</FormLabel>
                  <ThemePickerPopover
                    value={field.value as ThemeKey}
                    onChange={field.onChange}
                  />
                  <FormMessage />
                  <FormDescription>
                    Escolha um tema para aplicar.
                  </FormDescription>
                </FormItem>
              )}
            />
          </FormCardContent>
          <FormCardFooter>
            <FormCardFooterInfo>
              Seu usuário ainda poderá alterar o modo pelo seletor de tema.
            </FormCardFooterInfo>
            <div className="flex items-center gap-2">
              <Button type="button" variant="ghost" asChild>
                <Link
                  href="https://themes.openstatus.dev"
                  rel="noreferrer"
                  target="_blank"
                >
                  View Theme Explorer <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Enviando..." : "Enviar"}
              </Button>
            </div>
          </FormCardFooter>
        </FormCard>
      </form>
    </Form>
  );
}
