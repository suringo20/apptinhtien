import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '../api';
import { saveUser } from '../lib/auth';
import { MobileShell } from '../components/MobileShell';
import { Button } from '../components/Button';
import { Field, Input } from '../components/Field';
import { BackButton } from '../components/BackButton';

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const prefill = (location.state as { contact?: string } | null)?.contact ?? '';
  const [contact, setContact] = useState(prefill);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await api.login({ contact, password });
      saveUser(user);
      navigate('/join');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <MobileShell>
      <BackButton to="/" label="Create account" />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, marginTop: 24 }}>
        <div style={{ width: 60, height: 60, borderRadius: 16, background: 'var(--blue-bg)', border: '2.5px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, color: 'var(--blue-dark)', boxShadow: '2.5px 2.5px 0 var(--border)' }}>✶</div>
        <h1 style={{ fontSize: 28, margin: '8px 0 0' }}>Trip Splitter</h1>
        <p style={{ fontSize: 16, color: '#8a8a86', margin: 0 }}>Sign in to your account</p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 28 }}>
        <Field label="Phone or email">
          <Input placeholder="Phone or email" value={contact} onChange={e => setContact(e.target.value)} required />
        </Field>
        <Field label="Password">
          <Input type="password" placeholder="Your password" value={password} onChange={e => setPassword(e.target.value)} required />
        </Field>
        {error && <p style={{ color: 'red', fontSize: 14, margin: 0 }}>{error}</p>}
        <Button type="submit" disabled={loading}>{loading ? 'Signing in…' : 'Sign in →'}</Button>
      </form>

      <div style={{ marginTop: 20, textAlign: 'center', fontSize: 15, color: '#8a8a86' }}>
        No account yet?{' '}
        <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: 'var(--blue)', fontSize: 15, cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'underline' }}>
          Create one
        </button>
      </div>
    </MobileShell>
  );
}
