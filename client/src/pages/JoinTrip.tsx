import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { getUser, saveAuth, clearAuth } from '../lib/auth';
import { MobileShell } from '../components/MobileShell';
import { Button } from '../components/Button';
import { Field, Input } from '../components/Field';

type TripRow = { id: number; code: string; name: string; start_date: string | null; end_date: string | null; currency: string; is_organizer: number };

export function JoinTrip() {
  const navigate = useNavigate();
  const user = getUser();
  const [tripCode, setTripCode] = useState('');
  const [orgCode, setOrgCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [myTrips, setMyTrips] = useState<TripRow[]>([]);
  const [joiningId, setJoiningId] = useState<number | null>(null);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    api.getMyTrips(user.userId).then(setMyTrips).catch(() => {});
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
      <div style={{ marginTop: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <p style={{ fontSize: 14, color: '#8a8a86', margin: '0 0 4px' }}>Signed in as</p>
          <p style={{ fontSize: 17, fontWeight: 600, margin: 0 }}>{user.name} · {user.contact}</p>
        </div>
        <button onClick={handleLogout} style={{ background: 'none', border: '2px solid #d3d2cc', borderRadius: 10, padding: '6px 12px', fontSize: 14, color: '#6b6b67', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
          Log out
        </button>
      </div>

      {myTrips.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 10px' }}>Your trips</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {myTrips.map(trip => (
              <button
                key={trip.id}
                onClick={() => reopenTrip(trip)}
                disabled={joiningId === trip.id}
                style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  background: '#fff', border: '2px solid var(--border)', borderRadius: 13,
                  padding: '12px 16px', cursor: 'pointer', fontFamily: 'inherit',
                  boxShadow: '3px 3px 0 var(--border)', textAlign: 'left',
                }}
              >
                <div>
                  <div style={{ fontSize: 16, fontWeight: 600 }}>{trip.name}</div>
                  <div style={{ fontSize: 12, color: '#8a8a86', marginTop: 2 }}>
                    {trip.is_organizer ? 'Organizer' : 'Member'} · {trip.code}
                  </div>
                </div>
                <span style={{ color: 'var(--blue)', fontSize: 14 }}>
                  {joiningId === trip.id ? '…' : 'Open →'}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      <h2 style={{ fontSize: 18, margin: '0 0 16px' }}>Join a new trip</h2>

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

      <div style={{ marginTop: 20, textAlign: 'center' }}>
        <button onClick={() => navigate('/trip/new')} style={{ background: 'none', border: 'none', color: 'var(--blue)', fontSize: 15, cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'underline' }}>
          Create a new trip instead
        </button>
      </div>
    </MobileShell>
  );
}
