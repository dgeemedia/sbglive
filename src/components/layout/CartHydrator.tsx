// src/components/layout/CartHydrator.tsx
'use client'
import { useEffect } from 'react'
import { useCart } from '@/hooks/useCart'

// Loads the saved cart from the browser once the page is on screen (see useCart.ts).
export default function CartHydrator() {
  useEffect(() => {
    useCart.persist.rehydrate()
  }, [])
  return null
}
