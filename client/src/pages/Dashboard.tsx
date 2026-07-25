import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import type { Activity, Trip } from '../types';
import { MobileShell } from '../components/MobileShell';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { BackButton } from '../components/BackButton';

function formatAmount(amount: number, currency: string) {
  const s = Math.round(amount).toLocaleString('en-US');
  return currency === '₫' ? `${s} ₫` : `${currency}${s}`;
}

export function Dashboard() {
  const navigate = useNavigate();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api.getTrip(), api.getActivities()])
      .then(([t, a]) => { setTrip(t); setActivities(a); })
      .catch(err => setError(err instanceof Error ? err.message : 'Failed to load'));
  }, []);

  async function deleteActivity(id: number) {
    await api.deleteActivity(id);
    setActivities(a => a.filter(x => x.id !== id));
  }

  if (error) return <MobileShell><p style={{ color: 'red' }}>{error}</p></MobileShell>;
  if (!trip) return <MobileShell><p>Loading…</p></MobileShell>;

  const total = activities.reduce((s, a) => s + a.total_amount, 0);
  const memberCount = trip.members.length;

  return (
    <MobileShell>
      <BackButton to="/join" label="Your trips" />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '8px 0 4px' }}>
        <div>
          <h2 style={{ fontSize: 24, margin: 0 }}>{trip.name}</h2>
          <span style={{ fontSize: 12, color: '#8a8a86', letterSpacing: 1 }}>Code: <strong>{trip.code}</strong></span>
        </div>
        <span style={{ background: 'var(--blue-bg)', border: '2px solid var(--blue)', color: 'var(--blue-dark)', borderRadius: 20, padding: '3px 11px', fontSize: 14 }}>
          {formatAmount(total, trip.currency)}
        </span>
      </div>

      <p style={{ fontSize: 13, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '16px 0 8px' }}>Activities</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {activities.map(a => (
          <Card key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
              <span style={{ fontSize: 16 }}>{a.name}</span>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                {a.participants.length === memberCount ? 'Everyone' : a.participants.map(p => p.name).join(', ')} · {a.participants.length} people
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 15, whiteSpace: 'nowrap' }}>{formatAmount(a.total_amount, trip.currency)}</span>
              <button onClick={() => navigate(`/trip/activity/${a.id}/edit`)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--blue)', fontSize: 14, fontFamily: 'inherit' }}>Edit</button>
              <button onClick={() => deleteActivity(a.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#c8c7c1', fontSize: 18 }}>×</button>
            </div>
          </Card>
        ))}

        <button onClick={() => navigate('/trip/activity/new')} style={{ border: '2.5px dashed var(--blue)', color: 'var(--blue-dark)', borderRadius: 13, padding: 11, textAlign: 'center', fontSize: 17, background: '#fff', cursor: 'pointer', fontFamily: 'inherit' }}>+ Add activity</button>
      </div>

      <Button onClick={() => navigate('/trip/summary')} style={{ marginTop: 24 }}>View summary →</Button>
    </MobileShell>
  );
}
