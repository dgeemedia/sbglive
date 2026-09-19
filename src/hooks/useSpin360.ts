// src/hooks/useSpin360.ts
'use client'
import { useCallback, useRef, useState } from 'react'
import type { AnimationEvent } from 'react'

/**
 * Continuous 360° spin for "Coming Soon" products.
 *
 * The image keeps turning for as long as the mouse (desktop) or finger (mobile) is on
 * the card. When it leaves, the image finishes its current turn and stops exactly at
 * the start position, so it never snaps back.
 *
 * Usage:
 *   - `onPointerEnter={startSpin}` and `onPointerLeave={stopSpin}` on the card / hover area.
 *     Pointer events cover mouse hover AND touch with one set of handlers.
 *   - `className={spinning ? 'spin-360' : ''}` and `onAnimationIteration={onIteration}`
 *     on the element that rotates (the keyframes live in globals.css).
 *   - Pass `enabled = false` for normal products and nothing ever happens.
 */
export function useSpin360(enabled: boolean) {
  const [spinning, setSpinning] = useState(false)
  const hovering = useRef(false)

  const startSpin = useCallback(() => {
    if (!enabled) return
    hovering.current = true
    setSpinning(true)
  }, [enabled])

  // Only records that the pointer left — the spin winds down at the end of the current turn
  const stopSpin = useCallback(() => {
    hovering.current = false
  }, [])

  // Fires at the end of every full turn (angle is back at 0°/360°, so removing the class is invisible)
  const onIteration = useCallback((e: AnimationEvent<HTMLElement>) => {
    if (e.target !== e.currentTarget) return // ignore events bubbling up from children
    if (!hovering.current) setSpinning(false)
  }, [])

  return { spinning, startSpin, stopSpin, onIteration }
}
