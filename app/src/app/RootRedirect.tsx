import { Navigate } from 'react-router'
import { useStore } from '@/domain/store'

export function RootRedirect() {
  const onboarded = useStore((s) => s.settings.onboarded)
  return <Navigate to={onboarded ? '/tags' : '/welcome'} replace />
}
