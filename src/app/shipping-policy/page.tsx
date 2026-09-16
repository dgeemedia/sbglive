// src/app/shipping-policy/page.tsx
export default function ShippingPolicyPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <h1 className="font-bebas text-4xl tracking-[6px] mb-2">SHIPPING POLICY</h1>
      <p className="text-[#888] text-sm tracking-[2px] mb-10">HOW WE GET YOUR ORDER TO YOU</p>

      <div className="space-y-8 text-[#ccc] text-sm leading-relaxed">
        <section>
          <h2 className="font-bebas text-lg tracking-[3px] text-white mb-2">LAGOS DELIVERY</h2>
          <p>Orders within Lagos are typically delivered within 1–2 business days of payment confirmation.</p>
        </section>
        <section>
          <h2 className="font-bebas text-lg tracking-[3px] text-white mb-2">NATIONWIDE DELIVERY</h2>
          <p>Orders outside Lagos are shipped via courier and typically arrive within 3–5 business days, depending on location.</p>
        </section>
        <section>
          <h2 className="font-bebas text-lg tracking-[3px] text-white mb-2">SHIPPING COSTS</h2>
          <p>Shipping cost is calculated at checkout based on your delivery address.</p>
        </section>
        <section>
          <h2 className="font-bebas text-lg tracking-[3px] text-white mb-2">ORDER TRACKING</h2>
          <p>Once your order ships, you can check its status anytime on our <a href="/track-order" className="text-[#c8a96e] hover:underline">Track Order</a> page using your order reference and email.</p>
        </section>
        <section>
          <h2 className="font-bebas text-lg tracking-[3px] text-white mb-2">QUESTIONS</h2>
          <p>Reach out via our <a href="/contact" className="text-[#c8a96e] hover:underline">Contact page</a> and we'll get back to you.</p>
        </section>
      </div>

      <p className="text-[#555] text-xs tracking-[1px] mt-12 border-t border-[#2a2a2a] pt-6">
        Delivery windows are estimates, not guarantees, and may vary during high-demand periods or public holidays.
      </p>
    </div>
  )
}
