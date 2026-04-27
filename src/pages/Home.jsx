import { useEffect, useState } from 'react'
import axios from 'axios'

export default function Home() {
  const [advice, setAdvice] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAdvice()
  }, [])

  const fetchAdvice = async () => {
    setLoading(true)
    const res = await axios.get('https://api.adviceslip.com/advice')
    setAdvice(res.data.slip.advice)
    setLoading(false)
  }

  return (
    <div className='p-6'>
      <h1 className='text-xl font-bold'>Random Advice</h1>

      {loading ? <p>Loading...</p> : <p className='mt-4 text-green-600'>{advice}</p>}

      <button onClick={fetchAdvice} className='mt-4 px-4 py-2 bg-blue-500 text-white'>
        New Advice
      </button>
    </div>
  )
}
