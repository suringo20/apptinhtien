import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { MobileShell } from '../components/MobileShell';
import { Button } from '../components/Button';
import { Field, Input } from '../components/Field';

interface MemberRow { name: string; contact: string; }

export function CreateTrip() {
  const navigate = useNavigate();
  const [tripName, setTripName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currency, setCurrency] = useState('₫');
  const [orgCode, setOrgCode] = useState('');
  const [members, setMembers] = useState<MemberRow[]>([{ name: '', contact: '' }]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function addMember() {
    setMembers(m => [...m, { name: '', contact: '' }]);
  }

  function removeMember(i: number) {
    setMembers(m => m.filter((_, idx) => idx !== i));
  }

  function updateMember(i: number, field: keyof MemberRow, value: string) {
    setMembers(m => m.map((row, idx) => idx === i ? { ...row, [field]: value } : row));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.createTrip({
        name: tripName,
        currency,
        orgCode,
        members: members.filter(m => m.name && m.contact),
        start_date: startDate || undefined,
        end_date: endDate || undefined,
      });
      navigate('/trip');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create trip');
    } finally {
      setLoading(false);
    }
  }

  return (
    <MobileShell>
      <h2 style={{ fontSize: 26, margin: '24px 0 20px' }}>New trip</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Field label="Trip name">
          <Input placeholder="e.g. Da Lat Weekend" value={tripName} onChange={e => setTripName(e.target.value)} required />
        </Field>
        <div style={{ display: 'flex', gap: 10 }}>
          <Field label="Start date"><Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} /></Field>
          <Field label="End date"><Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} /></Field>
        </div>
        <Field label="Currency">
          <select value={currency} onChange={e => setCurrency(e.target.value)} style={{ width: '100%', border: '2px solid #d3d2cc', borderRadius: 11, padding: '9px 12px', fontSize: 17, fontFamily: 'inherit', background: '#fff' }}>
            {['₫', '$', '€', '£'].map(c => <option key={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="Organizer code">
          <Input type="password" placeholder="Set a secret code for organizer access" value={orgCode} onChange={e => setOrgCode(e.target.value)} required />
        </Field>

        <p style={{ fontSize: 13, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '4px 0 0' }}>Members</p>
        {members.map((m, i) => (
          <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
            <Field label="Name"><Input placeholder="Name" value={m.name} onChange={e => updateMember(i, 'name', e.target.value)} /></Field>
            <Field label="Phone / email"><Input placeholder="Phone or email" value={m.contact} onChange={e => updateMember(i, 'contact', e.target.value)} /></Field>
            {members.length > 1 && <button type="button" onClick={() => removeMember(i)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#c8c7c1', marginBottom: 2 }}>×</button>}
          </div>
        ))}
        <button type="button" onClick={addMember} style={{ border: '2px dashed #bdbcb6', borderRadius: 10, padding: 8, textAlign: 'center', color: '#8a8a86', fontSize: 15, background: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>+ Add member</button>

        {error && <p style={{ color: 'red', fontSize: 14, margin: 0 }}>{error}</p>}
        <Button type="submit" disabled={loading} style={{ marginTop: 8 }}>{loading ? 'Creating…' : 'Start trip →'}</Button>
      </form>
    </MobileShell>
  );
}
