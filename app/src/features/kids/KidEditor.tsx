import { Mic, Play, Square, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { Avatar, Button, ListGroup, ListRow, NavBar, Screen, Sheet, toast } from '@/design/components'
import { AGE_BAND_META } from '@/domain/ageBands'
import { useStore } from '@/domain/store'
import { AGE_BANDS, type AgeBand } from '@/domain/types'
import { MAX_CLIP_MS, canRecord, deleteClip, loadClip, recordClip, saveClip } from '@/lib/clips'
import { haptics } from '@/lib/haptics'
import { plural } from '@/lib/format'
import s from './KidEditor.module.css'

export function KidEditor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isNew = !id || id === 'new'
  const kid = useStore((st) => (isNew ? undefined : st.kids.find((k) => k.id === id)))
  const tagCount = useStore((st) => (kid ? st.tags.filter((t) => t.kidId === kid.id).length : 0))
  const addKid = useStore((st) => st.addKid)
  const updateKid = useStore((st) => st.updateKid)
  const removeKid = useStore((st) => st.removeKid)

  const [name, setName] = useState(kid?.displayName ?? '')
  const [band, setBand] = useState<AgeBand>(kid?.ageBand ?? 'kid')
  const [recording, setRecording] = useState(false)
  const [deleteSheet, setDeleteSheet] = useState(false)

  useEffect(() => {
    if (!isNew && !kid) navigate('/kids', { replace: true })
  }, [isNew, kid, navigate])

  const save = () => {
    const trimmed = name.trim()
    if (isNew) {
      addKid(trimmed ? { ageBand: band, displayName: trimmed } : { ageBand: band })
      haptics.success()
      navigate('/kids', { replace: true })
      return
    }
    if (!kid) return
    updateKid(kid.id, { ageBand: band, displayName: trimmed || undefined })
    haptics.success()
    toast.success('Saved')
    navigate('/kids', { replace: true })
  }

  const record = async () => {
    if (!kid) return
    setRecording(true)
    try {
      const { blob, durationMs } = await recordClip()
      const blobKey = await saveClip(kid.id, blob)
      updateKid(kid.id, { nameClip: { blobKey, durationMs: Math.min(durationMs, MAX_CLIP_MS) } })
      haptics.success()
      toast.success('Name recorded')
    } catch {
      toast.error('Couldn’t record. Check microphone permission.')
    } finally {
      setRecording(false)
    }
  }

  const playClip = async () => {
    if (!kid?.nameClip) return
    const blob = await loadClip(kid.nameClip.blobKey)
    if (!blob) return toast.error('That recording is missing.')
    const url = URL.createObjectURL(blob)
    const audio = new Audio(url)
    audio.onended = () => URL.revokeObjectURL(url)
    void audio.play()
  }

  const removeClip = async () => {
    if (!kid?.nameClip) return
    await deleteClip(kid.nameClip.blobKey)
    updateKid(kid.id, { nameClip: undefined })
    toast.show('Recording deleted')
  }

  return (
    <Screen noTabBar top={<NavBar title={isNew ? 'New kid' : 'Kid'} backTo="/kids" backLabel="Kids" />}>
      <div className={s.head}>
        <Avatar name={name || kid?.displayName} seed={kid?.id ?? 'new'} size={88} />
      </div>

      <div className={s.field}>
        <label className={s.label} htmlFor="kid-name">
          First name (optional)
        </label>
        <input
          id="kid-name"
          className={s.input}
          value={name}
          maxLength={24}
          autoComplete="off"
          placeholder="Leave blank if you’d rather not"
          onChange={(e) => setName(e.target.value)}
        />
        <p className={s.hint}>Shown only on this phone. Tags never receive a name as text.</p>
      </div>

      <div className={s.field}>
        <span className={s.label}>Age</span>
        <div className={s.cards}>
          {AGE_BANDS.map((b: AgeBand) => (
            <button key={b} type="button" className={s.bandCard} aria-pressed={band === b} onClick={() => setBand(b)}>
              <span className={s.bandText}>
                <span className={s.bandLabel}>{AGE_BAND_META[b].label}</span>
                <span className={s.bandRange}>
                  {AGE_BAND_META[b].range} · {AGE_BAND_META[b].blurb}
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>

      {!isNew && kid && (
        <ListGroup
          header="Name recording"
          footer="Optional. Record the name once and tags can say it. Stored on this phone and on your tags only, never uploaded."
        >
          {kid.nameClip ? (
            <>
              <ListRow title="Recorded" subtitle={`${Math.round(kid.nameClip.durationMs / 100) / 10}s`} />
              <div className={s.recRow}>
                <Button block variant="tertiary" leading={<Play size={18} />} onClick={() => void playClip()}>
                  Play
                </Button>
                <Button block variant="destructive" leading={<Trash2 size={18} />} onClick={() => void removeClip()}>
                  Delete
                </Button>
              </div>
            </>
          ) : canRecord() ? (
            <ListRow
              title={recording ? 'Listening…' : 'Record the name'}
              subtitle="Say it once, clearly. Up to 1.5 seconds."
              icon={recording ? <Square size={18} /> : <Mic size={18} />}
              onClick={() => void record()}
              disabled={recording}
              chevron={false}
            />
          ) : (
            <ListRow title="Recording not available" subtitle="This browser can’t record audio." />
          )}
        </ListGroup>
      )}

      <Button size="lg" block onClick={save}>
        {isNew ? 'Add kid' : 'Save'}
      </Button>

      {!isNew && kid && (
        <ListGroup>
          <ListRow title="Delete this kid" onClick={() => setDeleteSheet(true)} destructive center chevron={false} />
        </ListGroup>
      )}

      <Sheet
        open={deleteSheet}
        onClose={() => setDeleteSheet(false)}
        title={`Delete ${kid?.displayName || 'this kid'}?`}
        subtitle={
          tagCount > 0
            ? `This also removes ${plural(tagCount, 'tag')} and their activity from this phone.`
            : 'This removes their details from this phone.'
        }
        footer={
          <>
            <Button
              size="lg"
              block
              variant="destructive"
              onClick={async () => {
                if (kid?.nameClip) await deleteClip(kid.nameClip.blobKey)
                if (kid) removeKid(kid.id)
                setDeleteSheet(false)
                navigate('/kids', { replace: true })
              }}
            >
              Delete
            </Button>
            <Button size="lg" block variant="tertiary" onClick={() => setDeleteSheet(false)}>
              Cancel
            </Button>
          </>
        }
      />
    </Screen>
  )
}
