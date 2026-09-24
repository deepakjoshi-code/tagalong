import { Bluetooth, Info, TriangleAlert } from 'lucide-react'
import { useState } from 'react'
import { Button, toast } from '@/design/components'
import { useStore } from '@/domain/store'
import { describeTransportError, getTransport, isWebBluetoothSupported } from '@/transport'
import { haptics } from '@/lib/haptics'
import s from '../Wizard.module.css'
import type { WizardDraft } from '../types'

export interface StepProps {
  draft: WizardDraft
  patch: (p: Partial<WizardDraft>) => void
  next: () => void
}

const NO_BLUETOOTH_COPY =
  'This browser cannot reach a real tag. Use Chrome on Android, or choose a demo tag below.'

export function StepFind({ draft, patch, next }: StepProps) {
  const demoMode = useStore((st) => st.settings.demoMode)
  const updateSettings = useStore((st) => st.updateSettings)
  const [searching, setSearching] = useState(false)
  const supported = isWebBluetoothSupported()

  const search = async (forceDemo = false) => {
    const demoWanted = forceDemo || useStore.getState().settings.demoMode
    const { transport, reason } = getTransport({ demoMode: demoWanted })

    // Without Web Bluetooth the transport silently falls back to a pretend tag.
    // Creating one must always be a deliberate choice, never the result of
    // tapping Search and being told setup succeeded.
    if (reason === 'unsupported' && !demoWanted) {
      toast.error(NO_BLUETOOTH_COPY)
      return
    }

    setSearching(true)
    try {
      const found = await transport.requestTag()
      haptics.success()
      patch({ deviceId: found.deviceId, deviceName: found.name, simulated: reason !== 'bluetooth' })
      next()
    } catch (e) {
      toast.error(describeTransportError(e))
    } finally {
      setSearching(false)
    }
  }

  const useDemoTag = () => {
    updateSettings({ demoMode: true })
    void search(true)
  }

  return (
    <>
      <div className={s.heading}>
        <h1 className={s.title}>Find your tag</h1>
        <p className={s.sub}>
          {demoMode
            ? 'Demo mode is on, so we’ll create a pretend tag you can play with.'
            : 'Hold the button on the tag until it giggles, then tap Search.'}
        </p>
      </div>

      <div className={s.center}>
        <div className={s.pulse}>
          <img className={s.tagArt} src={`${import.meta.env.BASE_URL}icons/icon.svg`} alt="" width={112} height={112} />
        </div>
      </div>

      {!supported && !demoMode && (
        <div className={s.warn}>
          <TriangleAlert size={20} className={s.warnIcon} aria-hidden="true" />
          <span>
            This browser can’t use Bluetooth yet. Chrome on Android works today, and the iPhone app is
            coming. You can still try everything with a demo tag.
          </span>
        </div>
      )}

      <div className={s.privacy}>
        <Info size={18} aria-hidden="true" />
        <span>Pairing happens directly between this phone and the tag. Nothing is sent anywhere else.</span>
      </div>

      <div className={s.footer}>
        <Button
          size="lg"
          block
          loading={searching}
          disabled={!supported && !demoMode}
          onClick={() => void search(false)}
          leading={<Bluetooth size={20} />}
        >
          {demoMode ? 'Create a demo tag' : 'Search'}
        </Button>
        {!demoMode && (
          <Button size="lg" block variant="tertiary" onClick={useDemoTag}>
            Use a demo tag instead
          </Button>
        )}
        {draft.deviceId && (
          <Button size="lg" block variant="ghost" onClick={next}>
            Continue with the tag you found
          </Button>
        )}
      </div>
    </>
  )
}
