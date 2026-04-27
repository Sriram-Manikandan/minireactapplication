import React, { useState } from 'react';

export default function Events() {
  const [events, setEvents] = useState([
    { id: 1, title: 'Street Cleanup Drive', date: '2026-05-01', description: 'Join us to clean up Main Street.' },
    { id: 2, title: 'Neighbourhood Meetup', date: '2026-05-10', description: 'Monthly gathering at the community hall.' },
  ]);
  const [form, setForm] = useState({ title: '', date: '', description: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title || !form.date) return;
    setEvents([...events, { ...form, id: Date.now() }]);
    setForm({ title: '', date: '', description: '' });
  };

  return (
    <div style={{ padding: '1.5rem' }}>
      <h2>Community Events</h2>
      <form onSubmit={handleSubmit} style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', maxWidth: '400px' }}>
        <input placeholder="Event title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
        <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required />
        <textarea placeholder="Details (optional)" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
        <button type="submit">Post Event</button>
      </form>
      {events.map(ev => (
        <div key={ev.id} style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
          <h3>{ev.title}</h3>
          <p><strong>Date:</strong> {ev.date}</p>
          <p>{ev.description}</p>
        </div>
      ))}
    </div>
  );
}