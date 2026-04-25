import React, { useState } from 'react';

const CATEGORIES = ['Plumber', 'Electrician', 'Grocery', 'Doctor', 'Tutor', 'Other'];

export default function Recommendations() {
  const [recs, setRecs] = useState([
    { id: 1, name: 'Ravi Electricals', category: 'Electrician', contact: '98765 43210', note: 'Very reliable, fixed our wiring quickly.' },
    { id: 2, name: 'Fresh Basket', category: 'Grocery', contact: '98001 12345', note: 'Fresh vegetables delivered daily.' },
  ]);
  const [form, setForm] = useState({ name: '', category: 'Plumber', contact: '', note: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name) return;
    setRecs([...recs, { ...form, id: Date.now() }]);
    setForm({ name: '', category: 'Plumber', contact: '', note: '' });
  };

  return (
    <div style={{ padding: '1.5rem' }}>
      <h2>Local Recommendations</h2>
      <form onSubmit={handleSubmit} style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', maxWidth: '400px' }}>
        <input placeholder="Business or person name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
        <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
        <input placeholder="Contact number (optional)" value={form.contact} onChange={e => setForm({ ...form, contact: e.target.value })} />
        <textarea placeholder="Why do you recommend them?" value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} />
        <button type="submit">Add Recommendation</button>
      </form>
      {recs.map(r => (
        <div key={r.id} style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
          <h3>{r.name} <span style={{ fontSize: '0.8rem', background: '#e8f5e9', padding: '2px 8px', borderRadius: '12px' }}>{r.category}</span></h3>
          {r.contact && <p><strong>Contact:</strong> {r.contact}</p>}
          <p>{r.note}</p>
        </div>
      ))}
    </div>
  );
}