import { Download, FlaskConical, Info, Moon, ShieldCheck, Vibrate } from 'lucide-react'
import { useState } from 'react'
import { Button, ListGroup, ListRow, Screen, Segmented, Sheet, Toggle, toast } from '@/design/components'
import { useStore } from '@/domain/store'
import { disconnectAll } from '@/transport/manager'
import { deleteAllClips } from '@/lib/clips'
import { useInstallPrompt } from '@/lib/install'
import type { Appearance } from '@/domain/types'

export function SettingsHome() {
  const settings = useStore((s) => s.settings)
  const updateSettings = useStore((s) => s.updateSettings)
  const wipeAll = useStore((s) => s.wipeAll)
  const { canInstall, installed, install } = useInstallPrompt()
  const [wipeSheet, setWipeSheet] = useState(false)
  const [confirmText, setConfirmText] = useState('')

  const wipe = async () => {
    await disconnectAll()
    await deleteAllClips()
    await wipeAll()
    setWipeSheet(false)
    setConfirmText('')
    toast.success('Everything deleted from this phone')
  }

  return (
    <Screen title="Settings">
      <ListGroup header="App">
        <ListRow
          title="Appearance"
          icon={<Moon size={18} />}
          iconTint="var(--text-3)"
          trailing={
            <Segmented
              label="Appearance"
              value={settings.appearance}
              onChange={(appearance: Appearance) => updateSettings({ appearance })}
              options={[
                { value: 'system', label: 'Auto' },
                { value: 'light', label: 'Light' },
                { value: 'dark', label: 'Dark' },
              ]}
            />
          }
        />
        <ListRow
          title="Haptics"
          icon={<Vibrate size={18} />}
          iconTint="var(--text-3)"
          trailing={
            <Toggle label="Haptics" checked={settings.haptics} onChange={(haptics) => updateSettings({ haptics })} />
          }
        />
        {!installed && (
          <ListRow
            title="Add to home screen"
            subtitle={canInstall ? 'Works offline, no sign-up' : 'Use your browser’s Share menu'}
            icon={<Download size={18} />}
            iconTint="var(--accent)"
            onClick={canInstall ? () => void install() : undefined}
            chevron={false}
          />
        )}
      </ListGroup>

      <ListGroup
        header="Demo mode"
        footer="Demo mode creates pretend tags so you can try everything without hardware. Turn it off to pair a real tag."
      >
        <ListRow
          title="Demo mode"
          icon={<FlaskConical size={18} />}
          iconTint="var(--warning)"
          trailing={
            <Toggle
              label="Demo mode"
              checked={settings.demoMode}
              onChange={(demoMode) => updateSettings({ demoMode })}
            />
          }
        />
        <ListRow title="Open the playground" to="/demo" />
      </ListGroup>

      <ListGroup header="Privacy" footer="No account. No cloud. No analytics. Everything lives on this phone.">
        <ListRow
          title="Privacy Center"
          subtitle="See and delete everything Tagalong knows"
          icon={<ShieldCheck size={18} />}
          iconTint="var(--success)"
          to="/settings/privacy"
        />
        <ListRow
          title="Keep an activity log"
          subtitle="7 days, on this phone only"
          trailing={
            <Toggle
              label="Keep an activity log"
              checked={settings.eventLogEnabled}
              onChange={(eventLogEnabled) => updateSettings({ eventLogEnabled })}
            />
          }
        />
      </ListGroup>

      <ListGroup header="About">
        <ListRow title="About Tagalong" icon={<Info size={18} />} iconTint="var(--text-3)" to="/settings/about" />
      </ListGroup>

      <ListGroup>
        <ListRow title="Delete everything" onClick={() => setWipeSheet(true)} destructive center chevron={false} />
      </ListGroup>

      <Sheet
        open={wipeSheet}
        onClose={() => {
          setWipeSheet(false)
          setConfirmText('')
        }}
        title="Delete everything?"
        subtitle="Kids, tags, recordings and activity are permanently removed from this phone. Type DELETE to confirm."
        footer={
          <>
            <Button size="lg" block variant="destructive" disabled={confirmText.trim().toUpperCase() !== 'DELETE'} onClick={() => void wipe()}>
              Delete everything
            </Button>
            <Button
              size="lg"
              block
              variant="tertiary"
              onClick={() => {
                setWipeSheet(false)
                setConfirmText('')
              }}
            >
              Cancel
            </Button>
          </>
        }
      >
        <input
          aria-label="Type DELETE to confirm"
          placeholder="DELETE"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          style={{
            width: '100%',
            minHeight: 50,
            padding: '0 16px',
            borderRadius: 12,
            border: '1px solid var(--separator)',
            background: 'var(--surface-2)',
            font: 'var(--text-body)',
          }}
        />
      </Sheet>
    </Screen>
  )
}
