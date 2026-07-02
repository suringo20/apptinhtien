import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { saveAuth } from '../lib/auth';
import { MobileShell } from '../components/MobileShell';
import { Button } from '../components/Button';
import { Field, Input } from '../components/Field';

export function SignIn() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [orgCode, setOrgCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await api.signIn({ name, contact, orgCode: orgCode || undefined });
      saveAuth(result);
      navigate(result.isOrganizer ? '/trip' : '/me');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign-in failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <MobileShell>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, marginTop: 48 }}>
        <div style={{ width: 60, height: 60, borderRadius: 16, background: 'var(--blue-bg)', border: '2.5px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, color: 'var(--blue-dark)', boxShadow: '2.5px 2.5px 0 var(--border)' }}>✶</div>
        <h1 style={{ fontSize: 28, margin: '8px 0 0' }}>Trip Splitter</h1>
        <p style={{ fontSize: 16, color: '#8a8a86', margin: 0, textAlign: 'center' }}>Sign in to split or check your share</p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 28 }}>
        <Field label="Your name">
          <Input placeholder="Your name" value={name} onChange={e => setName(e.target.value)} required />
        </Field>
        <Field label="Phone or email">
          <Input placeholder="Phone or email" value={contact} onChange={e => setContact(e.target.value)} required />
        </Field>
        <Field label="Organizer code (optional)">
          <Input placeholder="Organizer code (optional)" type="password" value={orgCode} onChange={e => setOrgCode(e.target.value)} />
        </Field>
        {error && <p style={{ color: 'red', fontSize: 14, margin: 0 }}>{error}</p>}
        <Button type="submit" disabled={loading}>{loading ? 'Signing in…' : 'Continue →'}</Button>
      </form>

      <div style={{ background: 'var(--yellow-bg)', border: '1.5px solid var(--yellow-border)', borderRadius: 9, padding: '7px 10px', fontSize: 13, lineHeight: 1.35, color: 'var(--yellow-text)', marginTop: 16 }}>
        One sign-in for everyone. Organizers enter the organizer code; everyone else just enters their name and contact.
      </div>
    </MobileShell>
  );
}
