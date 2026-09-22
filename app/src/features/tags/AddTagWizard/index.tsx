import { EmptyState, NavBar, Screen } from '@/design/components'

/** Placeholder — replaced by the feature build. */
export function AddTagWizard() {
  return (
    <Screen noTabBar top={<NavBar title="Add a tag" />}>
      <EmptyState title="Add a tag" message="The pairing wizard is being built." />
    </Screen>
  )
}
