import Image from "next/image";

import { HuntShell } from "@/components/hunt-shell";
import { getHunt } from "@/lib/hunt";

export default function HomePage() {
  const hunt = getHunt();

  return (
    <HuntShell>
      <section className="hero-card hero-card-sparkle">
        <div className="hero-layout">
          <div className="hero-copy-wrap">
            <p className="eyebrow">{hunt.intro.eyebrow}</p>
            <h1>{hunt.intro.headline}</h1>
            <p className="subtitle subtitle-large">{hunt.subtitle}</p>
            <p className="hero-tagline">
              Sparkles, surprises, and a very well-earned present are waiting.
            </p>

            <div className="button-group">
              <a className="button button-primary" href="/start">
                {hunt.intro.startLabel}
              </a>
              <a className="button button-secondary" href="/how-to">
                How It Works
              </a>
            </div>

            <div className="magic-list">
              <span className="magic-pill">Sparkly clues</span>
              <span className="magic-pill">QR magic</span>
              <span className="magic-pill">Birthday treasure</span>
            </div>
          </div>

          <div className="hero-illustration-wrap">
            <Image
              alt="A cheerful unicorn floating over clouds and sparkles."
              className="hero-illustration"
              height={760}
              priority
              src="/media/unicorn-party.svg"
              width={900}
            />
          </div>
        </div>
      </section>

      <section className="meta-row">
        <article className="meta-chip">
          <span className="meta-label">Mood</span>
          <span className="meta-value">Whimsical chaos</span>
        </article>
        <article className="meta-chip">
          <span className="meta-label">Treasure Stops</span>
          <span className="meta-value">{hunt.steps.length}</span>
        </article>
        <article className="meta-chip">
          <span className="meta-label">Needs</span>
          <span className="meta-value">Phone + curiosity</span>
        </article>
      </section>

      <section className="card teaser-card">
        <p className="eyebrow">A Tiny Tease</p>
        <h2>
          Every clue leads to a hiding place, and every hiding place unlocks the
          next little surprise.
        </h2>
        <p className="meta-copy">
          The full instructions have moved to the how-to page so the home screen
          can stay delightfully dramatic.
        </p>
      </section>
    </HuntShell>
  );
}
