interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline';
}

export function Button({ variant = 'primary', className, style, children, ...rest }: ButtonProps) {
  const variantClass = variant === 'outline' ? 'btn-outline' : 'btn-primary';
  return (
    <button className={`btn ${variantClass}${className ? ` ${className}` : ''}`} style={style} {...rest}>
      {children}
    </button>
  );
}
