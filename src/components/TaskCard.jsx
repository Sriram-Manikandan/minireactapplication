import { Link } from 'react-router-dom'

export default function TaskCard({ task }) {
  return (
    <Link to={`/tasks/${task.id}`}>
      <div className={`p-4 border mb-2 ${task.completed ? 'bg-green-100' : 'bg-red-100'}`}>
        <h3>{task.title}</h3>
        <p>{task.completed ? 'Completed' : 'Pending'}</p>
      </div>
    </Link>
  )
}
