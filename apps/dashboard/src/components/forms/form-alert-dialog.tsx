"use client";

import { Check, Copy } from "@openstatus/icons";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@openstatus/ui/components/ui/alert-dialog";
import { Button } from "@openstatus/ui/components/ui/button";
import { Input } from "@openstatus/ui/components/ui/input";
import { useCopyToClipboard } from "@openstatus/ui/hooks/use-copy-to-clipboard";
import { isTRPCClientError } from "@trpc/client";
import { useState, useTransition } from "react";
import { toast } from "sonner";

interface FormAlertDialogProps {
  confirmationValue: string;
  submitAction: () => Promise<void>;
  children?: React.ReactNode;
}

export function FormAlertDialog({
  confirmationValue,
  submitAction,
  children,
}: FormAlertDialogProps) {
  const [value, setValue] = useState("");
  const [isPending, startTransition] = useTransition();
  const { copy, isCopied } = useCopyToClipboard();
  const [open, setOpen] = useState(false);

  const handleDelete = async () => {
    try {
      startTransition(async () => {
        const promise = submitAction();
        toast.promise(promise, {
          loading: "Excluindo...",
          success: "Excluído",
          error: (error) => {
            if (isTRPCClientError(error)) {
              return error.message;
            }
            return "Falha ao excluir";
          },
        });
        await promise;
        setOpen(false);
      });
    } catch (error) {
      console.error("Failed to revoke:", error);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        {children ?? (
          <Button variant="destructive" size="sm">
            Excluir
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Tem certeza de que deseja excluir `{confirmationValue}`?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Esta ação não pode ser desfeita. O item será excluído
            permanentemente.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <form id="form-alert-dialog" className="space-y-1.5">
          <p className="text-muted-foreground text-sm">
            Digite{" "}
            <Button
              variant="secondary"
              size="sm"
              type="button"
              className="font-normal [&_svg]:size-3"
              onClick={() => copy(confirmationValue, { withToast: false })}
            >
              {confirmationValue}
              {isCopied ? <Check /> : <Copy />}
            </Button>{" "}
            para confirmar
          </p>
          <Input value={value} onChange={(e) => setValue(e.target.value)} />
        </form>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:bg-destructive/60 dark:focus-visible:ring-destructive/40 text-white shadow-xs"
            disabled={value !== confirmationValue || isPending}
            form="form-alert-dialog"
            type="submit"
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
          >
            {isPending ? "Excluindo..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
