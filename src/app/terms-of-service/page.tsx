// src/app/terms-of-service/page.tsx
import type { Metadata } from 'next'
import { pageMeta } from '@/lib/seo'

export const metadata: Metadata = pageMeta({
  title: 'Terms of Service',
  description: 'The terms that apply when you shop at SBGFASHION.',
  path: '/terms-of-service',
})

export default function TermsOfServicePage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <h1 className="font-bebas text-4xl tracking-[6px] mb-2">TERMS OF SERVICE</h1>
      <p className="text-[#888] text-sm tracking-[2px] mb-10">LAST UPDATED SEPTEMBER 2026</p>

      <div className="space-y-8 text-[#ccc] text-sm leading-relaxed">
        <section>
          <h2 className="font-bebas text-lg tracking-[3px] text-white mb-2">1. USING THIS SITE</h2>
          <p>By browsing or ordering from SBGFASHION, you agree to these terms. If you don't agree, please don't use the site.</p>
        </section>
        <section>
          <h2 className="font-bebas text-lg tracking-[3px] text-white mb-2">2. ORDERS &amp; PAYMENT</h2>
          <p>All prices are shown in Nigerian Naira (₦). Payments are processed securely through Flutterwave. An order is confirmed only once payment has cleared.</p>
        </section>
        <section>
          <h2 className="font-bebas text-lg tracking-[3px] text-white mb-2">3. PRODUCT AVAILABILITY</h2>
          <p>Stock is limited and updated regularly. In the rare case an item sells out after you order, we'll reach out to offer a refund or an alternative.</p>
        </section>
        <section>
          <h2 className="font-bebas text-lg tracking-[3px] text-white mb-2">4. PRICING</h2>
          <p>We reserve the right to change prices at any time. The price shown at checkout is the price you pay for that order.</p>
        </section>
        <section>
          <h2 className="font-bebas text-lg tracking-[3px] text-white mb-2">5. INTELLECTUAL PROPERTY</h2>
          <p>All designs, photography, and branding on this site belong to SBGFASHION and may not be reproduced without permission.</p>
        </section>
        <section>
          <h2 className="font-bebas text-lg tracking-[3px] text-white mb-2">6. CONTACT</h2>
          <p>Questions about these terms? Reach us via the <a href="/contact" className="text-[#c8a96e] hover:underline">Contact page</a>.</p>
        </section>
      </div>
    </div>
  )
}
