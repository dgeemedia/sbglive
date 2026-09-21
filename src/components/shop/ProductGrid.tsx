// src/components/shop/ProductGrid.tsx
'use client'
import { useState } from 'react'
import type { Product } from '@/types'
import ProductCard from './ProductCard'

// Categories the store can have (matches the Category list in the product schema). Filter buttons
// are built from the ones that actually have products — before, "footwear" and "headwear" products
// (allowed in Studio) couldn't be filtered at all, and empty categories still got a button.
const CATEGORY_ORDER = ['tops', 'bottoms', 'accessories', 'footwear', 'headwear']

export default function ProductGrid({ products }: { products: Product[] }) {
  const [filter, setFilter] = useState('all')

  const present = new Set(products.map(p => p.category).filter(Boolean))
  const categories = [
    ...CATEGORY_ORDER.filter(c => present.has(c)),
    ...[...present].filter(c => !CATEGORY_ORDER.includes(c)), // any category added in Studio later
  ]
  const filters = [
    { label: 'ALL', value: 'all' },
    ...categories.map(c => ({ label: c.toUpperCase(), value: c })),
    ...(products.some(p => p.isNew) ? [{ label: 'NEW', value: 'new' }] : []),
    ...(products.some(p => p.isSoldOut) ? [{ label: 'SOLD OUT', value: 'sold' }] : []),
  ]
  // If the active filter disappeared (e.g. moved to another category page), fall back to ALL
  const active = filters.some(f => f.value === filter) ? filter : 'all'

  const filtered = products.filter(p => {
    if (active === 'all') return true
    if (active === 'new') return p.isNew
    if (active === 'sold') return p.isSoldOut
    return p.category === active
  })

  return (
    <>
      {/* Filter bar */}
      <div className="flex items-center gap-2 px-4 py-4 border-b border-[#2a2a2a] bg-[#111] flex-wrap">
        <span className="text-[#888] text-xs tracking-[2px] mr-2">FILTER</span>
        {filters.map(f => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-3 py-1.5 text-xs tracking-[2px] border transition-colors ${active === f.value ? 'border-[#ff2d2d] text-white bg-red-900/20' : 'border-[#2a2a2a] text-[#888] hover:border-white hover:text-white'}`}
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
