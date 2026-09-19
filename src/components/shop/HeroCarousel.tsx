// src/components/shop/HeroCarousel.tsx
'use client'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import type { Product } from '@/types'
import { urlFor } from '../../../sanity/lib/image'
import { useCart } from '@/hooks/useCart'
import { useSpin360 } from '@/hooks/useSpin360'
import toast from 'react-hot-toast'

function HeroItem({ product: p, onClick }: { product: Product; onClick: (e: React.MouseEvent, p: Product) => void }) {
  const { spinning, startSpin, stopSpin, onIteration } = useSpin360(!!p.isComingSoon)
  const img = p.images?.[0] ? urlFor(p.images[0]).width(500).url() : null

  return (
    <motion.button
      onClick={(e) => onClick(e, p)}
      onPointerEnter={startSpin}
      onPointerLeave={stopSpin}
      whileHover={{ scale: 1.04, y: -4 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="relative flex-shrink-0 w-[150px] md:w-[190px] text-left border border-[#2a2a2a] bg-[#111] hover:border-[#c8a96e] transition-colors overflow-hidden"
    >
      <div className="relative aspect-[3/4] bg-[#1a1a1a] overflow-hidden" style={{ perspective: 1000 }}>
        {img && (
          <div
            className={`absolute inset-0 ${spinning ? 'spin-360' : ''}`}
            onAnimationIteration={onIteration}
          >
            <Image src={img} alt={p.name} fill className="object-cover" sizes="200px" />
          </div>
        )}
        {p.isComingSoon ? (
          <span className="absolute top-2 left-2 bg-[#c8a96e] text-black text-[9px] font-bold tracking-[2px] px-1.5 py-0.5">COMING SOON</span>
        ) : (
          <>
            {p.isSoldOut && (
              <span className="absolute top-2 left-2 bg-[#888] text-black text-[9px] font-bold tracking-[2px] px-1.5 py-0.5">SOLD OUT</span>
            )}
            {p.isNew && !p.isSoldOut && (
              <span className="absolute top-2 left-2 bg-[#ff2d2d] text-white text-[9px] font-bold tracking-[2px] px-1.5 py-0.5">NEW</span>
            )}
          </>
        )}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-2.5">
          <p className="font-bebas text-xs tracking-[1px] text-white leading-tight line-clamp-1">{p.name}</p>
          <p className="font-bebas text-sm text-[#c8a96e]">₦{p.price.toLocaleString()}</p>
        </div>
      </div>
    </motion.button>
  )
}

export default function HeroCarousel({ products }: { products: Product[] }) {
  const router = useRouter()
  const { addItem } = useCart()

  if (!products?.length) return null

  // Duplicate the list so the CSS loop (translateX -50%) is seamless
  const loop = [...products, ...products]

  const handleBuyNow = (e: React.MouseEvent, product: Product) => {
    e.preventDefault()
    // Sold-out and Coming Soon items can't be bought instantly — open the product page instead
    if (product.isSoldOut || product.isComingSoon) {
      router.push(`/products/${product.slug}`)
      return
    }
    const img = product.images?.[0] ? urlFor(product.images[0]).width(600).url() : ''
    addItem({
      _id: product._id,
      name: product.name,
      price: product.price,
      image: img,
      size: product.sizes?.[0] || 'ONE SIZE',
      color: product.colors?.[0] || 'DEFAULT',
      quantity: 1,
      slug: product.slug,
    })
    toast.success(`${product.name} added — heading to checkout`, {
      style: { background: '#111', color: '#fff', border: '1px solid #2a2a2a', fontFamily: 'Barlow Condensed', letterSpacing: '2px' },
    })
    router.push('/checkout')
  }

  return (
    <div className="relative z-10 mt-6 group/hero">
      <div className="flex items-center gap-3 px-4 mb-3">
        <span className="w-1.5 h-1.5 rounded-full bg-[#ff2d2d] animate-pulse" />
        <p className="text-[10px] tracking-[4px] text-[#888] font-bebas">TAP AN ITEM TO BUY INSTANTLY</p>
      </div>

      <div className="hero-marquee-mask overflow-hidden">
        <div className="hero-marquee-track flex gap-4 px-4 w-max group-hover/hero:[animation-play-state:paused]">
          {loop.map((p, i) => (
            <HeroItem key={`${p._id}-${i}`} product={p} onClick={handleBuyNow} />
          ))}
        </div>
      </div>
    </div>
  )
}
