// src/app/faq/page.tsx
'use client'
import { useState } from 'react'

const FAQS = [
  { q: 'How long does delivery take?', a: 'Lagos orders typically arrive within 1–2 business days. Orders to other states usually take 3–5 business days.' },
  { q: 'How do I pay?', a: 'Checkout is powered by Flutterwave — pay by card, bank transfer, or USSD, all in Nigerian Naira.' },
  { q: 'Can I return or exchange an item?', a: "Yes, within the windows described on our Returns page. Reach out within 48 hours if something arrives damaged or wrong." },
  { q: 'How do I know my size?', a: 'Check our Size Guide for detailed chest, length, and waist measurements for every size we carry.' },
  { q: 'How do I track my order?', a: 'Use the Track Order page with your order reference (from your confirmation email) and the email you checked out with.' },
  { q: "What if an item I want is sold out?", a: "Sold out items may restock — follow us on Instagram or WhatsApp us to ask. Coming Soon items have a Notify Me button that messages us directly." },
  { q: 'Do you ship outside Nigeria?', a: "Not yet — we currently ship within Nigeria only." },
]

export default function FAQPage() {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <h1 className="font-bebas text-4xl tracking-[6px] mb-2">FAQ</h1>
      <p className="text-[#888] text-sm tracking-[2px] mb-10">FREQUENTLY ASKED QUESTIONS</p>

      <div className="border-t border-[#2a2a2a]">
        {FAQS.map((item, i) => {
          const isOpen = open === i
          return (
            <div key={i} className="border-b border-[#2a2a2a]">
              <button
                onClick={() => setOpen(isOpen ? null : i)}
                className="w-full flex items-center justify-between py-4 text-left"
              >
                <span className="font-bebas text-base tracking-[1px] text-white pr-4">{item.q}</span>
                <span className="text-[#888] text-xl flex-shrink-0">{isOpen ? '−' : '+'}</span>
              </button>
              {isOpen && (
                <p className="text-[#888] text-sm leading-relaxed pb-4 pr-6">{item.a}</p>
              )}
            </div>
          )
        })}
      </div>

      <p className="text-[#555] text-xs tracking-[1px] mt-10">
        Didn't find your answer? <a href="/contact" className="text-[#c8a96e] hover:underline">Contact us</a> and we'll help.
      </p>
    </div>
  )
}
