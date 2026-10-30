"use client";

import { Next } from "@openstatus/icons";
import type { ThemeKey } from "@openstatus/theme-store";
import { Button } from "@openstatus/ui/components/ui/button";
import { useState } from "react";

import {
  CreatePageForm,
  type FormValues as CreatePageFormValues,
} from "@/components/forms/onboarding/create-page";
import {
  OnboardingActions,
  OnboardingFormColumn,
  OnboardingLockedSummary,
  OnboardingResultColumn,
  OnboardingResultHeading,
  type OnboardingStep,
  OnboardingStepDescription,
  OnboardingStepHeader,
  OnboardingStepTitle,
  OnboardingStepper,
} from "@/components/layout/onboarding-layout";
import { OnboardingStatusPagePreview } from "@/components/onboarding/status-page-preview";

import type { OnboardingPage } from "../client";

export function Step2({
  stepperSteps,
  pageStatus,
  createdPageData,
  slugFallback,
  monitorSkipped,
  monitorName,
  isSubmitting,
  onSubmit,
  onSkip,
  onContinue,
}: {
  stepperSteps: OnboardingStep[];
  pageStatus: "skipped" | "completed" | null;
  createdPageData: OnboardingPage | undefined;
  slugFallback: string;
  monitorSkipped: boolean;
  monitorName: string | null;
  isSubmitting: boolean;
  onSubmit: (values: CreatePageFormValues) => Promise<void>;
  onSkip: () => void;
  onContinue: () => void;
}) {
  const isLocked = pageStatus === "completed" && !!createdPageData;

  // Live preview tracks the form values via `onValuesChange` below. Defaults
  // mirror the form's initial state so the preview renders something on first
  // paint before the user touches the inputs.
  const [previewValues, setPreviewValues] = useState<CreatePageFormValues>({
    slug: slugFallback,
    theme: "default-rounded",
    forceTheme: "system",
    components: monitorSkipped ? [{ name: "Website" }] : undefined,
  });
  // Frozen at submit time so the locked preview shows what the user
  // actually published, not whatever they last typed before clicking submit.
  const [submittedValues, setSubmittedValues] =
    useState<CreatePageFormValues | null>(null);
  const lockedPreviewValues = submittedValues ?? previewValues;

  return (
    <>
      <OnboardingFormColumn>
        <OnboardingStepper steps={stepperSteps} />
        <OnboardingStepHeader>
          <OnboardingStepTitle>
            Publique uma página de status
          </OnboardingStepTitle>
          <OnboardingStepDescription>
            Escolha um subdomínio e um tema - sua página fica no ar assim que
            você publicar. Configure o resto depois nas configurações da página.
          </OnboardingStepDescription>
        </OnboardingStepHeader>
        {isLocked ? (
          <OnboardingLockedSummary
            value={`${createdPageData?.slug}.openstatus.dev`}
            href={`https://${createdPageData?.slug}.openstatus.dev`}
            helper="Tema, componentes e visibilidade podem ser editados depois nas configurações da página."
          />
        ) : (
          <CreatePageForm
            id="onboarding-page-form"
            showComponents={monitorSkipped}
            defaultValues={{ slug: slugFallback }}
            onSubmit={async (values) => {
              await onSubmit(values);
              setSubmittedValues(values);
            }}
            onValuesChange={setPreviewValues}
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
                form="onboarding-page-form"
                disabled={isSubmitting}
                type="submit"
              >
                {isSubmitting ? "Publicando…" : "Publicar minha página"}
              </Button>
              <Button variant="ghost" onClick={onSkip} type="button">
                Fazer isso depois
              </Button>
            </>
          )}
        </OnboardingActions>
      </OnboardingFormColumn>
      <OnboardingResultColumn>
        <OnboardingResultHeading>
          Prévia da página de status
        </OnboardingResultHeading>
        <div className="flex h-[calc(100dvh-13rem)] flex-1 overflow-hidden md:h-auto md:min-h-0">
          <OnboardingStatusPagePreview
            slug={
              isLocked
                ? (createdPageData?.slug ?? "")
                : lockedPreviewValues.slug
            }
            title={(isLocked
              ? (createdPageData?.title ?? "")
              : lockedPreviewValues.slug
            ).replace(/-/g, " ")}
            components={lockedPreviewValues.components ?? []}
            monitorName={monitorName}
            themeKey={lockedPreviewValues.theme as ThemeKey}
            className="h-full w-full"
          />
        </div>
      </OnboardingResultColumn>
    </>
  );
}
