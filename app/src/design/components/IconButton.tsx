import { forwardRef, type ButtonHTMLAttributes } from 'react'
import s from './IconButton.module.css'

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Required: icon-only controls must have a name. */
  label: string
  variant?: 'filled' | 'accent' | 'plain'
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { label, variant = 'filled', className, children, type = 'button', ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      aria-label={label}
      title={label}
      className={[s.btn, s[variant], className].filter(Boolean).join(' ')}
      {...rest}
    >
      {children}
    </button>
  )
})
