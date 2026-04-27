import React, { useState } from 'react';
import { createTask } from '../services/api';
import { Plus, Star } from 'lucide-react';

const TaskForm = ({ onTaskCreated }) => {
  const [title, setTitle] = useState('');
  const [important, setImportant] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      await createTask(title, important);
      setTitle('');
      setImportant(false);
      onTaskCreated();
    } catch (err) {
      console.error('Error creating task:', err);
    }
  };

  return (
    <div className="form-card animate-fade">
      <h4>Create New Task</h4>
      <form onSubmit={handleSubmit}>
        <div className="input-wrapper">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Focus on what matters..."
            className="styled-input"
          />
        </div>

        <div
          onClick={() => setImportant(v => !v)}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            cursor: 'pointer', marginBottom: '1rem', padding: '8px 12px',
            borderRadius: '8px',
            background: important ? '#fef9c3' : '#f8fafc',
            border: `1px solid ${important ? '#fde68a' : '#e2e8f0'}`,
            transition: 'all 0.2s', userSelect: 'none'
          }}
        >
          <Star size={18} fill={important ? '#f59e0b' : 'none'} color={important ? '#f59e0b' : '#94a3b8'} />
          <span style={{ fontSize: '0.875rem', fontWeight: 500, color: important ? '#854d0e' : '#64748b' }}>
            {important ? 'Important — worth 20 pts' : 'Mark as Important'}
          </span>
        </div>

        <button type="submit" className="primary-button">
          <Plus size={20} strokeWidth={3} />
          <span>Quick Add</span>
        </button>
      </form>

      <div style={{ marginTop: '2rem', padding: '1rem', borderTop: '1px solid #f1f5f9' }}>
        <p className="text-muted" style={{ fontSize: '0.85rem' }}>
          Complete tasks to earn points. Important tasks earn <strong>20 pts</strong>, regular tasks earn <strong>10 pts</strong>.
        </p>
      </div>
    </div>
  );
};

export default TaskForm;