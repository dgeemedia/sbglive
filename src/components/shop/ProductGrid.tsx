// src/components/shop/ProductGrid.tsx
'use client'
import { useState } from 'react'
import type { Product } from '@/types'
import ProductCard from './ProductCard'

const FILTERS = [
  { label: 'ALL', value: 'all' },
  { label: 'TOPS', value: 'tops' },
  { label: 'BOTTOMS', value: 'bottoms' },
  { label: 'ACCESSORIES', value: 'accessories' },
  { label: 'NEW', value: 'new' },
  { label: 'SOLD OUT', value: 'sold' },
]

export default function ProductGrid({ products }: { products: Product[] }) {
  const [filter, setFilter] = useState('all')

  const filtered = products.filter(p => {
    if (filter === 'all') return true
    if (filter === 'new') return p.isNew
    if (filter === 'sold') return p.isSoldOut
    return p.category === filter
  })

  return (
    <>
      {/* Filter bar */}
      <div className="flex items-center gap-2 px-4 py-4 border-b border-[#2a2a2a] bg-[#111] flex-wrap">
        <span className="text-[#888] text-xs tracking-[2px] mr-2">FILTER</span>
        {FILTERS.map(f => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-3 py-1.5 text-xs tracking-[2px] border transition-colors ${filter === f.value ? 'border-[#ff2d2d] text-white bg-red-900/20' : 'border-[#2a2a2a] text-[#888] hover:border-white hover:text-white'}`}
          >
            {f.label}
          </button>
        ))}
        <span className="ml-auto text-xs tracking-[2px] text-[#555]">{filtered.length} PRODUCTS</span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-px bg-[#2a2a2a]">
        {filtered.map(p => (
          <ProductCard key={p._id} product={p} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="py-24 text-center text-[#555] font-bebas text-xl tracking-[4px]">
          NO PRODUCTS FOUND
        </div>
      )}
    </>
  )
}
