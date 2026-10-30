"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  ApiKey,
  Lock,
  Unlock,
  Restricted,
  ShieldUser,
} from "@openstatus/icons";
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
import { Switch } from "@openstatus/ui/components/ui/switch";
import { cn } from "@openstatus/ui/lib/utils";
import { isTRPCClientError } from "@trpc/client";
import { useTransition } from "react";
import { type Resolver, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Link } from "@/components/common/link";
import {
  FormCard,
  FormCardContent,
  FormCardContentUpgrade,
  FormCardDescription,
  FormCardFooter,
  FormCardFooterInfo,
  FormCardHeader,
  FormCardSeparator,
  FormCardTitle,
} from "@/components/forms/form-card";

const accessTypeSchema = z.enum([
  "public",
  "password",
  "email-domain",
  "ip-restriction",
]);

const schema = z.object({
  accessType: accessTypeSchema,
  password: z.string().optional(),
  authEmailDomains: z
    .preprocess(
      (val: string[] | undefined) =>
        val
          ? String(val)
              .split(",")
              .map((domain) => domain.trim())
              .filter((domain) => domain.length > 0)
          : [],
      z.array(z.string()).optional(),
    )
    .optional(),
  allowedIpRanges: z
    .preprocess(
      (val: string[] | undefined) =>
        val
          ? String(val)
              .split(",")
              .map((range) => {
                const trimmed = range.trim();
                return trimmed && !trimmed.includes("/")
                  ? `${trimmed}/32`
                  : trimmed;
              })
              .filter((range) => range.length > 0)
          : [],
      z.array(z.cidrv4()).optional(),
    )
    .optional(),
  allowIndex: z.boolean().optional(),
});

type FormValues = z.infer<typeof schema>;

export function FormPageAccess({
  lockedMap,
  allowIndexLocked,
  defaultValues,
  onSubmit,
  ...props
}: Omit<React.ComponentProps<"form">, "onSubmit"> & {
  lockedMap?: Map<z.infer<typeof accessTypeSchema>, boolean>;
  allowIndexLocked?: boolean;
  defaultValues?: FormValues;
  onSubmit: (values: FormValues) => Promise<void>;
}) {
  const [isPending, startTransition] = useTransition();
  const form = useForm<FormValues>({
    // zod v4 preprocess types input as `unknown`; runtime-validated by schema.
    resolver: zodResolver(schema) as Resolver<FormValues>,
    defaultValues: defaultValues ?? {
      accessType: "public",
      password: "",
      authEmailDomains: [],
      allowedIpRanges: [],
    },
  });
  const watchAccessType = form.watch("accessType");
  const locked = lockedMap?.get(watchAccessType);

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
      <form onSubmit={form.handleSubmit(submitAction)} {...props}>
        <FormCard>
          <FormCardHeader>
            <FormCardTitle>Acesso à página</FormCardTitle>
            <FormCardDescription>
              Ative a proteção da sua página de status. Escolha entre senha
              simples, autenticação por domínio de e-mail via magic link ou
              restrição por IP.
            </FormCardDescription>
          </FormCardHeader>
          <FormCardContent>
            <FormField
              control={form.control}
              name="accessType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de proteção</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="grid grid-cols-2 gap-4 sm:grid-cols-4"
                    >
                      {[
                        { value: "public", icon: Unlock, label: "Público" },
                        { value: "password", icon: ApiKey, label: "Senha" },
                        {
                          value: "email-domain",
                          icon: ShieldUser,
                          label: "Magic link (autenticação)",
                        },
                        {
                          value: "ip-restriction",
                          icon: Restricted,
                          label: "Restrição por IP",
                        },
                      ].map((type) => {
                        return (
                          <FormItem
                            key={type.value}
                            className={cn(
                              "border-input has-aria-[invalid=true]:border-destructive has-data-[state=checked]:border-primary/50 has-focus-visible:border-ring has-focus-visible:ring-ring/50 relative flex cursor-pointer flex-row items-center gap-3 rounded-md border px-2 py-3 text-center shadow-xs transition-[color,box-shadow] outline-none has-focus-visible:ring-[3px]",
                            )}
                          >
                            <FormControl>
                              <RadioGroupItem
                                value={type.value}
                                className="sr-only"
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
                        );
                      })}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </FormCardContent>
          {watchAccessType && watchAccessType !== "public" ? (
            <FormCardSeparator />
          ) : null}
          {watchAccessType === "password" ? (
            <FormCardContent className="grid gap-4">
              {locked ? <FormCardContentUpgrade /> : null}
              <FormField
                control={form.control}
                name="password"
                disabled={locked}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                    <FormDescription>
                      Defina uma senha para sua página de status e tenha uma
                      proteção básica.
                    </FormDescription>
                  </FormItem>
                )}
              />
            </FormCardContent>
          ) : null}
          {watchAccessType === "email-domain" ? (
            <FormCardContent className="grid gap-4">
              {locked ? <FormCardContentUpgrade /> : null}
              <FormField
                control={form.control}
                name="authEmailDomains"
                disabled={locked}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Domínios de e-mail</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                    <FormDescription>
                      Lista de domínios de e-mail separados por vírgula. Somente
                      e-mails desses domínios serão autenticados para acessar a
                      página de status.
                    </FormDescription>
                  </FormItem>
                )}
              />
            </FormCardContent>
          ) : null}
          {watchAccessType === "ip-restriction" ? (
            <FormCardContent className="grid gap-4">
              {locked ? <FormCardContentUpgrade /> : null}
              <FormField
                control={form.control}
                name="allowedIpRanges"
                disabled={locked}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Faixas de IP permitidas</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="192.168.1.0/24, 10.0.0.1"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                    <FormDescription>
                      Lista de faixas CIDR IPv4 separadas por vírgula
                      (adicionamos /32 automaticamente a IPs únicos). IPs únicos
                      também são aceitos (ex.: 203.0.113.5).
                    </FormDescription>
                  </FormItem>
                )}
              />
            </FormCardContent>
          ) : null}
          <FormCardSeparator />
          <FormCardContent className="grid gap-4">
            {allowIndexLocked ? <FormCardContentUpgrade /> : null}
            <FormField
              control={form.control}
              name="allowIndex"
              disabled={allowIndexLocked}
              render={({ field }) => (
                <FormItem className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <FormLabel>
                      Permitir indexação por mecanismos de busca
                    </FormLabel>
                    <FormDescription>
                      {watchAccessType !== "public"
                        ? "Páginas protegidas não podem ser indexadas por mecanismos de busca."
                        : "Permita que mecanismos de busca indexem sua página de status."}
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={field.disabled}
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
                href="https://www.openstatus.dev/docs/reference/status-page/#password"
                rel="noreferrer"
                target="_blank"
              >
                Proteção
              </Link>
              .
            </FormCardFooterInfo>
            {locked ? (
              <Button type="button" asChild>
                <Link href="/settings/billing">
                  <Lock />
                  Fazer upgrade
                </Link>
              </Button>
            ) : (
              <Button type="submit" disabled={isPending}>
                {isPending ? "Enviando..." : "Enviar"}
              </Button>
            )}
          </FormCardFooter>
        </FormCard>
      </form>
    </Form>
  );
}
