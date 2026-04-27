const API_URL = 'http://localhost:5000';

export const fetchTasks = async () => {
  const response = await fetch(`${API_URL}/tasks`);
  return response.json();
};

export const createTask = async (title, important = false) => {
  const response = await fetch(`${API_URL}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, important })
  });
  return response.json();
};

export const updateTaskStatus = async (id, completed, important) => {
  const payload = { completed };
  if (important !== undefined) payload.important = important;
  const response = await fetch(`${API_URL}/tasks/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return response.json();
};

export const deleteTaskFromApi = async (id) => {
  await fetch(`${API_URL}/tasks/${id}`, {
    method: 'DELETE'
  });
};

export const fetchScore = async () => {
  const response = await fetch(`${API_URL}/score`);
  return response.json();
};