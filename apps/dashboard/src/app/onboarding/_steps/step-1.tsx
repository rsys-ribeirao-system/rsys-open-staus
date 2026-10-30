"use client";

import { Next } from "@openstatus/icons";
import { AVAILABLE_REGIONS } from "@openstatus/regions";
import { Button } from "@openstatus/ui/components/ui/button";
import { useMemo } from "react";

import { CreateMonitorForm } from "@/components/forms/onboarding/create-monitor";
import {
  OnboardingActions,
  OnboardingFormColumn,
  OnboardingLockedSummary,
  OnboardingPreviewPlaceholder,
  OnboardingPreviewPlaceholderContent,
  OnboardingPreviewPlaceholderOverlay,
  OnboardingPreviewPlaceholderText,
  OnboardingResultColumn,
  OnboardingResultHeading,
  type OnboardingStep,
  OnboardingStepDescription,
  OnboardingStepHeader,
  OnboardingStepTitle,
  OnboardingStepper,
} from "@/components/layout/onboarding-layout";
import {
  type OnboardingChecksRow,
  OnboardingChecksTable,
} from "@/components/onboarding/checks-table";
import { checkResultToResponseLog } from "@/components/onboarding/checks-table-adapter";
import type { useStreamChecks } from "@/components/onboarding/use-stream-checks";
import { exampleChecks } from "@/data/onboarding-checks";
import { cn } from "@/lib/utils";

import type { OnboardingMonitor } from "../client";

const TOTAL_REGIONS = AVAILABLE_REGIONS.length;

export function Step1({
  stepperSteps,
  monitorStatus,
  defaultUrl,
  isSubmitting,
  monitorData,
  checkResults,
  isStreaming,
  onSubmit,
  onSkip,
  onContinue,
  onRetryChecks,
}: {
  stepperSteps: OnboardingStep[];
  monitorStatus: "skipped" | "completed" | null;
  defaultUrl: string | undefined;
  isSubmitting: boolean;
  monitorData: OnboardingMonitor | undefined;
  checkResults: ReturnType<typeof useStreamChecks>["results"];
  isStreaming: boolean;
  onSubmit: (values: { url: string }) => Promise<void>;
  onSkip: () => void;
  onContinue: () => void;
  onRetryChecks: () => void;
}) {
  const isLocked = monitorStatus === "completed" && !!monitorData;
  // Drop error-state probes and zero-status successes — those rows are
  // noise (timeouts, auth misses, regions our checker can't currently
  // reach) and clutter the table without telling the user anything.
  const successfulResults = useMemo(
    () =>
      checkResults.filter((r) => r.state === "success" && (r.status ?? 0) > 0),
    [checkResults],
  );
  const checksRows: OnboardingChecksRow[] = useMemo(
    () =>
      successfulResults.map((r) =>
        checkResultToResponseLog(
          r,
          monitorData?.id ?? 0,
          monitorData?.url ?? "",
        ),
      ),
    [successfulResults, monitorData?.id, monitorData?.url],
  );
  const allFailed =
    !isStreaming && checkResults.length > 0 && successfulResults.length === 0;

  return (
    <>
      <OnboardingFormColumn>
        <OnboardingStepper steps={stepperSteps} />
        <OnboardingStepHeader>
          <OnboardingStepTitle>
            Verifique sua URL a partir de {TOTAL_REGIONS} regiões
          </OnboardingStepTitle>
          <OnboardingStepDescription>
            Informe sua API ou site. Faremos uma verificação real a partir de
            cada região do openstatus — os primeiros resultados chegam em menos
            de um segundo.
          </OnboardingStepDescription>
        </OnboardingStepHeader>
        {isLocked ? (
          <OnboardingLockedSummary
            value={monitorData?.url ?? ""}
            href={monitorData?.url}
            helper="Renomeie, altere o destino ou ajuste este monitor depois na página de configurações dele."
          />
        ) : (
          <CreateMonitorForm
            id="onboarding-monitor-form"
            defaultValues={defaultUrl ? { url: defaultUrl } : undefined}
            onSubmit={onSubmit}
          />
        )}
        <OnboardingActions>
          {isLocked ? (
            <Button onClick={onContinue}>
              Continuar <Next className="size-3" />
            </Button>
          ) : (
            <>
              <Button
                form="onboarding-monitor-form"
                disabled={isSubmitting}
                type="submit"
              >
                {isSubmitting ? "Executando…" : "Executar primeira verificação"}
              </Button>
              <Button variant="ghost" onClick={onSkip} type="button">
                Não tenho uma URL
              </Button>
            </>
          )}
        </OnboardingActions>
      </OnboardingFormColumn>
      <OnboardingResultColumn>
        <OnboardingResultHeading>Verificações globais</OnboardingResultHeading>
        {!isLocked ? (
          <ChecksPreviewPlaceholder />
        ) : (
          <OnboardingChecksTable
            rows={checksRows}
            totalRegions={TOTAL_REGIONS}
            isStreaming={isStreaming}
            allFailed={allFailed}
            url={monitorData?.url}
            onRetry={onRetryChecks}
          />
        )}
      </OnboardingResultColumn>
    </>
  );
}

function ChecksPreviewPlaceholder(
  props: Omit<
    React.ComponentProps<typeof OnboardingPreviewPlaceholder>,
    "children"
  >,
) {
  return (
    <OnboardingPreviewPlaceholder
      className={cn("flex flex-col", props.className)}
      {...props}
    >
      <OnboardingPreviewPlaceholderContent className="flex-col md:flex-1 md:[&>div]:flex-1">
        <OnboardingChecksTable
          rows={exampleChecks}
          totalRegions={exampleChecks.length}
          isStreaming={false}
          allFailed={false}
          onRetry={() => {}}
          className="rounded-none border-0"
        />
      </OnboardingPreviewPlaceholderContent>
      <OnboardingPreviewPlaceholderOverlay>
        <OnboardingPreviewPlaceholderText>
          Clique em executar para ver aqui os resultados de cada região conforme
          forem concluídos.
        </OnboardingPreviewPlaceholderText>
      </OnboardingPreviewPlaceholderOverlay>
    </OnboardingPreviewPlaceholder>
  );
}
