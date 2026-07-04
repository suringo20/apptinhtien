import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../api';
import type { Trip, Activity } from '../types';
import { MobileShell } from '../components/MobileShell';
import { Button } from '../components/Button';
import { Chip } from '../components/Chip';
import { Field, Input } from '../components/Field';

function formatAmount(n: number, currency: string) {
  const s = Math.round(n).toLocaleString('en-US');
  return currency === '₫' ? `${s} ₫` : `${currency}${s}`;
}

export function AddActivity() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);

  const [trip, setTrip] = useState<Trip | null>(null);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.getTrip().then(t => {
      setTrip(t);
      setSelected(new Set(t.members.map(m => m.id)));
      if (isEdit) {
        api.getActivities().then((acts: Activity[]) => {
          const act = acts.find(a => a.id === Number(id));
          if (act) {
            setName(act.name);
            setAmount(String(act.total_amount));
            setSelected(new Set(act.participants.map(p => p.id)));
          }
        });
      }
    });
  }, [id, isEdit]);

  function toggleMember(memberId: number) {
    setSelected(s => {
      const next = new Set(s);
      next.has(memberId) ? next.delete(memberId) : next.add(memberId);
      return next;
    });
  }

  const parsedAmount = parseFloat(amount.replace(/,/g, '')) || 0;
  const splitCount = selected.size;
  const splitText = splitCount > 0 && parsedAmount > 0
    ? `Split ${splitCount} ways · ${formatAmount(parsedAmount / splitCount, trip?.currency ?? '₫')} each`
    : splitCount === 0 ? 'Pick at least one person' : 'Enter an amount';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (selected.size === 0) { setError('Select at least one participant'); return; }
    setError('');
    setLoading(true);
    try {
      const payload = { name, totalAmount: parsedAmount, memberIds: Array.from(selected) };
      if (isEdit) await api.updateActivity(Number(id), payload);
      else await api.createActivity(payload);
      navigate('/trip');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setLoading(false);
    }
  }

  if (!trip) return <MobileShell><p>Loading…</p></MobileShell>;

  return (
    <MobileShell>
      <h2 style={{ fontSize: 26, margin: '20px 0 20px' }}>{isEdit ? 'Edit activity' : 'Add activity'}</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Field label="What was it?">
          <Input placeholder="e.g. Dinner — Night 1" value={name} onChange={e => setName(e.target.value)} required />
        </Field>
        <Field label="Total amount">
          <Input placeholder="0" value={amount} onChange={e => setAmount(e.target.value)} inputMode="numeric" required />
        </Field>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0 }}>Who joined?</p>
          <div style={{ display: 'flex', gap: 6 }}>
            <button type="button" onClick={() => setSelected(new Set(trip.members.map(m => m.id)))} style={{ border: '2px solid #d3d2cc', borderRadius: 8, padding: '3px 9px', fontSize: 13, color: '#6b6b67', cursor: 'pointer', background: '#fff', fontFamily: 'inherit' }}>Everyone</button>
            <button type="button" onClick={() => setSelected(new Set())} style={{ border: '2px solid #d3d2cc', borderRadius: 8, padding: '3px 9px', fontSize: 13, color: '#6b6b67', cursor: 'pointer', background: '#fff', fontFamily: 'inherit' }}>None</button>
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {trip.members.map(m => (
            <Chip key={m.id} label={m.name} selected={selected.has(m.id)} onClick={() => toggleMember(m.id)} />
          ))}
        </div>

        <div style={{ border: '2px solid var(--blue)', background: 'var(--blue-bg)', borderRadius: 12, padding: 13, textAlign: 'center', fontSize: 18, color: 'var(--blue-dark)' }}>
          {splitText}
        </div>

        <div style={{ background: 'var(--yellow-bg)', border: '1.5px solid var(--yellow-border)', borderRadius: 9, padding: '7px 10px', fontSize: 13, lineHeight: 1.35, color: 'var(--yellow-text)' }}>
          Tap a name to include / exclude. The split recalculates instantly.
        </div>

        {error && <p style={{ color: 'red', fontSize: 14, margin: 0 }}>{error}</p>}
        <Button type="submit" disabled={loading}>{loading ? 'Saving…' : 'Save activity'}</Button>
        <Button variant="outline" type="button" onClick={() => navigate('/trip')}>Cancel</Button>
      </form>
    </MobileShell>
  );
}
