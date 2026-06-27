interface FieldProps {
  label: string;
  children: React.ReactNode;
}

export function Field({ label, children }: FieldProps) {
  return (
    <div>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '0 0 3px 2px' }}>{label}</p>
      {children}
    </div>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      style={{
        width: '100%',
        border: '2px solid #d3d2cc',
        borderRadius: 11,
        padding: '9px 12px',
        fontSize: 17,
        fontFamily: 'inherit',
        background: '#fff',
        outline: 'none',
        ...props.style,
      }}
    />
  );
}
