import { NextResponse } from "next/server";

import {
  getCelebrateDestination,
  getHunt,
  getHuntDestination,
  getStepByPublicSlug,
  getStepIndex,
} from "@/lib/hunt";
import {
  completeStep,
  getCookieName,
  getCurrentStepIndex,
  getProgressCookieValue,
  isStarted,
  isStepCompleted,
  readProgressCookie,
} from "@/lib/progress";
import { getOriginFromHeaders } from "@/lib/site";

type ScanRouteContext = {
  params: Promise<{
    stepId: string;
  }>;
};

const CELEBRATION_MESSAGES = [
  "Well done, treasure hunter.",
  "Sparkly success unlocked.",
  "That was exactly the right spot.",
  "Another clue conquered.",
  "Yes. Absolutely nailed it.",
];

function getRandomMessage() {
  return CELEBRATION_MESSAGES[
    Math.floor(Math.random() * CELEBRATION_MESSAGES.length)
  ];
}

export async function GET(request: Request, context: ScanRouteContext) {
  const { stepId } = await context.params;
  const step = getStepByPublicSlug(stepId);
  const requestUrl = new URL(request.url);
  const origin = getOriginFromHeaders(request.headers);
  const inlineMode = requestUrl.searchParams.get("mode") === "inline";

  if (!step) {
    if (inlineMode) {
      return NextResponse.json({ destination: "/hunt", status: "redirect" });
    }

    return NextResponse.redirect(new URL("/hunt", origin));
  }

  const progress = await readProgressCookie();
  if (!isStarted(progress)) {
    if (inlineMode) {
      return NextResponse.json({ destination: "/start", status: "redirect" });
    }

    return NextResponse.redirect(new URL("/start", origin));
  }

  if (isStepCompleted(progress, stepId)) {
    const hunt = getHunt();
    const currentStep = hunt.steps[getCurrentStepIndex(progress)];

    if (inlineMode) {
      return NextResponse.json({
        destination: currentStep ? getHuntDestination(currentStep.id) : "/done",
        status: "redirect",
      });
    }

    return NextResponse.redirect(
      new URL(
        currentStep ? getHuntDestination(currentStep.id) : "/done",
        origin,
      ),
    );
  }

  if (getStepIndex(step.id) !== getCurrentStepIndex(progress)) {
    const hunt = getHunt();
    const currentStep = hunt.steps[getCurrentStepIndex(progress)];

    if (inlineMode) {
      return NextResponse.json({
        destination: currentStep ? getHuntDestination(currentStep.id) : "/done",
        status: "redirect",
      });
    }

    return NextResponse.redirect(
      new URL(
        currentStep ? getHuntDestination(currentStep.id) : "/done",
        origin,
      ),
    );
  }

  const updatedProgress = completeStep(progress, step.id);
  const nextDestination =
    updatedProgress.currentStepIndex >= getHunt().steps.length
      ? "/done"
      : getHuntDestination(
          getHunt().steps[updatedProgress.currentStepIndex].id,
        );
  const response = inlineMode
    ? NextResponse.json({
        message: getRandomMessage(),
        nextDestination,
        nextLabel:
          nextDestination === "/done"
            ? "See the final reveal"
            : "Go to the next clue",
        status: "success",
      })
    : NextResponse.redirect(new URL(getCelebrateDestination(step.id), origin));

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
