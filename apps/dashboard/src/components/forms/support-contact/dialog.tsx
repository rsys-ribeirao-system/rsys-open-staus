import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@openstatus/ui/components/ui/dialog";
import { useIsMobile } from "@openstatus/ui/hooks/use-mobile";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { Link } from "@/components/common/link";
import { useTRPC } from "@/lib/trpc/client";

import { ContactForm, type FormValues } from "./form";

export function FormDialogSupportContact({
  children,
  defaultValues,
  open: controlledOpen,
  onOpenChange,
  ...props
}: React.ComponentProps<typeof DialogTrigger> & {
  defaultValues?: FormValues;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;
  const isMobile = useIsMobile();
  const trpc = useTRPC();
  const { data: user } = useQuery(trpc.user.get.queryOptions());
  const feedbackMutation = useMutation(trpc.feedback.submit.mutationOptions());

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {children ? (
        <DialogTrigger {...props} asChild>
          {children}
        </DialogTrigger>
      ) : null}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Suporte</DialogTitle>
          <DialogDescription>
            Preencha o formulário abaixo para entrar em contato conosco. Ou
            envie um e-mail para{" "}
            <Link href="mailto:ping@openstatus.dev">ping@openstatus.dev</Link>.
          </DialogDescription>
        </DialogHeader>
        <ContactForm
          defaultValues={{
            name: defaultValues?.name ?? user?.name ?? undefined,
            email: defaultValues?.email ?? user?.email ?? undefined,
            type: defaultValues?.type,
            message: defaultValues?.message,
            blocker: defaultValues?.blocker,
          }}
          onSubmit={async (data) => {
            await feedbackMutation.mutateAsync({
              source: "support",
              name: data.name,
              email: data.email,
              type: data.type,
              message: data.message,
              blocker: data.blocker,
              path: window.location.pathname,
              isMobile,
            });
            setOpen(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
