// src/app/track-order/page.tsx
'use client'
import { useState } from 'react'

type Order = {
  reference: string
  status: 'pending' | 'paid' | 'fulfilled' | 'cancelled'
  total: number
  createdAt?: string
  firstName?: string
  lastName?: string
  address?: string
  city?: string
  state?: string
  items: { productName: string; size?: string; color?: string; quantity: number; price: number }[]
}

const STATUS_COPY: Record<Order['status'], { label: string; color: string; blurb: string }> = {
  pending: { label: 'PENDING PAYMENT', color: '#888', blurb: "We haven't received payment for this order yet." },
  paid: { label: 'PAID — BEING PACKED', color: '#c8a96e', blurb: "Payment confirmed. We're getting your order ready to ship." },
  fulfilled: { label: 'SHIPPED', color: '#4ade80', blurb: 'Your order is on its way.' },
  cancelled: { label: 'CANCELLED', color: '#ff2d2d', blurb: 'This order was cancelled.' },
}

const UNKNOWN_STATUS = { label: 'STATUS UNKNOWN', color: '#888', blurb: 'Please contact us about this order.' }

export default function TrackOrderPage() {
  const [reference, setReference] = useState('')
  const [email, setEmail] = useState('')
  const [order, setOrder] = useState<Order | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setOrder(null)
    try {
      const res = await fetch('/api/orders/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference, email }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Order not found')
      } else {
        setOrder(data.order)
      }
    } catch {
      setError('Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-16">
      <h1 className="font-bebas text-4xl tracking-[6px] mb-2">TRACK ORDER</h1>
      <p className="text-[#888] text-sm tracking-[2px] mb-10">CHECK YOUR ORDER STATUS</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs tracking-[2px] text-[#888] mb-1.5">ORDER REFERENCE</label>
          <input
            type="text"
            required
            value={reference}
            onChange={e => setReference(e.target.value)}
            placeholder="sbg_..."
            className="w-full bg-[#111] border border-[#2a2a2a] text-white px-4 py-3 text-sm focus:border-white focus:outline-none transition-colors placeholder-[#555]"
          />
          <p className="text-[#555] text-xs mt-1.5">Found in your order confirmation email</p>
        </div>
        <div>
          <label className="block text-xs tracking-[2px] text-[#888] mb-1.5">EMAIL USED AT CHECKOUT</label>
          <input
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="w-full bg-[#111] border border-[#2a2a2a] text-white px-4 py-3 text-sm focus:border-white focus:outline-none transition-colors placeholder-[#555]"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#ff2d2d] hover:bg-red-700 disabled:opacity-50 text-white py-4 font-bebas text-xl tracking-[4px] transition-colors"
        >
          {loading ? 'SEARCHING...' : 'TRACK ORDER'}
        </button>
      </form>

      {error && (
        <p className="mt-6 text-[#ff2d2d] text-sm text-center border border-[#ff2d2d]/30 bg-[#ff2d2d]/5 py-3 px-4">{error}</p>
      )}

      {order && (() => { const status = STATUS_COPY[order.status] ?? UNKNOWN_STATUS; return (
        <div className="mt-10 border border-[#2a2a2a] p-6">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs tracking-[2px] text-[#555]">REF: <span className="text-[#c8a96e]">{order.reference}</span></p>
            <span className="text-xs font-bebas tracking-[2px]" style={{ color: status.color }}>
              {status.label}
            </span>
          </div>
          <p className="text-[#888] text-sm mb-6">{status.blurb}</p>

          <div className="space-y-3 border-t border-[#2a2a2a] pt-4">
            {order.items?.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <div>
                  <p className="text-white">{item.productName}</p>
                  <p className="text-[#555] text-xs">{[item.size, item.color].filter(Boolean).join(' / ')} × {item.quantity}</p>
                </div>
                <p className="text-[#c8a96e] font-bebas">₦{(item.price * item.quantity).toLocaleString()}</p>
              </div>
            ))}
          </div>

          <div className="flex justify-between border-t border-[#2a2a2a] mt-4 pt-4">
            <span className="font-bebas text-lg tracking-[2px] text-white">TOTAL</span>
            <span className="font-bebas text-lg text-[#c8a96e]">₦{order.total?.toLocaleString()}</span>
          </div>

          {(order.address || order.city) && (
            <p className="text-[#555] text-xs tracking-[1px] mt-4 border-t border-[#2a2a2a] pt-4">
              SHIPPING TO — {[order.address, order.city, order.state].filter(Boolean).join(', ')}
            </p>
          )}
        </div>
      ) })()}
    </div>
  )
}
