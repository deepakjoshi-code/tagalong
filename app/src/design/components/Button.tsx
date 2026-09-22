import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { Link, type LinkProps } from 'react-router'
import s from './Button.module.css'

import { buttonClass, type ButtonStyleProps } from './buttonClass'

interface CommonProps extends ButtonStyleProps {
  leading?: ReactNode
  trailing?: ReactNode
}

export type ButtonProps = CommonProps & ButtonHTMLAttributes<HTMLButtonElement>

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant, size, block, loading, leading, trailing, className, children, disabled, type = 'button', ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={[buttonClass({ variant, size, block, loading }), className].filter(Boolean).join(' ')}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading && <span className={s.spinner} aria-hidden="true" />}
      {leading && (
        <span className={`${s.icon} ${s.label}`} aria-hidden="true">
          {leading}
        </span>
      )}
      <span className={s.label}>{children}</span>
      {trailing && (
        <span className={`${s.icon} ${s.label}`} aria-hidden="true">
          {trailing}
        </span>
      )}
    </button>
  )
})

export type LinkButtonProps = CommonProps & LinkProps

export function LinkButton({ variant, size, block, leading, trailing, className, children, ...rest }: LinkButtonProps) {
  return (
    <Link className={[buttonClass({ variant, size, block }), className].filter(Boolean).join(' ')} {...rest}>
      {leading && (
        <span className={s.icon} aria-hidden="true">
          {leading}
        </span>
      )}
      <span>{children}</span>
      {trailing && (
        <span className={s.icon} aria-hidden="true">
          {trailing}
        </span>
      )}
    </Link>
  )
}
