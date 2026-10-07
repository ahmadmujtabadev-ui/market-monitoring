import { useCallback, useEffect, useState } from 'react'

export const useCountdown = (seconds: number) => {
  const [deadline, setDeadline] = useState(() => Date.now() + seconds * 1000)
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [])

  const restart = useCallback(() => {
    const current = Date.now()
    setNow(current)
    setDeadline(current + seconds * 1000)
  }, [seconds])

  return { remaining: Math.max(0, Math.ceil((deadline - now) / 1000)), restart }
}
