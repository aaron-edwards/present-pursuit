import { notFound } from "next/navigation";

import { HuntShell } from "@/components/hunt-shell";
import { HuntStepCard } from "@/components/hunt-step-card";
import {
  getHunt,
  getNextDestination,
  getStepById,
  getStepIndex,
} from "@/lib/hunt";

type StepPageProps = {
  params: Promise<{
    stepId: string;
  }>;
};

export default async function StepPage({ params }: StepPageProps) {
  const { stepId } = await params;
  const hunt = getHunt();
  const step = getStepById(stepId);

  if (!step) {
    notFound();
  }

  const stepIndex = getStepIndex(step.id);
  const nextDestination = getNextDestination(step.id);
  const nextDestinationLabel =
    nextDestination === "/done"
      ? "The final QR should sit beside the present or final reveal, because scanning it opens the ending."
      : "The next QR opens the following clue directly, so hide it at the answer to this step.";

  return (
    <HuntShell>
      <HuntStepCard
        nextDestinationLabel={nextDestinationLabel}
        step={step}
        stepNumber={stepIndex + 1}
        totalSteps={hunt.steps.length}
      />
    </HuntShell>
  );
}
