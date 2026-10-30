import { Button } from "@openstatus/ui/components/ui/button";
import { Input } from "@openstatus/ui/components/ui/input";
import { Label } from "@openstatus/ui/components/ui/label";
import type { UseFormReturn } from "react-hook-form";

import type { FormValues } from "../notifications/form-telegram";
import { TelegramManualInput } from "./telegram-manual-input";
import TelegramQRCode from "./telegram-qrcode";

interface TelegramQRConnectionProps {
  form: UseFormReturn<FormValues>;
  token?: string;
  isLoading: boolean;
  isPolling?: boolean;
  flowStep: "private" | "group";
  privateChatId: string | null;
  userName?: string | null;
  groupTitle?: string | null;
  onReset?: () => void;
  onConfirmPrivateChat?: () => void;
}

export function TelegramQRConnection({
  form,
  token,
  isLoading,
  isPolling,
  flowStep,
  privateChatId,
  userName,
  groupTitle,
  onReset,
  onConfirmPrivateChat,
}: TelegramQRConnectionProps) {
  const chatId = form.watch("data.chatId");
  const isGroup = !!groupTitle;

  // When we have a chat ID (group or private), show the manual input with connection info
  if (chatId) {
    const successMsg = isGroup
      ? `Conectado a ${groupTitle}`
      : `Conectado ao chat privado de ${userName || "Desconhecido"}`;
    return (
      <div className="flex flex-col gap-2">
        <TelegramManualInput
          form={form}
          successMsg={successMsg}
          showDescription={false}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onReset}
          className="w-full"
        >
          {isGroup ? "Redefinir ID do grupo" : "Adicionar grupo"}
        </Button>
      </div>
    );
  }

  // When we have a private chat ID, show read-only info with second QR code
  if (privateChatId && flowStep === "group") {
    return (
      <div className="flex flex-col gap-2">
        {/* Show read-only private chat info */}
        <div className="space-y-2">
          <Label>ID do chat privado</Label>
          <Input value={privateChatId} readOnly className="bg-muted" />
          {userName && (
            <div className="text-sm font-medium text-green-600">
              {`Conectado a: ${userName}`}
            </div>
          )}
        </div>

        {/* Show second QR code for group connection */}
        <div className="text-muted-foreground text-sm">
          Passo 2 de 2: adicione o bot ao seu grupo
        </div>
        <TelegramQRCode
          chatType="group"
          token={token}
          isLoading={isLoading}
          isPolling={isPolling}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onConfirmPrivateChat}
          className="w-full"
        >
          Usar apenas chat privado
        </Button>
      </div>
    );
  }

  // Initial state: show first QR code for private chat connection
  return (
    <div className="flex flex-col gap-2">
      <div className="text-muted-foreground text-sm">
        Passo 1 de 2: conecte sua conta do Telegram
      </div>
      <TelegramQRCode
        chatType="private"
        token={token}
        isLoading={isLoading}
        isPolling={isPolling}
      />
    </div>
  );
}
