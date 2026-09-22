import { useEffect } from 'react'
import { pickPhrase } from '@/content/pickPhrase'
import { EVENT_META } from '@/domain/events'
import { isTagMuted } from '@/domain/selectors'
import { useStore } from '@/domain/store'
import { toast } from '@/design/components/toastStore'
import { onAnyTagEvent } from '@/transport/manager'

/**
 * Shows what a connected tag just said, while the app is open.
 * The tag speaks for itself — the phone only mirrors the line so a parent
 * can see what happened. Nothing is sent anywhere.
 */
export function useLiveTagEvents() {
  useEffect(
    () =>
      onAnyTagEvent((tagId, frame) => {
        const { tags, kids } = useStore.getState()
        const tag = tags.find((t) => t.id === tagId)
        if (!tag || isTagMuted(tag)) return
        const kid = kids.find((k) => k.id === tag.kidId)
        if (!kid) return
        const picked = pickPhrase({
          thing: tag.thing,
          event: frame.type,
          ageBand: kid.ageBand,
          personality: tag.personality,
          kidName: kid.displayName,
        })
        const what = EVENT_META[frame.type].kidWords
        toast.show(picked ? `${tag.nickname}: “${picked.text}”` : `${tag.nickname} · ${what}`)
      }),
    [],
  )
}
