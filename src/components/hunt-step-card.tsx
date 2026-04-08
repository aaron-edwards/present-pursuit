"use client";

import Image from "next/image";

import { InlineQrScanner } from "@/components/inline-qr-scanner";
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
  return (
    <article className="card">
      <p className="eyebrow">
        Step {stepNumber} of {totalSteps}
      </p>
      <h2>{step.title}</h2>
      <p className="lede">{step.body}</p>

      {step.type === "image" && step.mediaUrl ? (
        <figure className="media-frame">
          <Image
            className="clue-image"
            src={step.mediaUrl}
            alt={step.caption ?? step.title}
            width={1200}
            height={900}
          />
          {step.caption ? <figcaption>{step.caption}</figcaption> : null}
        </figure>
      ) : null}

      {step.type === "video" && step.embedUrl ? (
        <div className="video-stack">
          <div className="video-frame">
            <iframe
              title={step.title}
              src={step.embedUrl}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          {step.caption ? <p className="caption">{step.caption}</p> : null}
        </div>
      ) : null}

      <InlineQrScanner />
    </article>
  );
}
