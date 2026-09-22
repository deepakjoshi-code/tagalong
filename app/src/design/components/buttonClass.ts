import s from './Button.module.css'

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'ghost' | 'destructive'
export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonStyleProps {
  variant?: ButtonVariant
  size?: ButtonSize
  block?: boolean
  loading?: boolean
}

export const buttonClass = ({ variant = 'primary', size = 'md', block, loading }: ButtonStyleProps) =>
  [s.btn, s[variant], size !== 'md' && s[size], block && s.block, loading && s.loading]
    .filter(Boolean)
    .join(' ')
