import Image from "next/image";
import QRCode from "react-qr-code";

type QrCardProps = {
  title: string;
  value: string;
  badgeAlt?: string;
  badgeSrc?: string;
};

export function QrCard({ title, value, badgeAlt, badgeSrc }: QrCardProps) {
  return (
    <article className="qr-card">
      <h3 className="qr-title">{title}</h3>
      <div className="qr-code-wrap">
        <QRCode level="H" size={180} value={value} />
        {badgeSrc ? (
          <div className="qr-badge">
            <Image
              alt={badgeAlt ?? ""}
              className="qr-badge-image"
              height={40}
              src={badgeSrc}
              width={40}
            />
          </div>
        ) : null}
      </div>
    </article>
  );
}
