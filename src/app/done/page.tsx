import { HuntShell } from "@/components/hunt-shell";
import { getHunt } from "@/lib/hunt";

export default function DonePage() {
  const hunt = getHunt();

  return (
    <HuntShell>
      <section className="hero-card">
        <p className="eyebrow">{hunt.finish.eyebrow}</p>
        <h1>{hunt.finish.headline}</h1>
        <p className="subtitle">The trail worked. The surprise can begin.</p>
      </section>

      <section className="finish-card">
        {hunt.finish.body.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
        <div className="button-group">
          <a
            className="button button-primary"
            href={hunt.finish.ctaHref ?? "/hunt"}
          >
            {hunt.finish.ctaLabel ?? "Back To Start"}
          </a>
          <a className="button button-secondary" href="/dev/qrs">
            View QR Sheet
          </a>
        </div>
        <p className="footer-note">
          Swap this copy for the real birthday reveal once your clues are ready.
        </p>
      </section>
    </HuntShell>
  );
}
