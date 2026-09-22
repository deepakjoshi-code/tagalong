import { EmptyState, NavBar, Screen } from '@/design/components'

/** Placeholder — replaced by the feature build. */
export function TagDetail() {
  return (
    <Screen noTabBar top={<NavBar title="Tag" />}>
      <EmptyState title="Tag" message="Tag details are being built." />
    </Screen>
  )
}
