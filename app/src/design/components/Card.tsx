import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { Link } from 'react-router'
import s from './Card.module.css'

interface BaseProps {
  flat?: boolean
  tight?: boolean
  className?: string
  children?: ReactNode
  style?: React.CSSProperties
}

type DivCard = BaseProps & HTMLAttributes<HTMLDivElement> & { to?: undefined; onPress?: undefined }
type LinkCard = BaseProps & { to: string; onPress?: undefined; 'aria-label'?: string }
type ButtonCard = BaseProps & { onPress: () => void; to?: undefined; 'aria-label'?: string }

export type CardProps = DivCard | LinkCard | ButtonCard

const cls = (p: BaseProps, pressable: boolean) =>
  [s.card, pressable && s.pressable, p.flat && s.flat, p.tight && s.tight, p.className].filter(Boolean).join(' ')

export const Card = forwardRef<HTMLElement, CardProps>(function Card(props, ref) {
  if ('to' in props && props.to) {
    const { to, flat, tight, className, children, style, ...rest } = props
    return (
      <Link ref={ref as React.Ref<HTMLAnchorElement>} to={to} className={cls({ flat, tight, className }, true)} style={style} {...rest}>
        {children}
      </Link>
    )
  }
  if ('onPress' in props && props.onPress) {
    const { onPress, flat, tight, className, children, style, ...rest } = props
    return (
      <button ref={ref as React.Ref<HTMLButtonElement>} type="button" onClick={onPress} className={cls({ flat, tight, className }, true)} style={style} {...rest}>
        {children}
      </button>
    )
  }
  const { flat, tight, className, children, style, ...rest } = props as DivCard
  return (
    <div ref={ref as React.Ref<HTMLDivElement>} className={cls({ flat, tight, className }, false)} style={style} {...rest}>
      {children}
    </div>
  )
})
