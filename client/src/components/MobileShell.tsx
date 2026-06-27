export function MobileShell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100svh', display: 'flex', justifyContent: 'center', padding: '0 0 40px' }}>
      <div style={{ width: '100%', maxWidth: 420, padding: '16px 16px 0' }}>
        {children}
      </div>
    </div>
  );
}
