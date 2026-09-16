// src/components/shop/ContactForm.tsx
'use client'
import { useState } from 'react'
import { WhatsAppGlyph } from '@/components/layout/SocialIcons'

export default function ContactForm({ waDigits }: { waDigits: string }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const lines = [
      `Hi, I'm ${name || 'a customer'}.`,
      email && `Email: ${email}`,
      '',
      message || "I'd like to ask about something.",
    ].filter(Boolean)
    const text = lines.join('\n')
    const url = waDigits
      ? `https://wa.me/${waDigits}?text=${encodeURIComponent(text)}`
      : `https://wa.me/?text=${encodeURIComponent(text)}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs tracking-[2px] text-[#888] mb-1.5">NAME</label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Your name"
          className="w-full bg-[#111] border border-[#2a2a2a] text-white px-4 py-3 text-sm focus:border-white focus:outline-none transition-colors placeholder-[#555]"
        />
      </div>
      <div>
        <label className="block text-xs tracking-[2px] text-[#888] mb-1.5">EMAIL</label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="your@email.com"
          className="w-full bg-[#111] border border-[#2a2a2a] text-white px-4 py-3 text-sm focus:border-white focus:outline-none transition-colors placeholder-[#555]"
        />
      </div>
      <div>
        <label className="block text-xs tracking-[2px] text-[#888] mb-1.5">MESSAGE</label>
        <textarea
          rows={5}
          required
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder="Your message..."
          className="w-full bg-[#111] border border-[#2a2a2a] text-white px-4 py-3 text-sm focus:border-white focus:outline-none transition-colors placeholder-[#555] resize-none"
        />
      </div>
      <button
        type="submit"
        className="w-full flex items-center justify-center gap-3 bg-[#25D366] hover:opacity-90 text-white py-4 font-bebas text-xl tracking-[4px] transition-opacity"
      >
        <WhatsAppGlyph className="w-6 h-6" />
        SEND VIA WHATSAPP
      </button>
      <p className="text-[#555] text-xs text-center tracking-[1px]">Opens WhatsApp with your message pre-filled — nothing sends until you hit send there.</p>
    </form>
  )
}
