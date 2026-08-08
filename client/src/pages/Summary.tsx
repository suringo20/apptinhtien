import { useEffect, useState } from 'react';
import { api } from '../api';
import type { Summary as SummaryData, Trip } from '../types';
import { MobileShell } from '../components/MobileShell';
import { Button } from '../components/Button';
import { BackButton } from '../components/BackButton';

function formatAmount(n: number, currency: string) {
  const s = Math.round(n).toLocaleString('en-US');
  return currency === '₫' ? `${s} ₫` : `${currency}${s}`;
}

export function Summary() {
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [trip, setTrip] = useState<Trip | null>(null);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api.getSummary(), api.getTrip()])
      .then(([s, t]) => { setSummary(s); setTrip(t); })
      .catch(err => setError(err instanceof Error ? err.message : 'Failed to load'));
  }, []);

  function copyText() {
    if (!summary || !trip) return;
    const lines = [`${trip.name} — Summary`, ''];
    for (const m of summary.members) {
      if (m.total === 0) continue;
      lines.push(`${m.name}: ${formatAmount(m.total, trip.currency)}`);
      for (const a of m.activities) {
        lines.push(`  • ${a.name}: ${formatAmount(a.share, trip.currency)} → ${a.payer_name}`);
      }
    }
    navigator.clipboard.writeText(lines.join('\n'));
  }

  if (error) return <MobileShell><p style={{ color: 'red' }}>{error}</p></MobileShell>;
  if (!summary || !trip) return <MobileShell><p>Loading…</p></MobileShell>;

  const owing = summary.members.filter(m => m.total > 0);
  const settled = summary.members.filter(m => m.total === 0);

  return (
    <MobileShell>
      <BackButton to="/trip" label="Trip" />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '8px 0 4px' }}>
        <h2 style={{ fontSize: 26, margin: 0 }}>Summary</h2>
        <span style={{ background: 'var(--blue-bg)', border: '2px solid var(--blue)', color: 'var(--blue-dark)', borderRadius: 20, padding: '3px 11px', fontSize: 14 }}>
          {formatAmount(summary.grandTotal, trip.currency)}
        </span>
      </div>

      <p style={{ fontSize: 13, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '16px 0 8px' }}>
        What everyone owes
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {owing.map(m => (
          <div
            key={m.id}
            style={{ border: '2px solid var(--border-light)', borderRadius: 12, background: 'var(--card-bg)', overflow: 'hidden', cursor: 'pointer' }}
            onClick={() => setExpanded(expanded === m.id ? null : m.id)}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px' }}>
              <span style={{ fontSize: 17 }}>{m.name}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <span style={{ fontSize: 17, color: 'var(--blue-dark)' }}>{formatAmount(m.total, trip.currency)}</span>
                <span style={{ color: '#b6b5af', fontSize: 13 }}>{expanded === m.id ? '▴' : '▾'}</span>
              </span>
            </div>
            {expanded === m.id && (
              <div style={{ borderTop: '1.5px dashed #d8d7d1', padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 5, background: '#faf9f5' }}>
                {m.activities.map(a => (
                  <div key={a.name} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#6b6b67' }}>
                    <span>{a.name} <span style={{ color: '#b6b5af' }}>→ {a.payer_name}</span></span>
                    <span>{formatAmount(a.share, trip.currency)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {settled.length > 0 && (
          <div style={{ border: '2px solid #d8f0e0', borderRadius: 12, background: '#f4fbf6', padding: '10px 12px' }}>
            <span style={{ fontSize: 14, color: '#5a9a6e' }}>
              {settled.map(m => m.name).join(', ')} — settled ✓
            </span>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 24 }}>
        <Button variant="outline" onClick={copyText}>⤴ Copy summary</Button>
      </div>
    </MobileShell>
  );
}
