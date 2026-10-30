import { Loading } from "@openstatus/icons";
import { QRCode } from "@openstatus/ui/components/ui/qr-code";
import { Skeleton } from "@openstatus/ui/components/ui/skeleton";

export default function TelegramQRCode({
  chatType,
  token,
  isLoading,
  isPolling,
}: {
  chatType: "group" | "private";
  token?: string | undefined;
  isLoading: boolean;
  isPolling?: boolean;
}) {
  const telegramBotUserName = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME;

  //   Grpoup : t.me/<bot_username>?startgroup=<parameter>&admin=<permissions>
  // Private Chat: t.me/<bot_username>?start=<parameter>

  const qrURL =
    chatType === "group"
      ? `https://t.me/${telegramBotUserName}?startgroup=${token}&admin=post_messages`
      : `https://t.me/${telegramBotUserName}?start=${token}`;

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      {isLoading ? (
        <Skeleton className="h-[200px] w-[200px]" />
      ) : token ? (
        <QRCode data={qrURL} className="overflow-hidden rounded-md" />
      ) : null}
      <div className="text-muted-foreground flex items-center gap-2 text-sm">
        {isLoading ? (
          "Gerando QR code..."
        ) : isPolling ? (
          <>
            <Loading className="h-3 w-3 animate-spin" />
            {chatType === "private"
              ? "Buscando sua conta..."
              : "Aguardando conexão do grupo..."}
          </>
        ) : chatType === "private" ? (
          "Escaneie o QR code para conectar sua conta"
        ) : (
          "Escaneie para adicionar o bot ao seu grupo"
        )}
      </div>
    </div>
  );
}
