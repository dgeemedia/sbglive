// src/components/shop/ComingSoonGrid.tsx
'use client'
import Image from 'next/image'
import type { Product } from '@/types'
import { urlFor } from '../../../sanity/lib/image'

export default function ComingSoonGrid({ products, waDigits }: { products: Product[]; waDigits: string }) {
  const handleNotify = (product: Product) => {
    const message = `Hi! I'd like to be notified when "${product.name}" (₦${product.price.toLocaleString()}) drops. Please let me know when it's available 🙏`
    const url = waDigits
      ? `https://wa.me/${waDigits}?text=${encodeURIComponent(message)}`
      : `https://wa.me/?text=${encodeURIComponent(message)}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {products.map(p => {
        const img = p.images?.[0] ? urlFor(p.images[0]).width(400).url() : null
        return (
          <div key={p._id} className="border border-[#2a2a2a] p-3 text-center">
            <div className="aspect-square bg-[#1a1a1a] relative mb-3">
              {img && <Image src={img} alt={p.name} fill className="object-cover opacity-60" />}
            </div>
            <p className="font-bebas text-sm tracking-[2px] mb-2">{p.name}</p>
            <button
              onClick={() => handleNotify(p)}
              className="w-full border border-[#2a2a2a] hover:border-[#25D366] hover:text-[#25D366] text-[#888] py-1.5 text-xs tracking-[2px] transition-colors font-bebas flex items-center justify-center gap-1.5"
            >
              NOTIFY ME
            </button>
          </div>
        )
      })}
    </div>
  )
}
