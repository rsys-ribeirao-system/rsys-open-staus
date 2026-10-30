"use client";

import { Input } from "@openstatus/ui/components/ui/input";
import { Label } from "@openstatus/ui/components/ui/label";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";

import { signInWithResendAction } from "./actions";
import { LoginButton } from "./login-button";

/**
 * @deprecated - only to be used in development mode
 */
export default function MagicLinkForm() {
  const { pending } = useFormStatus();

  return (
    <form
      action={async (formData) => {
        try {
          await signInWithResendAction(formData);
          toast.success("Confira o link mágico no seu terminal.");
        } catch (e) {
          console.error(e);
          toast.error("Erro ao enviar o link mágico.");
        }
      }}
      className="grid gap-2"
    >
      <div className="grid gap-1.5">
        <Label htmlFor="email">E-mail</Label>
        <Input id="email" name="email" type="email" required />
      </div>
      <LoginButton provider="email">
        {pending ? "Entrando..." : "Registrar link mágico"}
      </LoginButton>
    </form>
  );
}
