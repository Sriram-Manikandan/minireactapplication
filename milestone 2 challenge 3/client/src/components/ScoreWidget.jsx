import React, { useState, useEffect } from 'react';
import { fetchScore } from '../services/api';
import { Award, TrendingUp, Zap, Coffee, Star } from 'lucide-react';

const getStatus = (score) => {
  if (score === 0)  return { label: 'Complete a task to get started', Icon: Coffee, bg: '#94a3b8', text: '#1e293b' };
  if (score < 30)   return { label: 'Getting Started',               Icon: Coffee, bg: '#86efac', text: '#14532d' };
  if (score < 70)   return { label: 'Building Momentum',             Icon: TrendingUp, bg: '#67e8f9', text: '#164e63' };
  if (score < 120)  return { label: 'High Energy Today',             Icon: Zap,    bg: '#4ade80', text: '#064e3b' };
  return              { label: 'On Fire! 🔥',                        Icon: Star,   bg: '#fbbf24', text: '#78350f' };
};

const ScoreWidget = ({ tasks }) => {
  const [score, setScore] = useState(0);

  useEffect(() => {
    const getScore = async () => {
      try {
        const data = await fetchScore();
        setScore(data.value);
      } catch (err) {
        console.error('Error fetching score:', err);
      }
    };
    getScore();
  }, [tasks]);

  const { label, Icon, bg, text } = getStatus(score);
  const completedImportant = tasks.filter(t => t.completed && t.important).length;
  const completedRegular   = tasks.filter(t => t.completed && !t.important).length;

  return (
    <div className="score-hero-card">
      <div className="score-hero-left">
        <h2>Your Productivity</h2>
        <div className="score-big">
          {score}<span>pts</span>
        </div>

        <div style={{ marginTop: '0.75rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          {completedImportant > 0 && (
            <span style={{ fontSize: '0.8rem', opacity: 0.85 }}>
              ⭐ {completedImportant} important × 20 pts
            </span>
          )}
          {completedRegular > 0 && (
            <span style={{ fontSize: '0.8rem', opacity: 0.85 }}>
              ✓ {completedRegular} regular × 10 pts
            </span>
          )}
        </div>

        <p style={{ marginTop: '0.75rem', opacity: 0.7 }}>
          Keep completing tasks to reach your daily goal!
        </p>
      </div>

      <div className="score-hero-right">
        <div className="status-badge" style={{ background: bg, color: text, marginBottom: '1rem' }}>
          <Icon size={16} />
          {label}
        </div>
        <div className="logo-icon" style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', color: 'white' }}>
          <Award size={48} />
        </div>
      </div>
    </div>
  );
};

export default ScoreWidget;