// src/components/shop/ComingSoonGrid.tsx
'use client'
import Image from 'next/image'
import type { Product } from '@/types'
import { urlFor } from '../../../sanity/lib/image'
import { useSpin360 } from '@/hooks/useSpin360'
import { buildNotifyUrl } from '@/lib/notify'

function ComingSoonCard({ product: p, onNotify }: { product: Product; onNotify: (p: Product) => void }) {
  // Every item in this grid is a coming-soon item, so the spin is always on
  const { spinning, startSpin, stopSpin, onIteration } = useSpin360(true)
  const img = p.images?.[0] ? urlFor(p.images[0]).width(400).url() : null

  return (
    <div className="border border-[#2a2a2a] p-3 text-center" onPointerEnter={startSpin} onPointerLeave={stopSpin}>
      <div className="aspect-square bg-[#1a1a1a] relative mb-3 overflow-hidden" style={{ perspective: 1000 }}>
        <div
          className={`absolute inset-0 ${spinning ? 'spin-360' : ''}`}
          onAnimationIteration={onIteration}
        >
          {img && <Image src={img} alt={p.name} fill className="object-cover opacity-60" />}
        </div>
      </div>
      <p className="font-bebas text-sm tracking-[2px] mb-2">{p.name}</p>
      <button
        onClick={() => onNotify(p)}
        className="w-full border border-[#2a2a2a] hover:border-[#25D366] hover:text-[#25D366] text-[#888] py-1.5 text-xs tracking-[2px] transition-colors font-bebas flex items-center justify-center gap-1.5"
      >
        NOTIFY ME
      </button>
    </div>
  )
}

export default function ComingSoonGrid({ products, waDigits }: { products: Product[]; waDigits: string }) {
  const handleNotify = (product: Product) => {
    window.open(buildNotifyUrl(product, waDigits), '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {products.map(p => (
        <ComingSoonCard key={p._id} product={p} onNotify={handleNotify} />
      ))}
    </div>
  )
}
