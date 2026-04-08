import { HuntShell } from "@/components/hunt-shell";
import { PoemReader } from "@/components/poem-reader";
import { UnicornBuddy } from "@/components/unicorn-buddy";
import { getGreetingBuddyVariant, getHunt } from "@/lib/hunt";

export default function HomePage() {
  const hunt = getHunt();

  return (
    <HuntShell>
      <section className="hero-card hero-card-sparkle">
        <div className="hero-layout">
          <div className="hero-copy-wrap">
            <p className="eyebrow">{hunt.intro.eyebrow}</p>
            <h1 className="hero-title">{hunt.intro.headline}</h1>
            <p className="subtitle subtitle-large hero-intro-verse">
              {hunt.intro.body.map((line, lineIndex) => (
                <span key={line}>
                  {lineIndex > 0 ? <br /> : null}
                  {line}
                </span>
              ))}
            </p>

            <PoemReader lines={hunt.intro.body} />

            <div className="hero-buddy-card">
              <div className="hero-buddy-copy">
                <p className="eyebrow">Your Buddy</p>
                <p className="hero-buddy-name">Bubbles the unicorn</p>
                <p className="hero-buddy-blurb">
                  She deals in clues, cheers, and a truly heroic amount of
                  sparkle.
                </p>
              </div>
              <div className="hero-buddy-art">
                <UnicornBuddy
                  className="hero-buddy-asset"
                  imageClassName="hero-illustration"
                  priority
                  variant={getGreetingBuddyVariant()}
                />
              </div>
            </div>

            <div className="button-group">
              <a className="button button-primary" href="/start">
                {hunt.intro.startLabel}
              </a>
              <a className="button button-secondary" href="/how-to">
                How It Works
              </a>
            </div>

            <div className="magic-list">
              <span className="magic-pill">Rhyming clues</span>
              <span className="magic-pill">QR magic</span>
              <span className="magic-pill">Unicorn company</span>
            </div>
          </div>
        </div>
      </section>

      <section className="meta-row">
        <article className="meta-chip">
          <span className="meta-label">Mood</span>
          <span className="meta-value">Storybook sparkle</span>
        </article>
        <article className="meta-chip">
          <span className="meta-label">Treasure Stops</span>
          <span className="meta-value">{hunt.steps.length}</span>
        </article>
        <article className="meta-chip">
          <span className="meta-label">Needs</span>
          <span className="meta-value">Phone + wonder</span>
        </article>
      </section>
    </HuntShell>
  );
}
