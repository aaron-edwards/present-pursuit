import { redirect } from "next/navigation";

import { getHunt } from "@/lib/hunt";
import {
  getCurrentStepIndex,
  isComplete,
  isStarted,
  readProgressCookie,
} from "@/lib/progress";

export default async function HuntEntryPage() {
  const progress = await readProgressCookie();

  if (!isStarted(progress)) {
    redirect("/start");
  }

  if (isComplete(progress)) {
    redirect("/done");
  }

  const hunt = getHunt();
  const currentStep = hunt.steps[getCurrentStepIndex(progress)];
  redirect(`/hunt/${currentStep.id}`);
}
