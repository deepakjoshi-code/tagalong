import { EmptyState, NavBar, Screen } from '@/design/components'

/** Placeholder — replaced by the feature build. */
export function KidEditor() {
  return (
    <Screen noTabBar top={<NavBar title="Kid" />}>
      <EmptyState title="Kid" message="The kid editor is being built." />
    </Screen>
  )
}
