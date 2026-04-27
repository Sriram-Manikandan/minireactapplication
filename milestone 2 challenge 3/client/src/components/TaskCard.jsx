import React from 'react';
import { updateTaskStatus, deleteTaskFromApi } from '../services/api';
import { Trash2, Check, Star } from 'lucide-react';

const TaskCard = ({ task, onTaskUpdated }) => {
  const handleToggle = async () => {
    try {
      await updateTaskStatus(task.id, !task.completed);
      onTaskUpdated();
    } catch (err) {
      console.error('Error updating task:', err);
    }
  };

  const handleImportantToggle = async () => {
    try {
      await updateTaskStatus(task.id, task.completed, !task.important);
      onTaskUpdated();
    } catch (err) {
      console.error('Error toggling importance:', err);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteTaskFromApi(task.id);
      onTaskUpdated();
    } catch (err) {
      console.error('Error deleting task:', err);
    }
  };

  return (
    <div className={`task-card-v2 animate-fade ${task.completed ? 'completed' : ''}`}>
      <div className="task-main">
        <div
          className={`custom-checkbox ${task.completed ? 'checked' : ''}`}
          onClick={handleToggle}
        >
          {task.completed && <Check size={16} strokeWidth={4} />}
        </div>

        <span className="task-text">{task.title}</span>

        {task.important && (
          <span style={{
            fontSize: '0.7rem', fontWeight: 700,
            background: '#fef9c3', color: '#854d0e',
            borderRadius: '999px', padding: '2px 10px',
            marginLeft: '8px', border: '1px solid #fde68a'
          }}>
            Important
          </span>
        )}
      </div>

      <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
        <button
          onClick={handleImportantToggle}
          className="action-btn"
          title={task.important ? 'Unmark Important' : 'Mark as Important'}
        >
          <Star size={18} fill={task.important ? '#f59e0b' : 'none'} color={task.important ? '#f59e0b' : undefined} />
        </button>

        <button onClick={handleDelete} className="action-btn" title="Delete Task">
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
};

export default TaskCard;