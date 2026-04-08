import { createHmac, timingSafeEqual } from "node:crypto";

import { cookies } from "next/headers";

import { getHunt } from "@/lib/hunt";

const COOKIE_NAME = "present-pursuit-progress";
const COOKIE_VERSION = 1;

export type HuntProgress = {
  version: number;
  huntSlug: string;
  currentStepIndex: number;
  completedStepIds: string[];
  startedAt: string;
  completedAt?: string;
};

function getCookieSecret(): string {
  return process.env.HUNT_COOKIE_SECRET ?? "local-dev-secret-change-me";
}

function sign(value: string): string {
  return createHmac("sha256", getCookieSecret())
    .update(value)
    .digest("base64url");
}

function encodePayload(payload: HuntProgress): string {
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
}

function decodePayload(value: string): HuntProgress | null {
  try {
    const parsed = JSON.parse(
      Buffer.from(value, "base64url").toString("utf8"),
    ) as HuntProgress;
    if (parsed.version !== COOKIE_VERSION) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

function parseCookieValue(cookieValue?: string): HuntProgress | null {
  if (!cookieValue) {
    return null;
  }

  const [encoded, signature] = cookieValue.split(".");
  if (!encoded || !signature) {
    return null;
  }

  const expectedSignature = sign(encoded);
  const actual = Buffer.from(signature);
  const expected = Buffer.from(expectedSignature);

  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) {
    return null;
  }

  const payload = decodePayload(encoded);
  if (!payload) {
    return null;
  }

  if (payload.huntSlug !== getHunt().slug) {
    return null;
  }

  return payload;
}

export async function readProgressCookie(): Promise<HuntProgress | null> {
  const cookieStore = await cookies();
  return parseCookieValue(cookieStore.get(COOKIE_NAME)?.value);
}

export function createInitialProgress(): HuntProgress {
  return {
    version: COOKIE_VERSION,
    huntSlug: getHunt().slug,
    currentStepIndex: 0,
    completedStepIds: [],
    startedAt: new Date().toISOString(),
  };
}

export function getCookieName(): string {
  return COOKIE_NAME;
}

export function getProgressCookieValue(payload: HuntProgress): string {
  const encoded = encodePayload(payload);
  return `${encoded}.${sign(encoded)}`;
}

export function isStarted(
  progress: HuntProgress | null,
): progress is HuntProgress {
  return Boolean(progress);
}

export function isComplete(progress: HuntProgress | null): boolean {
  if (!progress) {
    return false;
  }

  return progress.currentStepIndex >= getHunt().steps.length;
}

export function getCurrentStepIndex(progress: HuntProgress | null): number {
  if (!progress) {
    return 0;
  }

  return Math.min(progress.currentStepIndex, getHunt().steps.length);
}

export function getCompletedCount(progress: HuntProgress | null): number {
  return progress?.completedStepIds.length ?? 0;
}

export function isStepCompleted(
  progress: HuntProgress | null,
  stepId: string,
): boolean {
  return progress?.completedStepIds.includes(stepId) ?? false;
}

export function getCompletionStates(progress: HuntProgress | null): boolean[] {
  const hunt = getHunt();
  return hunt.steps.map((step) => isStepCompleted(progress, step.id));
}

export function getCompletionItems(progress: HuntProgress | null) {
  const hunt = getHunt();
  return hunt.steps.map((step) => ({
    id: step.id,
    completed: isStepCompleted(progress, step.id),
  }));
}

export function completeStep(
  progress: HuntProgress,
  stepId: string,
): HuntProgress {
  const hunt = getHunt();
  const stepIndex = hunt.steps.findIndex((step) => step.id === stepId);

  if (stepIndex === -1) {
    return progress;
  }

  const completedStepIds = progress.completedStepIds.includes(stepId)
    ? progress.completedStepIds
    : [...progress.completedStepIds, stepId];

  const currentStepIndex = Math.min(stepIndex + 1, hunt.steps.length);

  return {
    ...progress,
    currentStepIndex,
    completedStepIds,
    completedAt:
      currentStepIndex >= hunt.steps.length
        ? new Date().toISOString()
        : progress.completedAt,
  };
}
