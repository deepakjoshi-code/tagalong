import { create } from 'zustand'

export type ToastKind = 'neutral' | 'success' | 'danger'
export interface ToastItem {
  id: number
  message: string
  kind: ToastKind
}
interface ToastState {
  items: ToastItem[]
  show: (message: string, kind?: ToastKind, ms?: number) => void
  dismiss: (id: number) => void
}

let seq = 0
export const useToasts = create<ToastState>((set, get) => ({
  items: [],
  show: (message, kind = 'neutral', ms = 2600) => {
    const id = ++seq
    set((st) => ({ items: [...st.items.slice(-2), { id, message, kind }] }))
    setTimeout(() => get().dismiss(id), ms)
  },
  dismiss: (id) => set((st) => ({ items: st.items.filter((t) => t.id !== id) })),
}))

export const toast = {
  show: (m: string) => useToasts.getState().show(m),
  success: (m: string) => useToasts.getState().show(m, 'success'),
  error: (m: string) => useToasts.getState().show(m, 'danger', 3600),
}
