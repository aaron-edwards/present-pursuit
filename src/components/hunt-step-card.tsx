import { InlineQrScannerShell } from "@/components/inline-qr-scanner-shell";
import { UnicornBuddy } from "@/components/unicorn-buddy";
import type { HuntStep } from "@/lib/hunt";

type HuntStepCardProps = {
  step: HuntStep;
  stepNumber: number;
  totalSteps: number;
};

export function HuntStepCard({
  step,
  stepNumber,
  totalSteps,
}: HuntStepCardProps) {
  const companionVariant =
    stepNumber === 1
      ? "triceratops"
      : stepNumber % 5 === 2
        ? "flowers"
        : stepNumber % 5 === 3
          ? "painting"
          : stepNumber % 5 === 4
            ? "racecar"
            : "donut";

  return (
    <>
      <article className="card">
        <p className="eyebrow">
          Step {stepNumber} of {totalSteps}
        </p>
        <h2>{step.title}</h2>
        <p className="lede clue-lede">{step.body}</p>

        <InlineQrScannerShell />
      </article>

      <section className="buddy-note">
        <div className="buddy-note-copy">
          <p className="eyebrow">Bubbles Says</p>
          <p className="buddy-note-text">
            Follow the rhyme, trust your hunch, and I will be here cheering for
            the next good find.
          </p>
        </div>
        <UnicornBuddy
          className="buddy-note-art"
          imageClassName="buddy-note-image"
          variant={companionVariant}
        />
      </section>
    </>
  );
}
