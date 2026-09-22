import { Plus } from 'lucide-react'
import { useNavigate } from 'react-router'
import { Avatar, EmptyState, IconButton, LinkButton, ListGroup, ListRow, Screen } from '@/design/components'
import { AGE_BAND_META } from '@/domain/ageBands'
import { useStore } from '@/domain/store'
import { plural } from '@/lib/format'

export function KidsList() {
  const navigate = useNavigate()
  const kids = useStore((s) => s.kids)
  const tags = useStore((s) => s.tags)

  return (
    <Screen
      title="Kids"
      trailing={
        <IconButton label="Add a kid" variant="accent" onClick={() => navigate('/kids/new')}>
          <Plus size={24} strokeWidth={2.4} />
        </IconButton>
      }
    >
      {kids.length === 0 ? (
        <EmptyState
          art={<Avatar name="?" seed="empty" size={96} />}
          title="No kids yet"
          message="Add a kid so tags can match their age. A name is optional and never leaves this phone."
          actions={
            <LinkButton to="/kids/new" size="lg" block leading={<Plus size={20} />}>
              Add a kid
            </LinkButton>
          }
        />
      ) : (
        <ListGroup footer="Names and recordings are stored only on this phone. Delete them anytime.">
          {kids.map((k) => {
            const count = tags.filter((t) => t.kidId === k.id).length
            return (
              <ListRow
                key={k.id}
                to={`/kids/${k.id}`}
                title={k.displayName || `${AGE_BAND_META[k.ageBand].label} kid`}
                subtitle={`${AGE_BAND_META[k.ageBand].label} · ${AGE_BAND_META[k.ageBand].range} · ${plural(count, 'tag')}`}
                icon={<Avatar name={k.displayName} seed={k.id} size={32} />}
                iconTint="transparent"
              />
            )
          })}
        </ListGroup>
      )}
    </Screen>
  )
}
