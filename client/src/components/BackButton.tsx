import { useNavigate } from 'react-router-dom';

interface BackButtonProps {
  to: string;
  label?: string;
}

export function BackButton({ to, label = 'Back' }: BackButtonProps) {
  const navigate = useNavigate();
  return (
    <button type="button" onClick={() => navigate(to)} className="back-button">
      <span style={{ fontSize: 19, lineHeight: 1 }}>←</span> {label}
    </button>
  );
}
