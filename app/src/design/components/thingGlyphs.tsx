import type { ThingType } from '@/domain/types'

/**
 * Chunky, friendly line glyphs in a 64×64 box. Stroke-based so they tint with `currentColor`.
 * `fill` regions use a translucent white highlight to add warmth.
 */
const H = 'rgba(255,255,255,0.28)'

export const THING_GLYPHS: Record<ThingType, React.ReactNode> = {
  bottle: (
    <>
      <rect x={20} y={20} width={24} height={38} rx={8} fill={H} />
      <path d="M26 20 V12 a3 3 0 0 1 3 -3 h6 a3 3 0 0 1 3 3 V20" />
      <path d="M22 9 h20" />
      <path d="M20 36 h24" strokeOpacity={0.6} />
    </>
  ),
  lunchbox: (
    <>
      <rect x={9} y={22} width={46} height={32} rx={8} fill={H} />
      <path d="M22 22 V17 a4 4 0 0 1 4 -4 h12 a4 4 0 0 1 4 4 V22" />
      <path d="M9 32 h46" strokeOpacity={0.6} />
      <rect x={28} y={29} width={8} height={6} rx={2} fill="#fff" stroke="none" opacity={0.9} />
    </>
  ),
  backpack: (
    <>
      <rect x={15} y={18} width={34} height={40} rx={12} fill={H} />
      <path d="M24 18 V14 a8 8 0 0 1 16 0 V18" />
      <rect x={22} y={38} width={20} height={14} rx={6} />
      <path d="M15 34 h34" strokeOpacity={0.5} />
    </>
  ),
  toothbrush: (
    <>
      <rect x={27} y={24} width={10} height={34} rx={5} fill={H} />
      <rect x={24} y={6} width={16} height={18} rx={6} fill={H} />
      <path d="M28 10 v6 M32 10 v6 M36 10 v6" strokeOpacity={0.8} />
    </>
  ),
  shoes: (
    <>
      <path d="M10 44 h44 a4 4 0 0 1 0 8 h-44 a4 4 0 0 1 0 -8 z" fill={H} />
      <path d="M12 44 V30 a6 6 0 0 1 6 -6 h10 c6 0 8 6 14 8 l10 3 c3 1 4 4 4 9" fill={H} />
      <path d="M22 30 l4 6 M28 27 l4 6" strokeOpacity={0.7} />
    </>
  ),
  plush: (
    <>
      <circle cx={19} cy={17} r={6} fill={H} />
      <circle cx={45} cy={17} r={6} fill={H} />
      <circle cx={32} cy={26} r={13} fill={H} />
      <rect x={17} y={36} width={30} height={22} rx={12} fill={H} />
      <path d="M12 44 h-3 M52 44 h3" />
    </>
  ),
  helmet: (
    <>
      <path d="M11 38 a21 21 0 0 1 42 0 z" fill={H} />
      <path d="M8 38 h48 a3 3 0 0 1 0 6 h-48 a3 3 0 0 1 0 -6 z" />
      <path d="M24 44 v8 a3 3 0 0 0 3 3 h10 a3 3 0 0 0 3 -3 v-8" strokeOpacity={0.8} />
      <path d="M32 17 v21" strokeOpacity={0.5} />
    </>
  ),
  jacket: (
    <>
      <path d="M22 12 l-10 6 -4 16 8 3 v20 h32 v-20 l8 -3 -4 -16 -10 -6 c-2 5 -8 7 -10 7 s-8 -2 -10 -7 z" fill={H} />
      <path d="M32 19 v38" strokeOpacity={0.7} />
      <path d="M16 37 l-8 0 M48 37 l8 0" strokeOpacity={0.5} />
    </>
  ),
  other: (
    <>
      <path d="M12 30 V14 a4 4 0 0 1 4 -4 h16 l22 22 -18 18 z" fill={H} />
      <circle cx={22} cy={20} r={3.5} fill="#fff" stroke="none" opacity={0.95} />
    </>
  ),
}
