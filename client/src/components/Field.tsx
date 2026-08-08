interface FieldProps {
  label: string;
  children: React.ReactNode;
}

export function Field({ label, children }: FieldProps) {
  return (
    <div>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '0 0 4px 2px' }}>{label}</p>
      {children}
    </div>
  );
}

export function Input({ className, style, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input {...props} className={`input${className ? ` ${className}` : ''}`} style={style} />
  );
}
