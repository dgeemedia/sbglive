// src/app/returns/page.tsx
import type { Metadata } from 'next'
import { pageMeta } from '@/lib/seo'

export const metadata: Metadata = pageMeta({
  title: 'Returns & Exchanges',
  description: "SBGFASHION returns and exchanges — what to do if something isn't right with your order.",
  path: '/returns',
})

export default function ReturnsPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <h1 className="font-bebas text-4xl tracking-[6px] mb-2">RETURNS &amp; EXCHANGES</h1>
      <p className="text-[#888] text-sm tracking-[2px] mb-10">WHAT TO DO IF SOMETHING'S NOT RIGHT</p>

      <div className="space-y-8 text-[#ccc] text-sm leading-relaxed">
        <section>
          <h2 className="font-bebas text-lg tracking-[3px] text-white mb-2">RETURN WINDOW</h2>
          <p>If an item arrives damaged, faulty, or not as described, contact us within 48 hours of delivery so we can sort it out.</p>
        </section>
        <section>
          <h2 className="font-bebas text-lg tracking-[3px] text-white mb-2">SIZE EXCHANGES</h2>
          <p>Need a different size? Reach out within 3 days of delivery — exchanges are subject to stock availability for the size requested.</p>
        </section>
        <section>
          <h2 className="font-bebas text-lg tracking-[3px] text-white mb-2">CONDITION FOR RETURN</h2>
          <p>Items must be unworn, unwashed, and returned with original tags and packaging intact.</p>
        </section>
        <section>
          <h2 className="font-bebas text-lg tracking-[3px] text-white mb-2">NON-RETURNABLE ITEMS</h2>
          <p>Made-to-order and pre-order pieces are final sale unless the item arrives defective.</p>
        </section>
        <section>
          <h2 className="font-bebas text-lg tracking-[3px] text-white mb-2">HOW TO START A RETURN</h2>
          <p>Message us on <a href="/contact" className="text-[#c8a96e] hover:underline">WhatsApp or the Contact page</a> with your order reference and a photo of the item — we'll guide you from there.</p>
        </section>
      </div>

      <p className="text-[#555] text-xs tracking-[1px] mt-12 border-t border-[#2a2a2a] pt-6">
        This policy is a general guideline — the team may make exceptions on a case-by-case basis.
      </p>
    </div>
  )
}
