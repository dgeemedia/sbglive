// src/hooks/useCart.ts
import { useEffect, useState } from 'react'
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
  syncPrices: (prices: Record<string, number>) => void
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
        const qty = item.quantity && item.quantity > 0 ? item.quantity : 1
        const exists = get().items.find(
          i => i._id === item._id && i.size === item.size && i.color === item.color
        )
        if (exists) {
          set(s => ({
            items: s.items.map(i =>
              i._id === item._id && i.size === item.size && i.color === item.color
                ? { ...i, quantity: i.quantity + qty }
                : i
            )
          }))
        } else {
          set(s => ({ items: [...s.items, { ...item, quantity: qty }] }))
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
      // Refresh saved prices from the server's latest (used when checkout finds they changed)
      syncPrices: (prices) =>
        set(s => ({ items: s.items.map(i => (typeof prices[i._id] === 'number' ? { ...i, price: prices[i._id] } : i)) })),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      total: () => get().items.reduce((s, i) => s + i.price * i.quantity, 0),
      count: () => get().items.reduce((s, i) => s + i.quantity, 0),
    }),
    {
      name: 'sbgfashion-cart',
      // The saved cart is loaded in the browser AFTER the first render (see CartHydrator).
      // Otherwise the server renders "0 items / ₦0" while the browser's first render already has
      // the saved items, React sees two different pages, and it logs a hydration error.
      skipHydration: true,
    }
  )
)

/** True once the saved cart has been loaded from the browser. Use it to avoid flashing "empty cart". */
export function useCartReady(): boolean {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    const unsubscribe = useCart.persist.onFinishHydration(() => setReady(true))
    if (useCart.persist.hasHydrated()) setReady(true)
    return unsubscribe
  }, [])
  return ready
}
