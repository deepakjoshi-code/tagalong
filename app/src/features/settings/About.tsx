import { ListGroup, ListRow, NavBar, Screen, ThingIcon } from '@/design/components'
import { loadedPacks } from '@/content'

const VERSION = '0.1.0'

export function About() {
  return (
    <Screen noTabBar top={<NavBar title="About" backTo="/settings" backLabel="Settings" />}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '24px 0' }}>
        <ThingIcon thing="bottle" size={96} mood="happy" />
        <h1 style={{ font: 'var(--text-title-1)' }}>Tagalong</h1>
        <p style={{ font: 'var(--text-subhead)', color: 'var(--text-2)' }}>Give anything a voice.</p>
      </div>

      <ListGroup header="This app">
        <ListRow title="Version" value={VERSION} />
        <ListRow title="Content packs" value={loadedPacks().length ? loadedPacks().join(', ') : 'none loaded'} />
        <ListRow title="Works offline" value="Yes" />
        <ListRow title="Servers used" value="Only to download the app" />
      </ListGroup>

      <ListGroup
        header="How it works"
        footer="Tagalong talks to your tags over Bluetooth, directly from this phone. There is no Tagalong account and no analytics, and nothing about your family is sent anywhere. Downloading or updating the app itself is an ordinary web request, which whoever hosts it can see like any website visit. Your tags have no microphone, no camera and no location."
      >
        <ListRow title="Connection" value="Bluetooth" />
        <ListRow title="Storage" value="This device" />
        <ListRow title="Microphone on the tag" value="None" />
      </ListGroup>

      <ListGroup header="Open source" footer="Tagalong is built with React, Vite, Zustand, Zod, Motion and Lucide icons. Their licences are included in the app bundle.">
        <ListRow title="Made with" value="React · Vite" />
      </ListGroup>
    </Screen>
  )
}
