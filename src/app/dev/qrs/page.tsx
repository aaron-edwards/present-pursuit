import { QrCard } from "@/components/qr-card";
import {
  getBuddyImageSrc,
  getClueBuddyVariant,
  getGreetingBuddyVariant,
  getHunt,
  getScanDestination,
} from "@/lib/hunt";
import { getBaseUrl } from "@/lib/site";

export default async function QrPage() {
  const hunt = getHunt();
  const baseUrl = await getBaseUrl();

  return (
    <main className="print-page-shell">
      <section className="print-sheet">
        <h1 className="print-sheet-title">{hunt.title} QR Sheet</h1>
        <p className="print-sheet-note">Print at 100% scale.</p>
      </section>
      <section className="qr-grid">
        <QrCard
          badgeAlt="Bubbles greeting badge"
          badgeSrc={getBuddyImageSrc(getGreetingBuddyVariant())}
          title="Start Hunt"
          value={`${baseUrl}/`}
        />

        {hunt.steps.map((step) => (
          <QrCard
            badgeAlt={`Bubbles badge for clue ${step.order}`}
            badgeSrc={getBuddyImageSrc(getClueBuddyVariant(step.order))}
            key={step.id}
            title={`Clue ${step.order}`}
            value={`${baseUrl}${getScanDestination(step.id)}`}
          />
        ))}
      </section>
    </main>
  );
}
