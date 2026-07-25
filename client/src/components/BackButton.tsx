import { useNavigate } from 'react-router-dom';

interface BackButtonProps {
  to: string;
  label?: string;
}

export function BackButton({ to, label = 'Back' }: BackButtonProps) {
  const navigate = useNavigate();
  return (
    <button
      type="button"
      onClick={() => navigate(to)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        background: 'none',
        border: 'none',
        padding: '4px 6px 4px 0',
        marginTop: 8,
        color: 'var(--blue)',
        fontSize: 15,
        fontFamily: 'inherit',
        cursor: 'pointer',
      }}
    >
      <span style={{ fontSize: 19, lineHeight: 1 }}>←</span> {label}
    </button>
  );
}
