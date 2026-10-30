import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowUpRight } from "@openstatus/icons";
import { THEMES, THEME_KEYS } from "@openstatus/theme-store";
import { Button } from "@openstatus/ui/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@openstatus/ui/components/ui/dialog";
import {
  Form,
  FormControl,
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
import { cn } from "@openstatus/ui/lib/utils";
import { isTRPCClientError } from "@trpc/client";
import { parseAsStringLiteral, useQueryStates } from "nuqs";
import { useEffect, useState, useTransition } from "react";
import { type UseFormReturn, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Link } from "@/components/common/link";
import { Note } from "@/components/common/note";
import {
  FormCard,
  FormCardContent,
  FormCardDescription,
  FormCardFooter,
  FormCardFooterInfo,
  FormCardHeader,
  FormCardSeparator,
  FormCardTitle,
} from "@/components/forms/form-card";

const schema = z.object({
  configuration: z.record(
    z.string(),
    z.string().or(z.boolean()).or(z.number()).nullish().optional(),
  ),
});

const configurationSchema = z
  .object({
    type: z.enum(["manual", "absolute"]),
    value: z.enum(["duration", "requests", "manual"]).nullish(),
    uptime: z.boolean().or(z.literal("true").or(z.literal("false"))),
    theme: z.enum(THEME_KEYS as [string, ...string[]]),
    days: z
      .union([z.literal(30), z.literal(45)])
      .or(z.literal("30").or(z.literal("45")))
      .nullish(),
  })
  .refine(
    (data) => {
      // If type is "manual", value must be "manual"
      if (data.type === "manual") return data.value === "manual";
      return true;
    },
    {
      error: "O valor deve ser manual quando o tipo for manual",
      path: ["value"],
    },
  );

type FormValues = z.infer<typeof schema>;

export function FormConfiguration({
  defaultValues,
  onSubmit,
  configLink,
  hasMonitorComponents = true,
}: {
  defaultValues?: FormValues;
  onSubmit: (values: FormValues) => Promise<void>;
  configLink: string;
  hasMonitorComponents?: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues ?? {
      configuration: {},
    },
  });
  const watchConfigurationType = form.watch("configuration.type") as
    | "manual"
    | "absolute";
  const watchConfigurationValue = form.watch("configuration.value") as
    | "duration"
    | "requests";
  const watchConfigurationUptime = form.watch("configuration.uptime") as
    | "true"
    | "false";
  const watchConfigurationDays = form.watch("configuration.days") ?? 45;

  useEffect(() => {
    if (watchConfigurationType === "manual") {
      form.setValue("configuration.value", "manual");
    } else {
      form.setValue("configuration.value", "duration");
      form.setValue("configuration.type", "absolute");
      if (!watchConfigurationUptime) {
        form.setValue("configuration.uptime", "true");
      }
    }
  }, [watchConfigurationType, watchConfigurationUptime, form]);

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
    <>
      <Form {...form}>
        <form id="redesign" onSubmit={form.handleSubmit(submitAction)}>
          <FormCard>
            <FormCardHeader>
              <FormCardTitle>Configuração dos componentes</FormCardTitle>
              <FormCardDescription>
                Configure quais dados devem ser exibidos nos seus componentes.
              </FormCardDescription>
            </FormCardHeader>
            <FormCardSeparator />
            <FormCardContent
              className={cn(
                "grid gap-4 sm:grid-cols-2",
                !hasMonitorComponents && "pointer-events-none opacity-50",
              )}
            >
              <FormField
                control={form.control}
                name="configuration.type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de barra</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={String(field.value) ?? "absolute"}
                      disabled={!hasMonitorComponents}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full capitalize">
                          <SelectValue placeholder="Selecione um tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {["absolute", "manual"].map((type) => (
                          <SelectItem
                            key={type}
                            value={type}
                            className="capitalize"
                          >
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="configuration.value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor do card</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={String(field.value) ?? "duration"}
                      disabled={
                        !hasMonitorComponents ||
                        watchConfigurationType === "manual"
                      }
                    >
                      <FormControl>
                        <SelectTrigger className="w-full capitalize">
                          <SelectValue placeholder="Selecione um tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {["duration", "requests"].map((type) => (
                          <SelectItem
                            key={type}
                            value={type}
                            className="capitalize"
                          >
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Note className="col-span-full">
                {hasMonitorComponents ? (
                  <ul className="list-inside list-disc">
                    <li>
                      <span>Tipo de barra </span>
                      <span className="font-medium">
                        {watchConfigurationType}
                      </span>
                      : <span>{message.type[watchConfigurationType]}</span>
                    </li>
                    <li>
                      <span>Valor do card </span>
                      <span className="font-medium">
                        {watchConfigurationValue}
                      </span>
                      :{" "}
                      <span>
                        {message.value[watchConfigurationValue] ??
                          message.value.default}
                      </span>
                    </li>
                  </ul>
                ) : (
                  <span>
                    Adicione um componente de monitor à sua página de status
                    para configurar como as barras e os cards exibem os dados.
                  </span>
                )}
              </Note>
            </FormCardContent>
            <FormCardSeparator />
            <FormCardContent className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="configuration.uptime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Exibir disponibilidade</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={String(field.value) ?? "true"}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full capitalize">
                          <SelectValue placeholder="Selecione um tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {["true", "false"].map((type) => (
                          <SelectItem
                            key={type}
                            value={type}
                            className="capitalize"
                          >
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="configuration.days"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Histórico</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={String(field.value ?? 45)}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecione um período" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {["30", "45"].map((days) => (
                          <SelectItem key={days} value={days}>
                            {days} dias
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Note className="col-span-full">
                <ul className="list-inside list-disc">
                  <li>
                    <span>Exibir disponibilidade </span>
                    <span className="font-medium capitalize">
                      {String(watchConfigurationUptime)}
                    </span>
                    : <span>{message.uptime[watchConfigurationUptime]}</span>
                  </li>
                  <li>
                    <span>Histórico </span>
                    <span className="font-medium">
                      {String(watchConfigurationDays)} dias
                    </span>
                    :{" "}
                    <span>
                      exibe os últimos {String(watchConfigurationDays)} dias do
                      histórico do componente.
                    </span>
                  </li>
                </ul>
              </Note>
            </FormCardContent>
            <FormCardFooter>
              <FormCardFooterInfo>
                Saiba mais sobre{" "}
                <Link
                  href="https://www.openstatus.dev/docs/tutorial/how-to-configure-status-page"
                  rel="noreferrer"
                  target="_blank"
                >
                  Configuração
                </Link>
                .
              </FormCardFooterInfo>
              <div className="flex items-center gap-2">
                <Button type="button" variant="ghost" asChild>
                  <Link
                    href={configLink}
                    rel="noreferrer"
                    target="_blank"
                    className="inline-flex items-center gap-1"
                  >
                    Ver e configurar página de status{" "}
                    <ArrowUpRight className="h-4 w-4" />
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
      <FormConfigurationDialog
        defaultValues={defaultValues}
        form={form}
        onSubmit={async (e) => {
          await onSubmit(e);
          // NOTE: make sure to sync the form with the new values
          form.reset(e);
        }}
      />
    </>
  );
}

// TODO:
const message = {
  type: {
    manual:
      "compartilha apenas a duração dos relatórios e manutenções que você configurar - nada mais.",
    absolute:
      "compartilha o status do seu endpoint durante cada um dos diferentes status.",
  },
  value: {
    duration: "compartilha a duração dos diferentes status.",
    requests:
      "compartilha o número de requisições recebidas (sucesso, degradado, erro).",
    default: "compartilha apenas o pior status do dia",
  },
  uptime: {
    true: "compartilha o percentual de disponibilidade e o status atual do seu endpoint.",
    false: "compartilha apenas o status atual.",
  },
} as const;

// ?type=manual&value=manual&uptime=true&theme=default&days=45

const searchParams = {
  type: parseAsStringLiteral(["manual", "absolute"]),
  value: parseAsStringLiteral(["duration", "requests", "manual"]),
  uptime: parseAsStringLiteral(["true", "false"]),
  theme: parseAsStringLiteral(Object.keys(THEMES)),
  days: parseAsStringLiteral(["30", "45"]),
};

function FormConfigurationDialog({
  defaultValues,
  onSubmit,
}: {
  defaultValues?: FormValues;
  onSubmit: (values: FormValues) => Promise<void>;
  form: UseFormReturn<FormValues>;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [{ type, value, uptime, theme, days }, setSearchParams] =
    useQueryStates(searchParams);

  useEffect(() => {
    if (type) setOpen(true);
  }, [type]);

  function submitAction(values: FormValues) {
    if (isPending) return;

    const data = configurationSchema.safeParse(values.configuration);
    if (!data.success) {
      toast.error(data.error.message);
      return;
    }

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
        await setSearchParams({
          type: null,
          value: null,
          uptime: null,
          theme: null,
          days: null,
        });
        setOpen(false);
      } catch (error) {
        console.error(error);
      } finally {
        if (typeof window !== "undefined") {
          window.location.reload();
        }
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Configuração da página de status</DialogTitle>
          <DialogDescription>
            Deseja atualizar a página de status com base nas configurações
            definidas? Você pode alterá-las depois a qualquer momento.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <pre className="bg-muted/50 font-commit-mono rounded-md border px-3 py-2 text-sm">
            {JSON.stringify({ type, value, uptime, theme, days }, null, 2)}
          </pre>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>
          <Button
            type="button"
            onClick={() =>
              submitAction({
                ...defaultValues,
                configuration: {
                  type: type ?? undefined,
                  value: value ?? undefined,
                  uptime: uptime ?? undefined,
                  theme: theme ?? undefined,
                  // fall back to the page's stored value when the URL omits
                  // `days` (e.g. links generated before it was added).
                  days: days ?? defaultValues?.configuration?.days ?? undefined,
                },
              })
            }
            disabled={isPending}
          >
            {isPending ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
