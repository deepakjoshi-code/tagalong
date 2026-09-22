import { Download, Plus, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button, Card, EmptyState, IconButton, LinkButton, Screen, ThingIcon } from '@/design/components'
import { lastEventForTag } from '@/domain/selectors'
import { useStore } from '@/domain/store'
import { useInstallPrompt } from '@/lib/install'
import s from './Home.module.css'
import { TagCard } from './TagCard'

export function Home() {
  const tags = useStore((st) => st.tags)
  const kids = useStore((st) => st.kids)
  const events = useStore((st) => st.events)
  const demoMode = useStore((st) => st.settings.demoMode)
  const { canInstall, install } = useInstallPrompt()
  const [installDismissed, setInstallDismissed] = useState(false)
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30_000)
    return () => clearInterval(t)
  }, [])

  const data = { tags, kids, events }

  return (
    <Screen
      title="Tags"
      subtitle={demoMode ? 'Demo mode is on' : undefined}
      trailing={
        <IconButton label="Add a tag" variant="accent" onClick={() => (window.location.href = '/tags/new')}>
          <Plus size={24} strokeWidth={2.4} />
        </IconButton>
      }
    >
      {tags.length === 0 ? (
        <EmptyState
          art={
            <>
              <ThingIcon thing="lunchbox" size={64} mood="happy" />
              <ThingIcon thing="bottle" size={96} mood="excited" bounce />
              <ThingIcon thing="backpack" size={64} mood="curious" />
            </>
          }
          title="No tags yet"
          message="Add your first Tagalong and give something a voice."
          actions={
            <>
              <LinkButton to="/tags/new" size="lg" block leading={<Plus size={20} />}>
                Add a tag
              </LinkButton>
              <LinkButton to="/demo" size="lg" block variant="tertiary">
                Try the demo
              </LinkButton>
            </>
          }
        />
      ) : (
        <div className={s.list}>
          {canInstall && !installDismissed && (
            <Card flat tight className={s.install}>
              <Download size={22} aria-hidden="true" />
              <div className={s.installText}>
                <span className={s.installTitle}>Add Tagalong to your home screen</span>
                <span className={s.installSub}>Works offline. Nothing to sign up for.</span>
              </div>
              <Button size="sm" variant="secondary" onClick={() => void install()}>
                Install
              </Button>
              <IconButton label="Dismiss" variant="plain" onClick={() => setInstallDismissed(true)}>
                <X size={18} />
              </IconButton>
            </Card>
          )}
          {tags.map((tag) => (
            <TagCard
              key={tag.id}
              tag={tag}
              kid={kids.find((k) => k.id === tag.kidId)}
              lastEvent={lastEventForTag(data as never, tag.id)}
              now={now}
            />
          ))}
          {demoMode && <p className={s.demoNote}>Demo tags react in the playground. Turn off Demo mode in Settings to pair real tags.</p>}
        </div>
      )}
    </Screen>
  )
}
