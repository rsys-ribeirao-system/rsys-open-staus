import { Badge } from "@openstatus/ui/components/ui/badge";
import { Button } from "@openstatus/ui/components/ui/button";

import {
  Section,
  SectionDescription,
  SectionHeader,
  SectionTitle,
} from "@/components/content/section";

const SUGGESTIONS = [
  "Liste todos os meus monitores",
  "Há relatórios de status não resolvidos?",
  "Rascunhe um relatório de status",
  "Agende uma janela de manutenção",
];

type Props = {
  onSelect: (text: string) => void;
};

export function ChatSuggestions({ onSelect }: Props) {
  return (
    <Section className="flex w-full max-w-3xl flex-col items-center">
      <SectionHeader className="max-w-2xl text-center">
        <SectionTitle>assistente openstatus</SectionTitle>
        <SectionDescription>
          Pergunte sobre seu workspace, rascunhe relatórios de status ou depure
          monitores com falha.{" "}
          <span className="text-muted-foreground/80">
            Teste e compartilhe seu feedback.
          </span>{" "}
          <Badge variant="secondary" className="bg-info/10 text-info">
            BETA
          </Badge>
        </SectionDescription>
      </SectionHeader>
      <div className="flex flex-wrap items-center justify-center gap-2">
        {SUGGESTIONS.map((s) => (
          <Button
            key={s}
            variant="outline"
            size="sm"
            className="rounded-full px-4"
            onClick={() => onSelect(s)}
          >
            {s}
          </Button>
        ))}
      </div>
    </Section>
  );
}
