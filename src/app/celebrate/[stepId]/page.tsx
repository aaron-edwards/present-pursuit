import { redirect } from "next/navigation";
import type { CSSProperties } from "react";

import { HuntShell } from "@/components/hunt-shell";
import { ProgressTracker } from "@/components/progress-tracker";
import { getNextDestination, getStepById } from "@/lib/hunt";
import {
  getCompletionItems,
  isStarted,
  isStepCompleted,
  readProgressCookie,
} from "@/lib/progress";

type CelebratePageProps = {
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

const CONFETTI_PIECES = Array.from({ length: 20 }, (_, index) => ({
  id: `confetti-${index + 1}`,
  offset: index,
}));

function getRandomMessage() {
  return CELEBRATION_MESSAGES[
    Math.floor(Math.random() * CELEBRATION_MESSAGES.length)
  ];
}

function ConfettiBurst() {
  return (
    <div aria-hidden="true" className="confetti-burst">
      {CONFETTI_PIECES.map((piece) => (
        <span
          className="confetti-piece"
          key={piece.id}
          style={{ "--confetti-index": piece.offset } as CSSProperties}
        />
      ))}
    </div>
  );
}

export default async function CelebratePage({ params }: CelebratePageProps) {
  const { stepId } = await params;
  const step = getStepById(stepId);
  const progress = await readProgressCookie();

  if (!step || !isStarted(progress) || !isStepCompleted(progress, stepId)) {
    redirect("/hunt");
  }

  const nextDestination = getNextDestination(stepId);
  const nextLabel =
    nextDestination === "/done"
      ? "See the final reveal"
      : "Go to the next clue";

  return (
    <HuntShell>
      <section className="hero-card hero-card-sparkle mini-hero-card celebration-hero">
        <ConfettiBurst />
        <p className="eyebrow">Checkpoint Complete</p>
        <h1>{getRandomMessage()}</h1>
        <p className="subtitle subtitle-large">
          You unlocked the next part of the pursuit.
        </p>
        <ProgressTracker items={getCompletionItems(progress)} />
        <div className="button-group">
          <a className="button button-primary" href={nextDestination}>
            {nextLabel}
          </a>
        </div>
      </section>
    </HuntShell>
  );
}
