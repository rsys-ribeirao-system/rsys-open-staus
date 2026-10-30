"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  dnsRecords,
  headerAssertion,
  jsonBodyAssertion,
  numberCompareDictionary,
  recordAssertion,
  recordCompareDictionary,
  statusAssertion,
  stringCompareDictionary,
  textBodyAssertion,
} from "@openstatus/assertions";
import {
  grpcTlsModes,
  monitorMethods,
} from "@openstatus/db/src/schema/monitors/constants";
import {
  Add,
  Api,
  Close,
  Globe,
  Network,
  Server,
  Speed,
} from "@openstatus/icons";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@openstatus/ui/components/ui/alert-dialog";
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
  RadioGroup,
  RadioGroupItem,
} from "@openstatus/ui/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@openstatus/ui/components/ui/select";
import { Switch } from "@openstatus/ui/components/ui/switch";
import { Textarea } from "@openstatus/ui/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@openstatus/ui/components/ui/tooltip";
import { cn } from "@openstatus/ui/lib/utils";
import { isTRPCClientError } from "@trpc/client";
import { useEffect, useState, useTransition } from "react";
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
  FormCardSeparator,
  FormCardTitle,
} from "@/components/forms/form-card";

const TYPES = ["http", "tcp", "dns", "icmp", "grpc"] as const;
const GRPC_TLS_LABELS = {
  tls: "TLS (verificar certificado)",
  tls_insecure: "TLS (ignorar verificação)",
  plaintext: "Texto puro (h2c)",
} as const;
const HTTP_ASSERTION_TYPES = ["status", "header", "textBody"] as const;
const DNS_ASSERTION_TYPES = dnsRecords;

const schema = z.object({
  name: z.string().trim().min(1, "O nome é obrigatório"),
  type: z.enum(TYPES),
  method: z.enum(monitorMethods),
  url: z.string().min(1, "A URL é obrigatória"),
  headers: z.array(
    z.object({
      key: z.string(),
      value: z.string(),
    }),
  ),
  active: z.boolean().optional().prefault(true),
  assertions: z.array(
    z.discriminatedUnion("type", [
      statusAssertion,
      headerAssertion,
      textBodyAssertion,
      jsonBodyAssertion,
      recordAssertion,
    ]),
  ),
  body: z.string().optional(),
  grpcService: z.string().optional(),
  grpcTls: z.enum(grpcTlsModes).optional().prefault("tls"),
  skipCheck: z.boolean().optional().prefault(false),
  saveCheck: z.boolean().optional().prefault(false),
});

type FormValues = z.input<typeof schema>;

export function FormGeneral({
  defaultValues,
  disabled,
  onSubmit,
  ...props
}: Omit<React.ComponentProps<"form">, "onSubmit"> & {
  defaultValues?: FormValues;
  onSubmit: (values: FormValues) => Promise<void>;
  disabled?: boolean;
}) {
  const [error, setError] = useState<string | null>(null);
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues ?? {
      active: true,
      name: "",
      type: undefined,
      method: "GET",
      url: "",
      headers: [],
      body: "",
      assertions: [],
      grpcService: "",
      grpcTls: "tls",
      skipCheck: false,
      saveCheck: false,
    },
  });
  const [isPending, startTransition] = useTransition();
  const watchType = form.watch("type");
  const watchMethod = form.watch("method");

  useEffect(() => {
    // NOTE: reset form when type changes
    if (watchType && !defaultValues) {
      form.setValue("assertions", []);
      form.setValue("body", "");
      form.setValue("headers", []);
      form.setValue("method", "GET");
      form.setValue("url", "");
    }
  }, [watchType, defaultValues, form]);

  function submitAction(values: FormValues) {
    console.log("submitAction", values);
    if (isPending || disabled) return;

    // Validate assertions based on type
    for (let i = 0; i < values.assertions.length; i++) {
      const assertion = values.assertions[i];

      if (assertion.type === "status") {
        if (typeof assertion.target !== "number" || assertion.target <= 0) {
          form.setError(`assertions.${i}.target`, {
            message: "O valor esperado do status deve ser um número positivo",
          });
          return;
        }
      } else if (assertion.type === "header") {
        if (!assertion.key || assertion.key.trim() === "") {
          form.setError(`assertions.${i}.key`, {
            message: "A chave do header é obrigatória",
          });
          return;
        }
        if (!assertion.target || assertion.target.trim() === "") {
          form.setError(`assertions.${i}.target`, {
            message: "O valor esperado do header é obrigatório",
          });
          return;
        }
      } else if (assertion.type === "textBody") {
        if (!assertion.target || assertion.target.trim() === "") {
          form.setError(`assertions.${i}.target`, {
            message: "O valor esperado do body é obrigatório",
          });
          return;
        }
      } else if (assertion.type === "dnsRecord") {
        if (!assertion.key || assertion.key.trim() === "") {
          form.setError(`assertions.${i}.key`, {
            message: "A chave do registro DNS é obrigatória",
          });
          return;
        }
        if (!assertion.target || assertion.target.trim() === "") {
          form.setError(`assertions.${i}.target`, {
            message: "O valor esperado do registro DNS é obrigatório",
          });
          return;
        }
      }
    }

    startTransition(async () => {
      try {
        const promise = onSubmit(values);
        toast.promise(promise, {
          loading: "Salvando...",
          success: "Salvo",
          error: (error) => {
            if (isTRPCClientError(error)) {
              setError(error.message);
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
            <FormCardTitle>Configuração do monitor</FormCardTitle>
            <FormCardDescription>
              Configure as opções e os endpoints do seu monitor.
            </FormCardDescription>
          </FormCardHeader>
          <FormCardContent className="grid gap-4 sm:grid-cols-3">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="OpenStatus API" {...field} />
                  </FormControl>
                  <FormMessage />
                  <FormDescription>
                    Nome interno do seu monitor. Ele será usado para identificar
                    o monitor no painel.
                  </FormDescription>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center">
                  <FormLabel>Ativo</FormLabel>
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
          <FormCardSeparator />
          <FormCardContent>
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de monitoramento</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="grid grid-cols-2 gap-4 sm:grid-cols-5"
                      disabled={!!defaultValues?.type}
                    >
                      {[
                        { value: "http", icon: Globe, label: "HTTP" },
                        { value: "tcp", icon: Network, label: "TCP" },
                        { value: "dns", icon: Server, label: "DNS" },
                        { value: "icmp", icon: Speed, label: "ICMP" },
                        { value: "grpc", icon: Api, label: "gRPC" },
                      ].map((type) => {
                        return (
                          <Tooltip key={type.value}>
                            <TooltipTrigger asChild>
                              <FormItem
                                className={cn(
                                  "border-input has-aria-[invalid=true]:border-destructive has-data-[state=checked]:border-primary/50 has-focus-visible:border-ring has-focus-visible:ring-ring/50 relative flex cursor-pointer flex-row items-center gap-3 rounded-md border px-2 py-3 text-center shadow-xs transition-[color,box-shadow] outline-none has-focus-visible:ring-[3px]",
                                  defaultValues &&
                                    defaultValues.type !== type.value &&
                                    "pointer-events-none opacity-50",
                                )}
                              >
                                <FormControl>
                                  <RadioGroupItem
                                    value={type.value}
                                    className="sr-only"
                                    disabled={!!defaultValues?.type}
                                  />
                                </FormControl>
                                <type.icon
                                  className="text-muted-foreground shrink-0"
                                  size={16}
                                  aria-hidden="true"
                                />
                                <FormLabel className="text-foreground cursor-pointer text-xs leading-none font-medium after:absolute after:inset-0">
                                  {type.label}
                                </FormLabel>
                              </FormItem>
                            </TooltipTrigger>
                            <TooltipContent>
                              O tipo do monitor não pode ser alterado após a
                              criação.
                            </TooltipContent>
                          </Tooltip>
                        );
                      })}
                      <div
                        className={cn(
                          "text-muted-foreground col-span-1 self-end text-xs sm:place-self-end",
                        )}
                      >
                        Falta algum tipo?{" "}
                        <a href="mailto:ping@openstatus.dev">Fale conosco</a>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </FormCardContent>
          {watchType ? <FormCardSeparator /> : null}
          {watchType === "http" && (
            <>
              <FormCardContent className="grid grid-cols-4 gap-4">
                <div className="col-span-1">
                  <FormField
                    control={form.control}
                    name="method"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Método</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Selecione um método" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {monitorMethods.map((method) => (
                              <SelectItem key={method} value={method}>
                                {method}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="col-span-3">
                  <FormField
                    control={form.control}
                    name="url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://openstatus.dev"
                            type="url"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="headers"
                  render={({ field }) => (
                    <FormItem className="col-span-full">
                      <FormLabel>Headers da requisição</FormLabel>
                      {field.value.map((header, index) => (
                        <div key={index} className="grid gap-2 sm:grid-cols-5">
                          <Input
                            placeholder="Chave"
                            className="col-span-2"
                            value={header.key}
                            onChange={(e) => {
                              const newHeaders = [...field.value];
                              newHeaders[index] = {
                                ...newHeaders[index],
                                key: e.target.value,
                              };
                              field.onChange(newHeaders);
                            }}
                          />
                          <Input
                            placeholder="Valor"
                            className="col-span-2"
                            value={header.value}
                            onChange={(e) => {
                              const newHeaders = [...field.value];
                              newHeaders[index] = {
                                ...newHeaders[index],
                                value: e.target.value,
                              };
                              field.onChange(newHeaders);
                            }}
                          />
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => {
                              const newHeaders = field.value.filter(
                                (_, i) => i !== index,
                              );
                              field.onChange(newHeaders);
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
                          onClick={() => {
                            field.onChange([
                              ...field.value,
                              { key: "", value: "" },
                            ]);
                          }}
                        >
                          <Add />
                          Adicionar header
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {["POST", "PUT", "PATCH", "DELETE"].includes(watchMethod) && (
                  <FormField
                    control={form.control}
                    name="body"
                    render={({ field }) => (
                      <FormItem className="col-span-full">
                        <FormLabel>Body</FormLabel>
                        <FormControl>
                          <Textarea {...field} />
                        </FormControl>
                        <FormDescription>Escreva seu payload</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </FormCardContent>
              <FormCardSeparator />
              <FormCardContent>
                <FormField
                  control={form.control}
                  name="assertions"
                  render={({ field }) => (
                    <FormItem className="col-span-full">
                      <FormLabel>Validações</FormLabel>
                      <FormDescription>
                        Valide a resposta para garantir que seu serviço está
                        funcionando como esperado. <br />
                        Adicione validações de body, header ou status.
                      </FormDescription>
                      {field.value.map((assertion, index) => (
                        <div key={index} className="grid gap-2 sm:grid-cols-6">
                          <FormField
                            control={form.control}
                            name={`assertions.${index}.type`}
                            render={({ field }) => (
                              <FormItem>
                                <Select
                                  value={field.value}
                                  onValueChange={field.onChange}
                                  disabled={true}
                                >
                                  <SelectTrigger
                                    aria-invalid={
                                      !!form.formState.errors.assertions?.[
                                        index
                                      ]?.type
                                    }
                                    className="w-full"
                                  >
                                    <SelectValue placeholder="Selecione o tipo" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {HTTP_ASSERTION_TYPES.map((type) => (
                                      <SelectItem key={type} value={type}>
                                        {type}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`assertions.${index}.compare`}
                            render={({ field }) => (
                              <FormItem>
                                <Select
                                  value={field.value}
                                  onValueChange={field.onChange}
                                >
                                  <SelectTrigger className="w-full min-w-16">
                                    <span className="truncate">
                                      <SelectValue placeholder="Selecione a comparação" />
                                    </span>
                                  </SelectTrigger>
                                  <SelectContent>
                                    {assertion.type === "status"
                                      ? Object.entries(
                                          numberCompareDictionary,
                                        ).map(([key, value]) => (
                                          <SelectItem key={key} value={key}>
                                            {value}
                                          </SelectItem>
                                        ))
                                      : Object.entries(
                                          stringCompareDictionary,
                                        ).map(([key, value]) => (
                                          <SelectItem key={key} value={key}>
                                            {value}
                                          </SelectItem>
                                        ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          {assertion.type === "header" && (
                            <FormField
                              control={form.control}
                              name={`assertions.${index}.key`}
                              render={({ field }) => (
                                <FormItem>
                                  <Input
                                    placeholder="Chave do header"
                                    className="w-full"
                                    {...field}
                                    value={field.value as string}
                                  />
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          )}
                          <FormField
                            control={form.control}
                            name={`assertions.${index}.target`}
                            render={({ field }) => (
                              <FormItem>
                                <Input
                                  placeholder="Valor esperado"
                                  className="w-full"
                                  type={
                                    assertion.type === "status"
                                      ? "number"
                                      : "text"
                                  }
                                  {...field}
                                  value={field.value?.toString() || ""}
                                  onChange={(e) => {
                                    const value =
                                      assertion.type === "status"
                                        ? Number.parseInt(e.target.value) || 0
                                        : e.target.value;
                                    field.onChange(value);
                                  }}
                                />
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <Button
                            size="icon"
                            variant="ghost"
                            type="button"
                            onClick={() => {
                              const newAssertions = field.value.filter(
                                (_, i) => i !== index,
                              );
                              field.onChange(newAssertions);
                            }}
                          >
                            <Close />
                          </Button>
                        </div>
                      ))}
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          type="button"
                          onClick={() => {
                            const currentAssertions =
                              form.getValues("assertions");
                            field.onChange([
                              ...currentAssertions,
                              {
                                type: "status",
                                version: "v1",
                                compare: "eq",
                                target: 200,
                              },
                            ]);
                          }}
                        >
                          <Add />
                          Adicionar validação de status
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          type="button"
                          onClick={() => {
                            const currentAssertions =
                              form.getValues("assertions");
                            field.onChange([
                              ...currentAssertions,
                              {
                                type: "header",
                                version: "v1",
                                compare: "eq",
                                key: "",
                                target: "",
                              },
                            ]);
                          }}
                        >
                          <Add />
                          Adicionar validação de header
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          type="button"
                          onClick={() => {
                            const currentAssertions =
                              form.getValues("assertions");
                            field.onChange([
                              ...currentAssertions,
                              {
                                type: "textBody",
                                version: "v1",
                                compare: "eq",
                                target: "",
                              },
                            ]);
                          }}
                        >
                          <Add />
                          Adicionar validação de body
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </FormCardContent>
            </>
          )}
          {watchType === "tcp" && (
            <FormCardContent className="grid gap-4 sm:grid-cols-3">
              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Host:Port</FormLabel>
                    <FormControl>
                      <Input placeholder="127.0.0.0.1:8080" {...field} />
                    </FormControl>
                    <FormMessage />
                    <FormDescription>
                      O campo aceita endereços IPv4 e IPv6.
                    </FormDescription>
                  </FormItem>
                )}
              />
              <div className="text-muted-foreground col-span-full text-sm">
                Exemplos:
                <ul className="list-inside list-disc">
                  <li>
                    Domínio:{" "}
                    <span className="text-foreground font-mono">
                      openstatus.dev:443
                    </span>
                  </li>
                  <li>
                    IPv4:{" "}
                    <span className="text-foreground font-mono">
                      192.168.1.1:443
                    </span>
                  </li>
                  <li>
                    IPv6:{" "}
                    <span className="text-foreground font-mono">
                      [2001:db8:85a3:8d3:1319:8a2e:370:7348]:443
                    </span>
                  </li>
                </ul>
              </div>
            </FormCardContent>
          )}
          {watchType === "icmp" && (
            <FormCardContent className="grid gap-4 sm:grid-cols-3">
              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Host</FormLabel>
                    <FormControl>
                      <Input placeholder="1.1.1.1" {...field} />
                    </FormControl>
                    <FormMessage />
                    <FormDescription>
                      O host para o ping. Aceita domínio, endereço IPv4 ou IPv6
                      (sem porta).
                    </FormDescription>
                  </FormItem>
                )}
              />
              <div className="text-muted-foreground col-span-full text-sm">
                Exemplos:
                <ul className="list-inside list-disc">
                  <li>
                    Domínio:{" "}
                    <span className="text-foreground font-mono">
                      openstatus.dev
                    </span>
                  </li>
                  <li>
                    IPv4:{" "}
                    <span className="text-foreground font-mono">1.1.1.1</span>
                  </li>
                  <li>
                    IPv6:{" "}
                    <span className="text-foreground font-mono">
                      2001:4860:4860::8888
                    </span>
                  </li>
                </ul>
              </div>
            </FormCardContent>
          )}
          {watchType === "grpc" && (
            <FormCardContent className="grid gap-4 sm:grid-cols-3">
              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Host:Port</FormLabel>
                    <FormControl>
                      <Input placeholder="api.example.com:443" {...field} />
                    </FormControl>
                    <FormMessage />
                    <FormDescription>
                      O destino gRPC. A porta é obrigatória; use colchetes em
                      endereços IPv6.
                    </FormDescription>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="grpcTls"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>TLS</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value ?? "tls"}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {grpcTlsModes.map((mode) => (
                          <SelectItem key={mode} value={mode}>
                            {GRPC_TLS_LABELS[mode]}
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
                name="grpcService"
                render={({ field }) => (
                  <FormItem className="col-span-full">
                    <FormLabel>Serviço</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="checkout.v1.CheckoutService"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                    <FormDescription>
                      O nome do serviço enviado para
                      grpc.health.v1.Health/Check. Deixe vazio para verificar a
                      saúde geral do servidor.
                    </FormDescription>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="headers"
                render={({ field }) => (
                  <FormItem className="col-span-full">
                    <FormLabel>Metadados</FormLabel>
                    {field.value.map((header, index) => (
                      <div key={index} className="grid gap-2 sm:grid-cols-5">
                        <Input
                          placeholder="Chave"
                          className="col-span-2"
                          value={header.key}
                          onChange={(e) => {
                            const newHeaders = [...field.value];
                            newHeaders[index] = {
                              ...newHeaders[index],
                              key: e.target.value,
                            };
                            field.onChange(newHeaders);
                          }}
                        />
                        <Input
                          placeholder="Valor"
                          className="col-span-2"
                          value={header.value}
                          onChange={(e) => {
                            const newHeaders = [...field.value];
                            newHeaders[index] = {
                              ...newHeaders[index],
                              value: e.target.value,
                            };
                            field.onChange(newHeaders);
                          }}
                        />
                        <Button
                          size="icon"
                          variant="ghost"
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
                        onClick={() => {
                          field.onChange([
                            ...field.value,
                            { key: "", value: "" },
                          ]);
                        }}
                      >
                        <Add />
                        Adicionar metadados
                      </Button>
                    </div>
                    <FormDescription>
                      Enviados com a requisição de health check, geralmente para
                      autenticação.
                    </FormDescription>
                  </FormItem>
                )}
              />
            </FormCardContent>
          )}
          {watchType === "dns" && (
            <>
              <FormCardContent className="grid gap-4 sm:grid-cols-3">
                <FormField
                  control={form.control}
                  name="url"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel>URI</FormLabel>
                      <FormControl>
                        <Input placeholder="openstatus.dev" {...field} />
                      </FormControl>
                      <FormMessage />
                      <FormDescription>
                        O campo aceita nomes de domínio e URIs.
                      </FormDescription>
                    </FormItem>
                  )}
                />
              </FormCardContent>
              <FormCardSeparator />
              <FormCardContent>
                <FormField
                  control={form.control}
                  name="assertions"
                  render={({ field }) => (
                    <FormItem className="col-span-full">
                      <FormLabel>Validações</FormLabel>
                      <FormDescription>
                        Valide a resposta para garantir que seu serviço está
                        funcionando como esperado. <br />
                        Adicione validações de registros DNS.
                      </FormDescription>
                      {field.value.map((assertion, index) => (
                        <div key={index} className="grid gap-2 sm:grid-cols-6">
                          <FormField
                            control={form.control}
                            name={`assertions.${index}.type`}
                            defaultValue={"dnsRecord"}
                            render={({ field }) => (
                              <FormItem className="hidden">
                                <Select
                                  value={field.value}
                                  onValueChange={field.onChange}
                                  disabled
                                >
                                  <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Selecione o tipo" />
                                  </SelectTrigger>
                                </Select>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`assertions.${index}.key`}
                            render={({ field }) => (
                              <FormItem>
                                <Select
                                  value={field.value as string}
                                  onValueChange={field.onChange}
                                >
                                  <SelectTrigger
                                    aria-invalid={
                                      !!form.formState.errors.assertions?.[
                                        index
                                      ]?.type
                                    }
                                    className="w-full"
                                  >
                                    <SelectValue placeholder="Selecione o tipo" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {DNS_ASSERTION_TYPES.map((type) => (
                                      <SelectItem key={type} value={type}>
                                        {type}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`assertions.${index}.compare`}
                            render={({ field }) => (
                              <FormItem>
                                <Select
                                  value={field.value}
                                  onValueChange={field.onChange}
                                >
                                  <SelectTrigger className="w-full min-w-16">
                                    <span className="truncate">
                                      <SelectValue placeholder="Selecione a comparação" />
                                    </span>
                                  </SelectTrigger>
                                  <SelectContent>
                                    {Object.entries(
                                      recordCompareDictionary,
                                    ).map(([key, value]) => (
                                      <SelectItem key={key} value={key}>
                                        {value}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          {assertion.type === "header" && (
                            <FormField
                              control={form.control}
                              name={`assertions.${index}.key`}
                              render={({ field }) => (
                                <FormItem>
                                  <Input
                                    placeholder="Chave do header"
                                    className="w-full"
                                    {...field}
                                    value={field.value as string}
                                  />
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          )}
                          <FormField
                            control={form.control}
                            name={`assertions.${index}.target`}
                            render={({ field }) => (
                              <FormItem>
                                <Input
                                  placeholder="Valor esperado"
                                  className="w-full"
                                  type={
                                    assertion.type === "status"
                                      ? "number"
                                      : "text"
                                  }
                                  {...field}
                                  value={field.value?.toString() || ""}
                                  onChange={(e) => {
                                    const value =
                                      assertion.type === "status"
                                        ? Number.parseInt(e.target.value) || 0
                                        : e.target.value;
                                    field.onChange(value);
                                  }}
                                />
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <Button
                            size="icon"
                            variant="ghost"
                            type="button"
                            onClick={() => {
                              const newAssertions = field.value.filter(
                                (_, i) => i !== index,
                              );
                              field.onChange(newAssertions);
                            }}
                          >
                            <Close />
                          </Button>
                        </div>
                      ))}
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          type="button"
                          onClick={() => {
                            const currentAssertions =
                              form.getValues("assertions");
                            field.onChange([
                              ...currentAssertions,
                              {
                                type: "dnsRecord",
                                version: "v1",
                                compare: "eq",
                                key: "A",
                                target: "",
                              },
                            ]);
                          }}
                        >
                          <Add />
                          Adicionar validação de registro DNS
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </FormCardContent>
            </>
          )}
          <FormCardFooter>
            <FormCardFooterInfo>
              Saiba mais sobre{" "}
              <Link
                href="https://www.openstatus.dev/docs/tutorial/how-to-create-monitor/"
                rel="noreferrer"
                target="_blank"
              >
                Tipo de monitor
              </Link>{" "}
              e{" "}
              <Link
                href="https://www.openstatus.dev/docs/tutorial/how-to-create-monitor/"
                rel="noreferrer"
                target="_blank"
              >
                Validações
              </Link>
              . Testamos seu endpoint antes de salvar o monitor.
            </FormCardFooterInfo>
            <Button type="submit" disabled={isPending || disabled}>
              {isPending ? "Enviando..." : "Enviar"}
            </Button>
          </FormCardFooter>
        </FormCard>
        <AlertDialog open={!!error} onOpenChange={() => setError(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Salvar mesmo assim?</AlertDialogTitle>
              <AlertDialogDescription>
                Parece que o endpoint não está acessível ou as validações
                falharam. Deseja salvar o monitor mesmo assim?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="border-destructive/20 bg-destructive/10 max-h-48 overflow-auto rounded-md border p-2 whitespace-pre">
              <p className="text-destructive font-mono text-sm">{error}</p>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel type="button">Cancelar</AlertDialogCancel>
              <AlertDialogAction
                type="button"
                onClick={async (e) => {
                  e.preventDefault();
                  form.setValue("skipCheck", true);
                  form.handleSubmit(submitAction)();
                  form.setValue("skipCheck", false);
                  setError(null);
                }}
                disabled={isPending}
              >
                Salvar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </form>
    </Form>
  );
}
