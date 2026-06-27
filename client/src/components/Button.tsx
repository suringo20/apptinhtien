interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline';
}

export function Button({ variant = 'primary', style, children, ...rest }: ButtonProps) {
  const base: React.CSSProperties = {
    width: '100%',
    border: '2.5px solid var(--border)',
    borderRadius: 13,
    padding: '11px 16px',
    fontSize: 18,
    fontFamily: 'inherit',
    cursor: 'pointer',
    textAlign: 'center',
    boxShadow: '2.5px 2.5px 0 var(--border)',
  };
  const variants: Record<string, React.CSSProperties> = {
    primary: { background: 'var(--blue)', color: '#fff' },
    outline: { background: '#fff', color: 'var(--border)' },
  };
  return (
    <button style={{ ...base, ...variants[variant], ...style }} {...rest}>
      {children}
    </button>
  );
}
