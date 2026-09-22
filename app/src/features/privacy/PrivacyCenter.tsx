import { Eraser, FileJson, HardDrive, ShieldCheck, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button, Card, ListGroup, ListRow, NavBar, Screen, Sheet, toast } from '@/design/components'
import { privacyInventory } from '@/domain/selectors'
import { useStore } from '@/domain/store'
import { buildExport, downloadJson } from '@/lib/exportData'
import { deleteAllClips } from '@/lib/clips'
import { plural } from '@/lib/format'
import { disconnectAll } from '@/transport/manager'
import { isIosSafari, isStoragePersisted, requestPersistentStorage } from '@/lib/persistence'
import { isStandalone } from '@/lib/install'

export function PrivacyCenter() {
  const state = useStore()
  const inv = privacyInventory(state)
  const [wipeSheet, setWipeSheet] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const [persisted, setPersisted] = useState<boolean | null>(null)

  useEffect(() => {
    void isStoragePersisted().then(setPersisted)
  }, [])

  const atEvictionRisk = persisted === false && isIosSafari() && !isStandalone()

  const exportAll = () => {
    downloadJson('tagalong-data.json', buildExport(state))
    toast.success('Saved to your downloads')
  }

  const wipe = async () => {
    await disconnectAll()
    await deleteAllClips()
    await state.wipeAll()
    setWipeSheet(false)
    setConfirmText('')
    toast.success('Everything deleted from this phone')
  }

  return (
    <Screen noTabBar top={<NavBar title="Privacy" backTo="/settings" backLabel="Settings" />} title="Privacy Center">
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <ShieldCheck size={24} color="var(--success)" aria-hidden="true" />
          <strong style={{ font: 'var(--text-title-3)' }}>What Tagalong knows</strong>
        </div>
        <p style={{ font: 'var(--text-callout)', color: 'var(--text-2)' }}>
          All of it lives on this phone. There is no Tagalong account and no Tagalong server, so none of this
          has ever been sent anywhere.
        </p>
      </Card>

      <ListGroup header="On this phone">
        <ListRow title="Kids" value={String(inv.kids)} />
        <ListRow title="Names saved" value={inv.kidsWithNames === 0 ? 'None' : plural(inv.kidsWithNames, 'name')} />
        <ListRow title="Name recordings" value={inv.nameClips === 0 ? 'None' : plural(inv.nameClips, 'recording')} />
        <ListRow title="Tags" value={String(inv.tags)} />
        <ListRow title="Activity entries" value={`${inv.events} (last 7 days)`} />
      </ListGroup>

      <ListGroup header="Never collected" footer="Tags have no microphone, no camera and no location hardware. They cannot be used to find a child.">
        <ListRow title="Location" value="Never" />
        <ListRow title="Audio or video" value="Never" />
        <ListRow title="Analytics or crash reports" value="Never" />
        <ListRow title="Third-party services" value="None" />
      </ListGroup>

      <ListGroup
        header="Keeping your data safe"
        footer={
          persisted
            ? 'Your browser has been asked to keep this data and agreed. It stays until you delete it.'
            : atEvictionRisk
              ? 'On iPhone, Safari deletes web-app data after about 7 days without use. Add Tagalong to your Home Screen and it stays put.'
              : 'Your browser may clear this data if storage runs low or the app goes unused for a long time.'
        }
      >
        <ListRow
          title="Storage"
          value={persisted === null ? 'Checking…' : persisted ? 'Protected' : 'Not guaranteed'}
        />
        {persisted === false && (
          <ListRow
            title="Ask my browser to keep it"
            icon={<HardDrive size={18} />}
            iconTint="var(--accent)"
            onClick={() => {
              void requestPersistentStorage().then((ok) => {
                setPersisted(ok)
                toast.show(ok ? 'Your browser will keep this data' : 'Your browser declined. Installing the app helps.')
              })
            }}
            chevron={false}
          />
        )}
      </ListGroup>

      <ListGroup header="Your data" footer="Export gives you a readable JSON file of everything except audio recordings.">
        <ListRow
          title="Export my data"
          subtitle="Download a copy as JSON"
          icon={<FileJson size={18} />}
          iconTint="var(--accent)"
          onClick={exportAll}
          chevron={false}
        />
        <ListRow
          title="Clear activity"
          subtitle="Removes the 7-day event log"
          icon={<Eraser size={18} />}
          iconTint="var(--text-3)"
          onClick={() => {
            state.clearEvents()
            toast.show('Activity cleared')
          }}
          chevron={false}
        />
        <ListRow
          title="Delete everything"
          icon={<Trash2 size={18} />}
          onClick={() => setWipeSheet(true)}
          destructive
          chevron={false}
        />
      </ListGroup>

      <p style={{ font: 'var(--text-footnote)', color: 'var(--text-2)', textAlign: 'center', padding: '0 16px' }}>
        No servers. No accounts. No analytics. We literally can’t see your data.
      </p>

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
            <Button
              size="lg"
              block
              variant="destructive"
              disabled={confirmText.trim().toUpperCase() !== 'DELETE'}
              onClick={() => void wipe()}
            >
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
