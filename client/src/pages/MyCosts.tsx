import { useEffect, useState } from 'react';
import { api } from '../api';
import type { MyCosts as MyCostsData, Trip } from '../types';
import { MobileShell } from '../components/MobileShell';
import { Card } from '../components/Card';
import { getAuth } from '../lib/auth';

function formatAmount(n: number, currency: string) {
  const s = Math.round(n).toLocaleString('en-US');
  return currency === '₫' ? `${s} ₫` : `${currency}${s}`;
}

export function MyCosts() {
  const [data, setData] = useState<MyCostsData | null>(null);
  const [trip, setTrip] = useState<Trip | null>(null);
  const [error, setError] = useState('');

  const auth = getAuth();
  const memberId = auth?.memberId;

  useEffect(() => {
    Promise.all([api.getMyCosts(), api.getTrip()])
      .then(([d, t]) => { setData(d); setTrip(t); })
      .catch(err => setError(err instanceof Error ? err.message : 'Failed to load'));
  }, []);

  if (error) return <MobileShell><p style={{ color: 'red' }}>{error}</p></MobileShell>;
  if (!data || !trip) return <MobileShell><p>Loading…</p></MobileShell>;

  const member = trip.members.find(m => m.id === memberId);
  const organizer = trip.members.find(m => m.is_organizer);

  return (
    <MobileShell>
      <h2 style={{ fontSize: 26, margin: '24px 0 16px' }}>Hi, {member?.name ?? 'there'}</h2>

      <div style={{ border: '2.5px solid var(--border)', borderRadius: 16, background: 'var(--blue-bg)', padding: 16, textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 3 }}>
        <span style={{ fontSize: 14, color: '#5b7bb5' }}>You owe</span>
        <span style={{ fontSize: 40, color: 'var(--blue-dark)', lineHeight: 1.1 }}>{formatAmount(data.total, trip.currency)}</span>
        <span style={{ fontSize: 14, color: '#5b7bb5' }}>pay to {organizer?.name ?? 'organizer'}</span>
      </div>

      <p style={{ fontSize: 13, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '20px 0 8px' }}>Activities you joined</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {data.activities.map(a => (
          <Card key={a.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 16 }}>{a.name}</span>
            <span style={{ fontSize: 15, color: 'var(--blue-dark)' }}>{formatAmount(a.share, trip.currency)}</span>
          </Card>
        ))}
      </div>

      <p style={{ fontSize: 15, color: '#8a8a86', marginTop: 'auto', paddingTop: 24 }}>
        Pay {organizer?.name ?? 'the organizer'} back whenever you can 🙂
      </p>
    </MobileShell>
  );
}
