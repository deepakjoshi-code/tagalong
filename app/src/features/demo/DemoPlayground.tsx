import { EmptyState, NavBar, Screen } from '@/design/components'

/** Placeholder — replaced by the feature build. */
export function DemoPlayground() {
  return (
    <Screen noTabBar top={<NavBar title="Demo" />}>
      <EmptyState title="Demo" message="The demo playground is being built." />
    </Screen>
  )
}
