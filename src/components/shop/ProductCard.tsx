// src/components/shop/ProductCard.tsx
'use client'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import type { Product } from '@/types'
import { urlFor } from '../../../sanity/lib/image'
import { useCart } from '@/hooks/useCart'
import toast from 'react-hot-toast'

export default function ProductCard({ product }: { product: Product }) {
  const [hovered, setHovered] = useState(false)
  const { addItem, openCart } = useCart()

  const img1 = product.images?.[0] ? urlFor(product.images[0]).width(600).url() : null
  const img2 = product.images?.[1] ? urlFor(product.images[1]).width(600).url() : null

  const handleQuickShop = (e: React.MouseEvent) => {
    e.preventDefault()
    if (product.isSoldOut) return
    addItem({
      _id: product._id,
      name: product.name,
      price: product.price,
      image: img1 || '',
      size: product.sizes?.[0] || 'ONE SIZE',
      color: product.colors?.[0] || 'DEFAULT',
      quantity: 1,
      slug: product.slug,
    })
    toast.success('Added to cart', {
      style: { background: '#111', color: '#fff', border: '1px solid #2a2a2a', fontFamily: 'Barlow Condensed', letterSpacing: '2px' }
    })
    openCart()
  }

  return (
    <Link href={`/products/${product.slug}`} className="block group bg-[#0a0a0a] hover:bg-[#111] transition-colors">
      <div
        className="relative aspect-square bg-[#1a1a1a] overflow-hidden"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {img1 && (
          <Image
            src={hovered && img2 ? img2 : img1}
            alt={product.name}
            fill
            className="object-cover transition-opacity duration-300"
            sizes="(max-width:768px) 50vw, 25vw"
          />
        )}
        {!img1 && (
          <div className="absolute inset-0 flex items-center justify-center text-[#2a2a2a] font-bebas text-2xl tracking-[3px]">NO IMAGE</div>
        )}

        {/* Badges */}
        {product.isSoldOut && (
          <span className="absolute top-2 left-2 bg-[#888] text-black text-[10px] font-bold tracking-[3px] px-2 py-1">SOLD OUT</span>
        )}
        {product.isNew && !product.isSoldOut && (
          <span className="absolute top-2 left-2 bg-[#ff2d2d] text-white text-[10px] font-bold tracking-[3px] px-2 py-1">NEW</span>
        )}
        {product.isComingSoon && (
          <span className="absolute top-2 left-2 bg-[#c8a96e] text-black text-[10px] font-bold tracking-[3px] px-2 py-1">SOON</span>
        )}

        {/* Quick shop overlay */}
        <div className={`absolute inset-0 bg-black/60 flex items-center justify-center transition-opacity duration-200 ${hovered ? 'opacity-100' : 'opacity-0'}`}>
          <button
            onClick={handleQuickShop}
            className={`px-6 py-2 font-bebas text-base tracking-[3px] transition-colors ${product.isSoldOut ? 'bg-[#888] text-black cursor-not-allowed' : 'bg-white text-black hover:bg-[#ff2d2d] hover:text-white'}`}
          >
            {product.isSoldOut ? 'SOLD OUT' : 'QUICK SHOP'}
          </button>
        </div>
      </div>

      <div className="p-3 border-t border-[#2a2a2a]">
        <h3 className="font-bebas tracking-[1px] text-sm text-[#e8e8e8] leading-tight line-clamp-2">{product.name}</h3>
        <div className="mt-1 text-xs text-[#888] tracking-[1px]">
          {product.isSoldOut
            ? <span className="text-[#ff2d2d]">SOLD OUT</span>
            : <span className="text-white font-bebas text-sm">₦{product.price.toLocaleString()} NGN</span>
          }
        </div>
      </div>
    </Link>
  )
}
