"use client";

import { FormAlertDialog } from "@/components/forms/form-alert-dialog";
import {
  FormCard,
  FormCardDescription,
  FormCardFooter,
  FormCardHeader,
  FormCardTitle,
} from "@/components/forms/form-card";

export function FormDangerZone({
  onSubmit,
  title,
}: {
  onSubmit: () => Promise<void>;
  title: string;
}) {
  return (
    <FormCard variant="destructive">
      <FormCardHeader>
        <FormCardTitle>Zona de perigo</FormCardTitle>
        <FormCardDescription>
          Esta ação não pode ser desfeita.
        </FormCardDescription>
      </FormCardHeader>
      <FormCardFooter variant="destructive" className="justify-end">
        <FormAlertDialog confirmationValue={title} submitAction={onSubmit} />
      </FormCardFooter>
    </FormCard>
  );
}
