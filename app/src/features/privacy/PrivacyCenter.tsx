import { EmptyState, NavBar, Screen } from '@/design/components'

/** Placeholder — replaced by the feature build. */
export function PrivacyCenter() {
  return (
    <Screen noTabBar top={<NavBar title="Privacy" />}>
      <EmptyState title="Privacy" message="The Privacy Center is being built." />
    </Screen>
  )
}
