import { BrowserRouter } from 'react-router'
import { Providers } from './Providers'
import { AppRoutes } from './router'

export function App() {
  return (
    <BrowserRouter>
      <Providers>
        <AppRoutes />
      </Providers>
    </BrowserRouter>
  )
}
