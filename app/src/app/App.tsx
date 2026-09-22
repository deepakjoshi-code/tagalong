import { BrowserRouter } from 'react-router'
import { Providers } from './Providers'
import { AppRoutes } from './router'

export function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Providers>
        <AppRoutes />
      </Providers>
    </BrowserRouter>
  )
}
