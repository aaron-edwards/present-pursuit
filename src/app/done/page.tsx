import { redirect } from "next/navigation";

import { HuntShell } from "@/components/hunt-shell";
import { UnicornBuddy } from "@/components/unicorn-buddy";
import { getCelebrationBuddyVariant, getHunt } from "@/lib/hunt";
import { isComplete, isStarted, readProgressCookie } from "@/lib/progress";

export default async function DonePage() {
  const hunt = getHunt();
  const progress = await readProgressCookie();

  if (!isStarted(progress)) {
    redirect("/start");
  }

  if (!isComplete(progress)) {
    redirect("/hunt");
  }

  return (
    <HuntShell>
      <section className="hero-card hero-card-sparkle mini-hero-card">
        <p className="eyebrow">{hunt.finish.eyebrow}</p>
        <h1>{hunt.finish.headline}</h1>
        <p className="subtitle subtitle-large">
          The trail is complete, the sparkles agree, and the unicorn is very
          pleased with you.
        </p>
      </section>

      <section className="finish-card celebration-card">
        <UnicornBuddy
          className="finish-buddy"
          imageClassName="finish-buddy-image"
          variant={getCelebrationBuddyVariant()}
        />
        <p className="lede finish-verse">
          {hunt.finish.body.map((line, lineIndex) => (
            <span key={line}>
              {lineIndex > 0 ? <br /> : null}
              {line}
            </span>
          ))}
        </p>
        <div className="button-group">
          <a
            className="button button-primary"
            href={hunt.finish.ctaHref ?? "/start"}
          >
            {hunt.finish.ctaLabel ?? "Back To Start"}
          </a>
          <a className="button button-secondary" href="/dev/qrs">
            View QR Sheet
          </a>
        </div>
      </section>
    </HuntShell>
  );
}
