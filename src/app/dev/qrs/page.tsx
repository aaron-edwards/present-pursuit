import { HuntShell } from "@/components/hunt-shell";
import { QrCard } from "@/components/qr-card";
import { getHunt, getNextDestination } from "@/lib/hunt";
import { getBaseUrl } from "@/lib/site";

export default async function QrPage() {
  const hunt = getHunt();
  const baseUrl = await getBaseUrl();

  return (
    <HuntShell>
      <section className="hero-card">
        <p className="eyebrow">Developer Page</p>
        <h1>Printable QR sheet</h1>
        <p className="subtitle">
          Keep this page for setup time only. Hide each QR at the answer to its
          clue and scanning it will open the next destination directly.
        </p>
      </section>

      <section className="qr-grid">
        <QrCard
          title="Start Hunt"
          subtitle="Use this if you want the intro page itself as a scannable starting point."
          value={`${baseUrl}/`}
        />

        {hunt.steps.map((step) => (
          <QrCard
            key={step.id}
            title={`${step.order}. ${step.title}`}
            subtitle={`Hide this where clue ${step.order} should lead. It opens ${getNextDestination(step.id)}.`}
            value={`${baseUrl}${getNextDestination(step.id)}`}
          />
        ))}
      </section>
    </HuntShell>
  );
}
