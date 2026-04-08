import QRCode from "react-qr-code";

type QrCardProps = {
  title: string;
  subtitle: string;
  value: string;
};

export function QrCard({ title, subtitle, value }: QrCardProps) {
  return (
    <article className="qr-card">
      <div className="qr-code-wrap">
        <QRCode value={value} size={180} />
      </div>
      <div className="qr-copy">
        <h3>{title}</h3>
        <p>{subtitle}</p>
        <code>{value}</code>
      </div>
    </article>
  );
}
