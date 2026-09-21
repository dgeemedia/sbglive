// src/components/shop/HeroCarousel.tsx
'use client'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import type { Product } from '@/types'
import { urlFor } from '../../../sanity/lib/image'
import { useCart } from '@/hooks/useCart'
import { useSpin360 } from '@/hooks/useSpin360'
import { defaultVariant, needsVariantChoice } from '@/lib/variants'
import toast from 'react-hot-toast'

// A marquee needs enough items to fill the widest screen, otherwise you see an empty gap
// at the end of the strip. One "set" is repeated until it has at least this many cards
// (~12 x 206px = ~2500px, wider than any normal display).
const MIN_SET_SIZE = 12
// Scroll speed: seconds per card, so the pace stays the same whether there are 4 products or 40.
const SECONDS_PER_CARD = 3.2

function HeroItem({
  product: p,
  onClick,
  dup = false,
}: {
  product: Product
  onClick: (e: React.MouseEvent, p: Product) => void
  dup?: boolean // a repeated copy that exists only to make the marquee loop seamless
}) {
  const { spinning, startSpin, stopSpin, onIteration } = useSpin360(!!p.isComingSoon)
  const img = p.images?.[0] ? urlFor(p.images[0]).width(500).url() : null

  return (
    <motion.button
      tabIndex={dup ? -1 : undefined}
      data-dup={dup ? '' : undefined}
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

  // One "set" = the products repeated enough times to be wider than the screen.
  // The track then renders TWO identical sets side by side and slides left by exactly one
  // set's width (translateX -50%), so the loop restarts with no visible jump.
  const reps = Math.max(1, Math.ceil(MIN_SET_SIZE / products.length))
  const set = Array.from({ length: reps }, (_, r) => products.map(p => ({ p, dup: r > 0 }))).flat()
  const duration = set.length * SECONDS_PER_CARD

  const handleBuyNow = (e: React.MouseEvent, product: Product) => {
    e.preventDefault()
    // Sold-out and Coming Soon items can't be bought instantly, and neither can anything the
    // customer has to choose a size or colour for — open the product page so they pick it themselves.
    if (product.isSoldOut || product.isComingSoon || needsVariantChoice(product)) {
      router.push(`/products/${product.slug}`)
      return
    }
    const img = product.images?.[0] ? urlFor(product.images[0]).width(600).url() : ''
    const variant = defaultVariant(product)
    addItem({
      _id: product._id,
      name: product.name,
      price: product.price,
      image: img,
      size: variant.size,
      color: variant.color,
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
        <p className="text-[10px] tracking-[4px] text-[#888] font-bebas">TAP AN ITEM TO SHOP</p>
      </div>

      <div className="hero-marquee-mask py-2">
        <div
          className="hero-marquee-track flex w-max group-hover/hero:[animation-play-state:paused]"
          style={{ animationDuration: `${duration}s` }}
        >
          {/* Each copy ends with pr-4 (instead of the track having padding) so both copies are
              exactly the same width and -50% lines up perfectly with the start of copy two. */}
          {[0, 1].map(copy => (
            <div
              key={copy}
              className="flex shrink-0 gap-4 pr-4"
              aria-hidden={copy === 1 ? true : undefined}
              data-dup={copy === 1 ? '' : undefined}
            >
              {set.map(({ p, dup }, i) => (
                <HeroItem key={`${copy}-${i}-${p._id}`} product={p} onClick={handleBuyNow} dup={dup || copy === 1} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
