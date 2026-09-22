import { AnimatePresence, motion } from 'motion/react'
import s from './Toast.module.css'
import { useToasts } from './toastStore'

export function Toaster() {
  const items = useToasts((st) => st.items)
  const dismiss = useToasts((st) => st.dismiss)
  return (
    <div className={s.host} role="status" aria-live="polite">
      <AnimatePresence>
        {items.map((t) => (
          <motion.div
            key={t.id}
            className={[s.toast, t.kind !== 'neutral' && s[t.kind]].filter(Boolean).join(' ')}
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 500, damping: 36 }}
            onClick={() => dismiss(t.id)}
          >
            {t.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
