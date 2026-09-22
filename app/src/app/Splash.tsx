import s from './Splash.module.css'

export function Splash() {
  return (
    <div className={s.splash} role="status" aria-label="Loading Tagalong">
      <img className={s.mark} src="/icons/icon.svg" alt="" width={88} height={88} />
    </div>
  )
}
