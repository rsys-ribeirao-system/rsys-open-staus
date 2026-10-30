"use client";

import { Check, Copy } from "@openstatus/icons";
import { Button } from "@openstatus/ui/components/ui/button";
import { useCopyToClipboard } from "@openstatus/ui/hooks/use-copy-to-clipboard";
import { z } from "zod";

import {
  FormCard,
  FormCardContent,
  FormCardDescription,
  FormCardFooter,
  FormCardFooterInfo,
  FormCardHeader,
  FormCardTitle,
} from "@/components/forms/form-card";
import { FormDialogSupportContact } from "@/components/forms/support-contact/dialog";

const schema = z.object({
  slug: z.string().min(1),
});

type FormValues = z.infer<typeof schema>;

export function FormSlug({ defaultValues }: { defaultValues?: FormValues }) {
  const { copy, isCopied } = useCopyToClipboard();
  console.log({ defaultValues, schema });

  return (
    <FormCard id="workspace-slug">
      <FormCardHeader>
        <FormCardTitle>Slug</FormCardTitle>
        <FormCardDescription>
          O slug exclusivo do seu workspace.
        </FormCardDescription>
      </FormCardHeader>
      <FormCardContent>
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            copy(defaultValues?.slug ?? "unknown slug", {
              successMessage: "Slug copiado para a área de transferência",
            })
          }
        >
          {defaultValues?.slug ?? "unknown slug"}
          {isCopied ? (
            <Check size={16} className="text-muted-foreground" />
          ) : (
            <Copy size={16} className="text-muted-foreground" />
          )}
        </Button>
      </FormCardContent>
      <FormCardFooter className="[&>:last-child]:ml-0">
        <FormCardFooterInfo>
          Usado ao interagir com a API ou para pedir ajuda no Discord.{" "}
          <FormDialogSupportContact>
            <Button
              variant="ghost"
              size="sm"
              className="text-accent-foreground px-0 py-0 hover:bg-transparent dark:hover:bg-transparent"
            >
              Avise-nos
            </Button>
          </FormDialogSupportContact>{" "}
          se quiser alterá-lo.
        </FormCardFooterInfo>
      </FormCardFooter>
    </FormCard>
  );
}
