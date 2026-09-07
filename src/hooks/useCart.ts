// src/hooks/useCart.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem } from '@/types'

interface CartStore {
  items: CartItem[]
  isOpen: boolean
  addItem: (item: CartItem) => void
  removeItem: (id: string, size: string, color: string) => void
  updateQty: (id: string, size: string, color: string, qty: number) => void
  clearCart: () => void
  openCart: () => void
  closeCart: () => void
  total: () => number
  count: () => number
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      addItem: (item) => {
        const exists = get().items.find(
          i => i._id === item._id && i.size === item.size && i.color === item.color
        )
        if (exists) {
          set(s => ({
            items: s.items.map(i =>
              i._id === item._id && i.size === item.size && i.color === item.color
                ? { ...i, quantity: i.quantity + 1 }
                : i
            )
          }))
        } else {
          set(s => ({ items: [...s.items, { ...item, quantity: 1 }] }))
        }
      },
      removeItem: (id, size, color) =>
        set(s => ({ items: s.items.filter(i => !(i._id === id && i.size === size && i.color === color)) })),
      updateQty: (id, size, color, qty) =>
        set(s => ({
          items: qty <= 0
            ? s.items.filter(i => !(i._id === id && i.size === size && i.color === color))
            : s.items.map(i => i._id === id && i.size === size && i.color === color ? { ...i, quantity: qty } : i)
        })),
      clearCart: () => set({ items: [] }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      total: () => get().items.reduce((s, i) => s + i.price * i.quantity, 0),
      count: () => get().items.reduce((s, i) => s + i.quantity, 0),
    }),
    { name: 'sbgfashion-cart' }
  )
)
