export function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: 'var(--card-bg)',
      border: '2px solid var(--border-light)',
      borderRadius: 12,
      padding: '10px 12px',
      ...style,
    }}>
      {children}
    </div>
  );
}
