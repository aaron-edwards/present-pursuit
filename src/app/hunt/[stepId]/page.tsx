import { notFound, redirect } from "next/navigation";

import { HuntShell } from "@/components/hunt-shell";
import { HuntStepCard } from "@/components/hunt-step-card";
import { ProgressTracker } from "@/components/progress-tracker";
import { getHunt, getStepById, getStepIndex } from "@/lib/hunt";
import {
  getCompletionItems,
  getCurrentStepIndex,
  isComplete,
  isStarted,
  readProgressCookie,
} from "@/lib/progress";

type StepPageProps = {
  params: Promise<{
    stepId: string;
  }>;
};

export default async function StepPage({ params }: StepPageProps) {
  const { stepId } = await params;
  const hunt = getHunt();
  const step = getStepById(stepId);
  const progress = await readProgressCookie();

  if (!step) {
    notFound();
  }

  if (!isStarted(progress)) {
    redirect("/start");
  }

  if (isComplete(progress)) {
    redirect("/done");
  }

  const stepIndex = getStepIndex(step.id);
  const currentStep = hunt.steps[getCurrentStepIndex(progress)];

  if (currentStep.id !== step.id) {
    redirect(`/hunt/${currentStep.id}`);
  }

  return (
    <HuntShell>
      <ProgressTracker items={getCompletionItems(progress)} />
      <HuntStepCard
        step={step}
        stepNumber={stepIndex + 1}
        totalSteps={hunt.steps.length}
      />
    </HuntShell>
  );
}
