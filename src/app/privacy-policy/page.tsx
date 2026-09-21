// src/app/privacy-policy/page.tsx
import type { Metadata } from 'next'
import { pageMeta } from '@/lib/seo'

export const metadata: Metadata = pageMeta({
  title: 'Privacy Policy',
  description: 'How SBGFASHION collects, uses and protects your personal information.',
  path: '/privacy-policy',
})

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <h1 className="font-bebas text-4xl tracking-[6px] mb-2">PRIVACY POLICY</h1>
      <p className="text-[#888] text-sm tracking-[2px] mb-10">LAST UPDATED SEPTEMBER 2026</p>

      <div className="space-y-8 text-[#ccc] text-sm leading-relaxed">
        <section>
          <h2 className="font-bebas text-lg tracking-[3px] text-white mb-2">WHAT WE COLLECT</h2>
          <p>When you place an order, we collect your name, email, phone number, and delivery address — only what's needed to fulfil and confirm your order.</p>
        </section>
        <section>
          <h2 className="font-bebas text-lg tracking-[3px] text-white mb-2">HOW WE USE IT</h2>
          <p>Your details are used to process payment, ship your order, send order updates, and respond to support requests. We don't sell your data to anyone.</p>
        </section>
        <section>
          <h2 className="font-bebas text-lg tracking-[3px] text-white mb-2">PAYMENT INFORMATION</h2>
          <p>Card and payment details are handled entirely by Flutterwave, our payment processor. We never see or store your card details.</p>
        </section>
        <section>
          <h2 className="font-bebas text-lg tracking-[3px] text-white mb-2">DATA STORAGE</h2>
          <p>Order information is stored securely in our content management system, accessible only to the store team.</p>
        </section>
        <section>
          <h2 className="font-bebas text-lg tracking-[3px] text-white mb-2">YOUR RIGHTS</h2>
          <p>You can ask us to see, correct, or delete your personal data at any time by contacting us.</p>
        </section>
        <section>
          <h2 className="font-bebas text-lg tracking-[3px] text-white mb-2">CONTACT</h2>
          <p>For any privacy questions, reach us via the <a href="/contact" className="text-[#c8a96e] hover:underline">Contact page</a>.</p>
        </section>
      </div>
    </div>
  )
}
