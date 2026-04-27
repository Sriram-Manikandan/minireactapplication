/**
 * Calculates productivity score purely from task state.
 *
 * Rules:
 *   Completing a regular task:   +10 pts
 *   Completing an important task: +20 pts
 *
 * Score is always derived fresh from tasks — never stored — so it
 * stays consistent no matter how many times the API is called.
 */
const calculateScore = (tasks) => {
  if (!tasks || tasks.length === 0) return 0;

  return tasks
    .filter(t => t.completed)
    .reduce((total, task) => total + (task.important ? 20 : 10), 0);
};

module.exports = { calculateScore };