import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useEffect, useId, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import s from './Sheet.module.css'

export interface SheetProps {
  open: boolean
  onClose: () => void
  title?: string
  subtitle?: string
  children?: ReactNode
  footer?: ReactNode
}

/** Bottom sheet: drag or swipe down to dismiss, Esc to close, focus moves inside while open. */
export function Sheet({ open, onClose, title, subtitle, children, footer }: SheetProps) {
  const titleId = useId()
  const panelRef = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    if (!open) return
    const previous = document.activeElement as HTMLElement | null
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const focusTimer = setTimeout(() => panelRef.current?.focus(), 30)
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => {
      clearTimeout(focusTimer)
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
      previous?.focus?.()
    }
  }, [open, onClose])

  if (typeof document === 'undefined') return null
  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="overlay"
            className={s.overlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          <motion.div
            key="panel"
            ref={panelRef}
            className={s.panel}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? titleId : undefined}
            tabIndex={-1}
            initial={reduced ? { opacity: 0 } : { y: '100%' }}
            animate={reduced ? { opacity: 1 } : { y: 0 }}
            exit={reduced ? { opacity: 0 } : { y: '100%' }}
            transition={{ type: 'spring', stiffness: 420, damping: 34 }}
            drag={reduced ? false : 'y'}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 120 || info.velocity.y > 600) onClose()
            }}
          >
            <div className={s.grabber} aria-hidden="true" />
            {(title || subtitle) && (
              <div className={s.header}>
                {title && (
                  <h2 id={titleId} className={s.title}>
                    {title}
                  </h2>
                )}
                {subtitle && <p className={s.subtitle}>{subtitle}</p>}
              </div>
            )}
            {children && <div className={`${s.content} scroll`}>{children}</div>}
            {footer && <div className={s.footer}>{footer}</div>}
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  )
}
