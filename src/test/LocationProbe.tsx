import { useLocation } from 'react-router-dom'

export function LocationProbe({ label }: { label: string }) {
  const location = useLocation()
  return (
    <div>
      <p>{label}</p>
      <output data-testid="state">{JSON.stringify(location.state)}</output>
    </div>
  )
}
