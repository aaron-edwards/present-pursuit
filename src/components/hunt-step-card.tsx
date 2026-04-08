import { InlineQrScannerShell } from "@/components/inline-qr-scanner-shell";
import { PoemReader } from "@/components/poem-reader";
import { UnicornBuddy } from "@/components/unicorn-buddy";
import { getClueBuddyVariant, type HuntStep } from "@/lib/hunt";

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
  return (
    <article className="card">
      <p className="eyebrow">
        Step {stepNumber} of {totalSteps}
      </p>
      <h2>{step.title}</h2>
      <p className="lede clue-lede">
        {step.body.map((line, lineIndex) => (
          <span key={`${step.id}-${line}`}>
            {lineIndex > 0 ? <br /> : null}
            {line}
          </span>
        ))}
      </p>

      <PoemReader lines={step.body} />

      <UnicornBuddy
        className="clue-buddy"
        imageClassName="clue-buddy-image"
        variant={getClueBuddyVariant(stepNumber)}
      />

      <InlineQrScannerShell />
    </article>
  );
}
