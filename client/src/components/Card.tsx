export function Card({ children, style, onClick }: { children: React.ReactNode; style?: React.CSSProperties; onClick?: () => void }) {
  return (
    <div className="card" style={{ cursor: onClick ? 'pointer' : undefined, ...style }} onClick={onClick}>
      {children}
    </div>
  );
}
