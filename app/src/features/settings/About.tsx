import { EmptyState, NavBar, Screen } from '@/design/components'

/** Placeholder — replaced by the feature build. */
export function About() {
  return (
    <Screen noTabBar top={<NavBar title="About" />}>
      <EmptyState title="About" message="About Tagalong." />
    </Screen>
  )
}
