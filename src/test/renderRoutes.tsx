import { render } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import type { ReactElement } from 'react'
import { LocationProbe } from './LocationProbe'

interface Options {
  path: string
  initialEntry?: string | { pathname: string; state: unknown }
  extraRoutes?: Record<string, string>
}

export const renderRoutes = (element: ReactElement, { path, initialEntry, extraRoutes = {} }: Options) =>
  render(
    <MemoryRouter initialEntries={[initialEntry ?? path]}>
      <Routes>
        <Route path={path} element={element} />
        {Object.entries(extraRoutes).map(([route, label]) => (
          <Route key={route} path={route} element={<LocationProbe label={label} />} />
        ))}
      </Routes>
    </MemoryRouter>,
  )
