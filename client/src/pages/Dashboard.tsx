import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { clearAuth } from '../lib/auth';
import type { Activity, Member, Trip } from '../types';
import { MobileShell } from '../components/MobileShell';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { BackButton } from '../components/BackButton';
import { Field, Input } from '../components/Field';

function formatAmount(amount: number, currency: string) {
  const s = Math.round(amount).toLocaleString('en-US');
  return currency === '₫' ? `${s} ₫` : `${currency}${s}`;
}

export function Dashboard() {
  const navigate = useNavigate();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [newContact, setNewContact] = useState('');
  const [addError, setAddError] = useState('');
  const [addLoading, setAddLoading] = useState(false);
  const [removingId, setRemovingId] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    Promise.all([api.getTrip(), api.getActivities()])
      .then(([t, a]) => { setTrip(t); setActivities(a); })
      .catch(err => setError(err instanceof Error ? err.message : 'Failed to load'));
  }, []);

  async function deleteActivity(id: number) {
    await api.deleteActivity(id);
    setActivities(a => a.filter(x => x.id !== id));
  }

  async function handleRemoveMember(memberId: number) {
    setRemovingId(memberId);
    try {
      await api.removeMember(memberId);
      setTrip(t => t ? { ...t, members: t.members.filter(m => m.id !== memberId) } : t);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove member');
    } finally {
      setRemovingId(null);
    }
  }

  async function handleDeleteTrip() {
    setDeleteLoading(true);
    try {
      await api.deleteTrip();
      clearAuth();
      navigate('/join');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete trip');
      setDeleteLoading(false);
      setShowDeleteConfirm(false);
    }
  }

  function copyCode() {
    if (!trip) return;
    navigator.clipboard.writeText(trip.code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  async function handleAddMember(e: React.FormEvent) {
    e.preventDefault();
    setAddError('');
    setAddLoading(true);
    try {
      const member = await api.addMember({ contact: newContact.trim() });
      setTrip(t => t ? { ...t, members: [...t.members, member as Member] } : t);
      setNewContact('');
      setShowAddMember(false);
    } catch (err) {
      setAddError(err instanceof Error ? err.message : 'Failed to add member');
    } finally {
      setAddLoading(false);
    }
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
          <button onClick={copyCode} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, color: '#8a8a86', letterSpacing: 1 }}>
            Code: <strong>{trip.code}</strong> {copied ? '✓ Copied' : '· tap to copy'}
          </button>
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
              <span style={{ fontSize: 12, color: '#8a8a86' }}>
                Paid by {a.payer_name ?? trip.members.find(m => m.is_organizer)?.name ?? 'organizer'}
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

      {/* Members section */}
      <p style={{ fontSize: 13, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '24px 0 8px' }}>Members ({memberCount})</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {trip.members.map(m => (
          <Card key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px' }}>
            <span style={{ fontSize: 15 }}>{m.name}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {m.is_organizer
                ? <span style={{ fontSize: 12, color: 'var(--blue-dark)', background: 'var(--blue-bg)', borderRadius: 8, padding: '2px 8px' }}>Organizer</span>
                : <button onClick={() => handleRemoveMember(m.id)} disabled={removingId === m.id} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#c8c7c1', fontSize: 18, lineHeight: 1 }}>{removingId === m.id ? '…' : '×'}</button>
              }
            </div>
          </Card>
        ))}

        {showAddMember ? (
          <form onSubmit={handleAddMember} style={{ border: '2px solid var(--border)', borderRadius: 13, padding: 14, background: '#fff', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Field label="Gmail address">
              <Input type="email" placeholder="example@gmail.com" value={newContact} onChange={e => setNewContact(e.target.value)} required />
            </Field>
            {addError && <p style={{ color: 'red', fontSize: 13, margin: 0 }}>{addError}</p>}
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="button" onClick={() => { setShowAddMember(false); setAddError(''); }} style={{ flex: 1, border: '2px solid var(--border)', borderRadius: 10, padding: '8px 0', background: '#fff', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14 }}>Cancel</button>
              <button type="submit" disabled={addLoading} style={{ flex: 2, border: 'none', borderRadius: 10, padding: '8px 0', background: 'var(--blue)', color: '#fff', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 600 }}>{addLoading ? 'Adding…' : 'Add member'}</button>
            </div>
          </form>
        ) : (
          <button onClick={() => setShowAddMember(true)} style={{ border: '2.5px dashed #cfceC8', color: '#6b6b67', borderRadius: 13, padding: 10, textAlign: 'center', fontSize: 15, background: '#fff', cursor: 'pointer', fontFamily: 'inherit' }}>+ Add member</button>
        )}
      </div>

      <Button onClick={() => navigate('/trip/summary')} style={{ marginTop: 24 }}>View summary →</Button>

      {/* Delete trip */}
      <div style={{ marginTop: 32, borderTop: '1.5px dashed #e0dfd9', paddingTop: 20 }}>
        {showDeleteConfirm ? (
          <div style={{ border: '2px solid #f5c6c6', borderRadius: 13, padding: 16, background: '#fff8f8' }}>
            <p style={{ fontSize: 14, color: '#c0392b', margin: '0 0 12px', fontWeight: 600 }}>Delete this trip?</p>
            <p style={{ fontSize: 13, color: '#8a8a86', margin: '0 0 14px' }}>This will permanently delete all activities and members. This cannot be undone.</p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setShowDeleteConfirm(false)} style={{ flex: 1, border: '2px solid var(--border)', borderRadius: 10, padding: '8px 0', background: '#fff', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14 }}>Cancel</button>
              <button onClick={handleDeleteTrip} disabled={deleteLoading} style={{ flex: 2, border: 'none', borderRadius: 10, padding: '8px 0', background: '#e74c3c', color: '#fff', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 600 }}>{deleteLoading ? 'Deleting…' : 'Yes, delete trip'}</button>
            </div>
          </div>
        ) : (
          <button onClick={() => setShowDeleteConfirm(true)} style={{ width: '100%', border: '2px solid #f5c6c6', borderRadius: 13, padding: '10px 0', background: '#fff', color: '#c0392b', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14 }}>Delete trip</button>
        )}
      </div>
    </MobileShell>
  );
}
