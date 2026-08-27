// src/app/search/page.tsx
'use client'
import { useState, useEffect } from 'react'
import type { Product } from '@/types'
import ProductCard from '@/components/shop/ProductCard'

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Product[]>([])
  const [all, setAll] = useState<Product[]>([])
  useEffect(() => { fetch('/api/products').then(r=>r.json()).then(setAll) }, [])
  useEffect(() => {
    if (!query.trim()) { setResults([]); return }
    const q = query.toLowerCase()
    setResults(all.filter(p => p.name.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q) || p.tags?.some((t:string)=>t.toLowerCase().includes(q))))
  }, [query, all])
  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="font-bebas text-3xl tracking-[6px] mb-6">SEARCH</h1>
      <input autoFocus value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search products..."
        className="w-full bg-[#111] border border-[#2a2a2a] text-white px-4 py-4 text-lg focus:border-white focus:outline-none transition-colors placeholder-[#555] mb-8" />
      {query && <p className="text-[#888] text-xs tracking-[2px] mb-6">{results.length} RESULT{results.length!==1?'S':''} FOR "{query.toUpperCase()}"</p>}
      {results.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-px bg-[#2a2a2a]">
          {results.map(p=><ProductCard key={p._id} product={p}/>)}
        </div>
      )}
      {query && results.length===0 && <div className="py-20 text-center text-[#555] font-bebas text-xl tracking-[4px]">NO PRODUCTS FOUND</div>}
    </div>
  )
}
