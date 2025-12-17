type CardProps = {
  title: string;
  subtitle?: string;
  className?: string;
  children: React.ReactNode;
};

export default function Card({
  title,
  subtitle,
  className = "",
  children,
}: CardProps) {
  return (
    <section className={`card ${className}`}>
      <div className="cardHeader">
        <div>
          <h2 className="cardTitle">{title}</h2>
          {subtitle && <div className="cardSubtitle">{subtitle}</div>}
        </div>
      </div>
      {children}
    </section>
  );
}
