import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { getUser, saveAuth, clearAuth } from '../lib/auth';
import { MobileShell } from '../components/MobileShell';
import { Button } from '../components/Button';
import { Field, Input } from '../components/Field';

type TripRow = { id: number; code: string; name: string; start_date: string | null; end_date: string | null; currency: string; is_organizer: number };

function formatDates(start: string | null, end: string | null): string | null {
  if (!start && !end) return null;
  const fmt = (d: string) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  if (start && end) return `${fmt(start)} – ${fmt(end)}`;
  return fmt((start ?? end)!);
}

export function JoinTrip() {
  const navigate = useNavigate();
  const user = getUser();
  const [tripCode, setTripCode] = useState('');
  const [orgCode, setOrgCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [myTrips, setMyTrips] = useState<TripRow[]>([]);
  const [loadingTrips, setLoadingTrips] = useState(true);
  const [joiningId, setJoiningId] = useState<number | null>(null);
  const [showJoin, setShowJoin] = useState(false);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    api.getMyTrips(user.userId)
      .then(setMyTrips)
      .catch(() => {})
      .finally(() => setLoadingTrips(false));
  }, []);

  if (!user) return null;

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await api.joinTrip({ tripCode: tripCode.trim().toUpperCase(), userId: user!.userId, orgCode: orgCode || undefined });
      saveAuth(result);
      navigate(result.isOrganizer ? '/trip' : '/me');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join trip');
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    clearAuth();
    navigate('/login');
  }

  async function reopenTrip(trip: TripRow) {
    setJoiningId(trip.id);
    try {
      const result = await api.joinTrip({ tripCode: trip.code, userId: user!.userId });
      saveAuth(result);
      navigate(result.isOrganizer ? '/trip' : '/me');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to open trip');
    } finally {
      setJoiningId(null);
    }
  }

  return (
    <MobileShell>
      <div style={{ marginTop: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: '0 0 4px' }}>Signed in as</p>
          <p style={{ fontSize: 17, fontWeight: 600, margin: 0 }}>{user.name} · {user.contact}</p>
        </div>
        <button onClick={handleLogout} style={{ background: 'none', border: '2px solid var(--border-light)', borderRadius: 10, padding: '6px 12px', fontSize: 14, color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
          Log out
        </button>
      </div>

      <h2 style={{ fontSize: 24, margin: '0 0 14px' }}>Your trips</h2>

      {loadingTrips ? (
        <p style={{ color: 'var(--text-muted)', fontSize: 15, margin: '4px 0 24px' }}>Loading…</p>
      ) : myTrips.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
          {myTrips.map(trip => {
            const dates = formatDates(trip.start_date, trip.end_date);
            return (
              <button
                key={trip.id}
                onClick={() => reopenTrip(trip)}
                disabled={joiningId === trip.id}
                className="card"
                style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '12px 16px', cursor: 'pointer', fontFamily: 'inherit',
                  textAlign: 'left', width: '100%',
                }}
              >
                <div>
                  <div style={{ fontSize: 16, fontWeight: 600 }}>{trip.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                    {trip.is_organizer ? 'Organizer' : 'Member'} · {trip.code}{dates ? ` · ${dates}` : ''}
                  </div>
                </div>
                <span style={{ color: 'var(--blue)', fontSize: 14, whiteSpace: 'nowrap' }}>
                  {joiningId === trip.id ? '…' : 'Open →'}
                </span>
              </button>
            );
          })}
        </div>
      ) : (
        <div style={{ border: '2px dashed var(--border-light)', borderRadius: 13, padding: '24px 16px', textAlign: 'center', color: 'var(--text-muted)', marginBottom: 24 }}>
          <div style={{ fontSize: 30, marginBottom: 6 }}>🧳</div>
          <p style={{ margin: 0, fontSize: 15, lineHeight: 1.4 }}>No trips yet.<br />Create one or join with a code below.</p>
        </div>
      )}

      <Button onClick={() => navigate('/trip/new')}>+ Create a new trip</Button>

      {!showJoin ? (
        <div style={{ marginTop: 16, textAlign: 'center' }}>
          <button onClick={() => setShowJoin(true)} style={{ background: 'none', border: 'none', color: 'var(--blue)', fontSize: 15, cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'underline' }}>
            Have a trip code? Join a trip
          </button>
        </div>
      ) : (
        <div style={{ marginTop: 24, borderTop: '1.5px dashed #d8d7d1', paddingTop: 20 }}>
          <h3 style={{ fontSize: 17, margin: '0 0 14px' }}>Join a trip with a code</h3>
          <form onSubmit={handleJoin} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Field label="Trip code">
              <Input
                placeholder="e.g. DALAT6"
                value={tripCode}
                onChange={e => setTripCode(e.target.value)}
                required
                style={{ textTransform: 'uppercase', letterSpacing: 2 }}
              />
            </Field>
            <Field label="Organizer code (optional)">
              <Input type="password" placeholder="Only if you're the organizer" value={orgCode} onChange={e => setOrgCode(e.target.value)} />
            </Field>
            {error && <p style={{ color: 'red', fontSize: 14, margin: 0 }}>{error}</p>}
            <Button type="submit" disabled={loading}>{loading ? 'Joining…' : 'Join trip →'}</Button>
          </form>
        </div>
      )}
    </MobileShell>
  );
}
