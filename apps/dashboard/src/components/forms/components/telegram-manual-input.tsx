"use client";

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@openstatus/ui/components/ui/form";
import { Input } from "@openstatus/ui/components/ui/input";
import type { UseFormReturn } from "react-hook-form";

import { Link } from "@/components/common/link";

import type { FormValues } from "../notifications/form-telegram";

interface TelegramManualInputProps {
  form: UseFormReturn<FormValues>;
  successMsg?: string;
  showDescription?: boolean;
}

export function TelegramManualInput({
  form,
  successMsg,
  showDescription = true,
}: TelegramManualInputProps) {
  return (
    <FormField
      control={form.control}
      name="data.chatId"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Chat ID do Telegram</FormLabel>
          <FormControl>
            <Input placeholder="1234567890" {...field} />
          </FormControl>
          <FormMessage />
          {successMsg && (
            <div className="text-sm font-medium text-green-600">
              {successMsg}
            </div>
          )}
          {showDescription && (
            <FormDescription>
              Informe o chat ID do Telegram para onde enviar as notificações.{" "}
              <Link
                href="https://www.openstatus.dev/docs/reference/notification/#telegram"
                rel="noreferrer"
                target="_blank"
              >
                Saiba mais
              </Link>
            </FormDescription>
          )}
        </FormItem>
      )}
    />
  );
}
