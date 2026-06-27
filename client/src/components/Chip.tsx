interface ChipProps {
  label: string;
  selected: boolean;
  onClick: () => void;
}

export function Chip({ label, selected, onClick }: ChipProps) {
  return (
    <button
      onClick={onClick}
      style={{
        border: selected ? '2px solid var(--border)' : '2px dashed #bdbcb6',
        borderRadius: 20,
        padding: '7px 13px',
        fontSize: 15,
        fontFamily: 'inherit',
        cursor: 'pointer',
        background: selected ? 'var(--blue)' : '#fff',
        color: selected ? '#fff' : '#8a8a86',
        boxShadow: selected ? '1.5px 1.5px 0 var(--border)' : 'none',
      }}
    >
      {label}
    </button>
  );
}
