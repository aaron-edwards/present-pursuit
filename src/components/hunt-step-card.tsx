"use client";

import Image from "next/image";
import { useState } from "react";

import type { HuntStep } from "@/lib/hunt";

type HuntStepCardProps = {
  step: HuntStep;
  stepNumber: number;
  totalSteps: number;
  nextDestinationLabel: string;
};

export function HuntStepCard({
  step,
  stepNumber,
  totalSteps,
  nextDestinationLabel,
}: HuntStepCardProps) {
  const [showHint, setShowHint] = useState(false);

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

      <div className="scan-card">
        <p className="scan-title">
          When you find the matching location, scan the hidden QR there.
        </p>
        <p className="scan-copy">{nextDestinationLabel}</p>
      </div>

      {step.hint || step.hintImage ? (
        <div className="hint-block">
          <button
            className="button button-secondary"
            type="button"
            onClick={() => setShowHint((value) => !value)}
          >
            {showHint ? "Hide Hint" : "Show Hint"}
          </button>
          {showHint ? (
            <div className="hint-panel">
              {step.hint ? <p>{step.hint}</p> : null}
              {step.hintImage ? (
                <Image
                  className="hint-image"
                  src={step.hintImage}
                  alt="Hint illustration"
                  width={1200}
                  height={900}
                />
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}
