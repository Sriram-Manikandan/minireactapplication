import React from 'react';
import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav style={{ display: 'flex', gap: '1rem', padding: '1rem', background: '#2d6a4f', color: 'white' }}>
      <Link style={{ color: 'white' }} to="/feed">Feed</Link>
      <Link style={{ color: 'white' }} to="/issues">Issues</Link>
      <Link style={{ color: 'white' }} to="/events">Events</Link>
      <Link style={{ color: 'white' }} to="/recommendations">Recommendations</Link>
    </nav>
  );
}