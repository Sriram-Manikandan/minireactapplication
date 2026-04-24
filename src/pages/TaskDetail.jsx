import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import axios from 'axios'

export default function TaskDetail() {
  const { id } = useParams()
  const [task, setTask] = useState(null)

  useEffect(() => {
    fetchTask()
  }, [])

  const fetchTask = async () => {
    const res = await axios.get(`https://jsonplaceholder.typicode.com/todos/${id}`)
    setTask(res.data)
  }

  if (!task) return <p className='p-6'>Loading...</p>

  return (
    <div className='p-6'>
      <h1 className='text-xl font-bold'>Task Detail</h1>

      <p className='mt-4'>Title: {task.title}</p>
      <p>Status: {task.completed ? 'Completed' : 'Pending'}</p>

      <Link to='/tasks' className='text-blue-500 mt-4 block'>
        ← Back to Tasks
      </Link>
    </div>
  )
}
