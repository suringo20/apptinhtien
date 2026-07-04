import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { getUser, saveAuth } from '../lib/auth';
import { MobileShell } from '../components/MobileShell';
import { Button } from '../components/Button';
import { Field, Input } from '../components/Field';

export function JoinTrip() {
  const navigate = useNavigate();
  const user = getUser();
  const [tripCode, setTripCode] = useState('');
  const [orgCode, setOrgCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!user) {
    navigate('/login');
    return null;
  }

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

  return (
    <MobileShell>
      <div style={{ marginTop: 32 }}>
        <p style={{ fontSize: 14, color: '#8a8a86', margin: '0 0 4px' }}>Signed in as</p>
        <p style={{ fontSize: 17, fontWeight: 600, margin: '0 0 28px' }}>{user.name} · {user.contact}</p>
      </div>

      <h2 style={{ fontSize: 22, margin: '0 0 20px' }}>Enter a trip code</h2>

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
