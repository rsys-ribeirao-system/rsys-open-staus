import { Link } from "@/components/common/link";
import {
  ActionCard,
  ActionCardDescription,
  ActionCardGroup,
  ActionCardHeader,
  ActionCardTitle,
} from "@/components/content/action-card";
import {
  Section,
  SectionDescription,
  SectionGroup,
  SectionHeader,
  SectionTitle,
} from "@/components/content/section";

const settings = [
  {
    title: "Geral",
    description: "Gerencie as configurações do seu workspace.",
    href: "/settings/general",
  },
  {
    title: "Cobrança",
    description: "Gerencie suas informações de cobrança e formas de pagamento.",
    href: "/settings/billing",
  },
  {
    title: "Conta",
    description: "Gerencie as informações da sua conta.",
    href: "/settings/account",
  },
  {
    title: "Integrações",
    description: "Conecte serviços de terceiros ao seu workspace.",
    href: "/settings/integrations",
  },
];
export default function Page() {
  return (
    <SectionGroup>
      <Section>
        <SectionHeader>
          <SectionTitle>Configurações</SectionTitle>
          <SectionDescription>
            Todas as suas configurações em um só lugar.
          </SectionDescription>
        </SectionHeader>
        <ActionCardGroup>
          {settings.map((setting) => (
            <Link href={setting.href} key={setting.href}>
              <ActionCard className="h-full w-full">
                <ActionCardHeader>
                  <ActionCardTitle>{setting.title}</ActionCardTitle>
                  <ActionCardDescription>
                    {setting.description}
                  </ActionCardDescription>
                </ActionCardHeader>
              </ActionCard>
            </Link>
          ))}
        </ActionCardGroup>
      </Section>
    </SectionGroup>
  );
}
