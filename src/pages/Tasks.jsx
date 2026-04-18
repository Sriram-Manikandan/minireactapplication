import { useEffect, useState } from 'react'
import axios from 'axios'
import TaskCard from '../components/TaskCard'

export default function Tasks() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    const res = await axios.get('https://jsonplaceholder.typicode.com/todos?_limit=10')
    setTasks(res.data)
    setLoading(false)
  }

  return (
    <div className='p-6'>
      <h1 className='text-xl font-bold mb-4'>Tasks</h1>

      {loading ? (
        <p>Loading...</p>
      ) : (
        tasks.map(task => <TaskCard key={task.id} task={task} />)
      )}
    </div>
  )
}
