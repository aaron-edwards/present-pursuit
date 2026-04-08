import { HuntShell } from "@/components/hunt-shell";
import { getHunt } from "@/lib/hunt";

const HOW_TO_STEPS = [
  "Open each clue on the phone and head to the place it hints at.",
  "Find the hidden QR code at that location.",
  "Scan it with the in-page scanner or your normal camera app to unlock the next clue.",
  "Keep going until the final reveal appears.",
];

export default function HowToPage() {
  const hunt = getHunt();

  return (
    <HuntShell>
      <section className="hero-card mini-hero-card">
        <p className="eyebrow">How To Play</p>
        <h1>Very easy. Very magical.</h1>
        <p className="subtitle subtitle-large">
          Everything you need lives on the phone. The rest is sparkle-fueled
          detective work.
        </p>
      </section>

      <section className="card instruction-card">
        <div className="instruction-grid">
          {HOW_TO_STEPS.map((step, index) => (
            <article className="instruction-step" key={step}>
              <span className="instruction-number">0{index + 1}</span>
              <p>{step}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="card">
        <p className="eyebrow">Helpful Notes</p>
        <h2>What to keep in mind</h2>
        <div className="hero-copy">
          {hunt.intro.body.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        <div className="button-group">
          <a className="button button-primary" href="/start">
            Start The Hunt
          </a>
          <a className="button button-secondary" href="/">
            Back Home
          </a>
        </div>
      </section>
    </HuntShell>
  );
}
