import { NextResponse } from "next/server";

import { getHunt, getStepById, getStepIndex } from "@/lib/hunt";
import {
  completeStep,
  getCookieName,
  getCurrentStepIndex,
  getProgressCookieValue,
  isStarted,
  isStepCompleted,
  readProgressCookie,
} from "@/lib/progress";

type ScanRouteContext = {
  params: Promise<{
    stepId: string;
  }>;
};

export async function GET(request: Request, context: ScanRouteContext) {
  const { stepId } = await context.params;
  const step = getStepById(stepId);

  if (!step) {
    return NextResponse.redirect(new URL("/hunt", request.url));
  }

  const progress = await readProgressCookie();
  if (!isStarted(progress)) {
    return NextResponse.redirect(new URL("/start", request.url));
  }

  if (isStepCompleted(progress, stepId)) {
    const hunt = getHunt();
    const currentStep = hunt.steps[getCurrentStepIndex(progress)];
    return NextResponse.redirect(
      new URL(currentStep ? `/hunt/${currentStep.id}` : "/done", request.url),
    );
  }

  if (getStepIndex(stepId) !== getCurrentStepIndex(progress)) {
    const hunt = getHunt();
    const currentStep = hunt.steps[getCurrentStepIndex(progress)];
    return NextResponse.redirect(
      new URL(currentStep ? `/hunt/${currentStep.id}` : "/done", request.url),
    );
  }

  const updatedProgress = completeStep(progress, stepId);
  const response = NextResponse.redirect(
    new URL(`/celebrate/${stepId}`, request.url),
  );

  response.cookies.set({
    name: getCookieName(),
    value: getProgressCookieValue(updatedProgress),
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return response;
}
