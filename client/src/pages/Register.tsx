import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { MobileShell } from '../components/MobileShell';
import { Button } from '../components/Button';
import { Field, Input } from '../components/Field';

export function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.register({ name, contact, password });
      navigate('/login', { state: { contact } });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <MobileShell>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, marginTop: 48 }}>
        <div style={{ width: 60, height: 60, borderRadius: 16, background: 'var(--blue-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, color: 'var(--blue-dark)', boxShadow: 'var(--shadow-md)' }}>✶</div>
        <h1 style={{ fontSize: 28, margin: '8px 0 0' }}>Trip Splitter</h1>
        <p style={{ fontSize: 16, color: 'var(--text-muted)', margin: 0 }}>Create your account</p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 28 }}>
        <Field label="Your name">
          <Input placeholder="Your name" value={name} onChange={e => setName(e.target.value)} required />
        </Field>
        <Field label="Phone or email">
          <Input placeholder="Phone or email" value={contact} onChange={e => setContact(e.target.value)} required />
        </Field>
        <Field label="Password">
          <Input type="password" placeholder="Choose a password" value={password} onChange={e => setPassword(e.target.value)} required />
        </Field>
        {error && <p style={{ color: 'red', fontSize: 14, margin: 0 }}>{error}</p>}
        <Button type="submit" disabled={loading}>{loading ? 'Creating account…' : 'Create account →'}</Button>
      </form>

      <div style={{ marginTop: 20, textAlign: 'center', fontSize: 15, color: 'var(--text-muted)' }}>
        Already have an account?{' '}
        <button onClick={() => navigate('/login')} style={{ background: 'none', border: 'none', color: 'var(--blue)', fontSize: 15, cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'underline' }}>
          Sign in
        </button>
      </div>
    </MobileShell>
  );
}
