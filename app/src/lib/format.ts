export const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`
export const capitalize = (s: string) => (s ? s[0]!.toUpperCase() + s.slice(1) : s)
export const initialOf = (name?: string) => (name?.trim()?.[0] ?? '?').toUpperCase()
