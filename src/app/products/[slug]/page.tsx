// src/app/products/[slug]/page.tsx
'use client'
import { useEffect, useState, useRef } from 'react'
import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion'
import type { Product } from '@/types'
import { useCart } from '@/hooks/useCart'
import { urlFor } from '../../../../sanity/lib/image'
import { buildNotifyUrl } from '@/lib/notify'
import toast from 'react-hot-toast'

const toastOptions = { style: { background: '#111', color: '#fff', border: '1px solid #2a2a2a', fontFamily: 'Barlow Condensed', letterSpacing: '2px' } }
const toastErrorOptions = { style: { ...toastOptions.style, border: '1px solid #ff2d2d' } }

export default function ProductPage() {
  const { slug } = useParams()
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedColor, setSelectedColor] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [waDigits, setWaDigits] = useState('')
  const { addItem, openCart } = useCart()

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    // A missing product comes back as a 404 with an error body — that must become "not found",
    // not be treated as a product (which crashed the page).
    fetch(`/api/products/${slug}`)
      .then(r => (r.ok ? r.json() : null))
      .then(data => { if (!cancelled) setProduct(data && data._id ? data : null) })
      .catch(() => { if (!cancelled) setProduct(null) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [slug])

  // WhatsApp number for the Coming Soon "Notify me" button
  useEffect(() => {
    fetch('/api/whatsapp')
      .then(r => r.json())
      .then(d => setWaDigits(d?.digits || ''))
      .catch(() => {})
  }, [])

  // Reset selections whenever a different product loads. (Size and colour used to carry over from
  // the previous product, so you could end up ordering a size this one doesn't come in.)
  // If there's only one size/colour there's nothing to choose, so pre-select it.
  useEffect(() => {
    setSelectedImage(0)
    setQuantity(1)
    const sizes = (product?.sizes ?? []).filter(Boolean)
    const colors = (product?.colors ?? []).filter(Boolean)
    setSelectedSize(sizes.length === 1 ? sizes[0] : '')
    setSelectedColor(colors.length === 1 ? colors[0] : '')
  }, [product?._id])

  const validateSelection = () => {
    if (product?.sizes?.length && !selectedSize) {
      toast.error('Please select a size', toastErrorOptions)
      return false
    }
    if (product?.colors?.length && !selectedColor) {
      toast.error('Please select a color', toastErrorOptions)
      return false
    }
    return true
  }

  const buildCartItem = () => {
    if (!product) return null
    const img = product.images?.[0] ? urlFor(product.images[0]).width(600).url() : ''
    return {
      _id: product._id,
      name: product.name,
      price: product.price,
      image: img,
      size: selectedSize || 'ONE SIZE',
      color: selectedColor || 'DEFAULT',
      quantity,
      slug: product.slug,
    }
  }

  const handleNotify = () => {
    if (!product) return
    window.open(
      buildNotifyUrl(product, waDigits, { size: selectedSize, color: selectedColor }),
      '_blank',
      'noopener,noreferrer'
    )
  }

  const handleAddToCart = () => {
    if (product?.isComingSoon) return // can't be ordered yet
    if (!validateSelection()) return
    const item = buildCartItem()
    if (!item) return
    addItem(item)
    toast.success('Added to cart', toastOptions)
    openCart()
  }

  const handleBuyNow = () => {
    if (product?.isComingSoon) return // can't be ordered yet
    if (!validateSelection()) return
    const item = buildCartItem()
    if (!item) return
    addItem(item)
    router.push('/checkout')
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center font-bebas text-2xl tracking-[4px] text-[#888]">LOADING...</div>
  }
  if (!product) {
    return <div className="min-h-screen flex items-center justify-center font-bebas text-2xl tracking-[4px] text-[#888]">PRODUCT NOT FOUND</div>
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="max-w-6xl mx-auto px-4 py-10 pb-32 md:pb-10 grid grid-cols-1 md:grid-cols-2 gap-10 items-start"
    >
      {/* Images — sticky so it stays in view while you scroll the details column */}
      <motion.div
        initial={{ opacity: 0, x: -24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="md:sticky md:top-24"
      >
        <RotateViewer
          product={product}
          selectedImage={selectedImage}
          setSelectedImage={setSelectedImage}
          onOpenLightbox={() => setLightboxOpen(true)}
        />

        {product.images?.length > 1 && (
          <div className="flex gap-2 mt-3">
            {product.images.map((img, i) => (
              <motion.button
                key={img._key}
                onClick={() => setSelectedImage(i)}
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.94 }}
                className={`w-16 h-16 relative border transition-colors ${selectedImage === i ? 'border-white' : 'border-[#2a2a2a] hover:border-[#888]'}`}
              >
                <Image src={urlFor(img).width(160).height(160).url()} alt="" fill className="object-cover" />
                {selectedImage === i && (
                  <motion.div layoutId="thumb-active" className="absolute inset-0 ring-2 ring-white pointer-events-none" />
                )}
              </motion.button>
            ))}
          </div>
        )}
      </motion.div>

      {/* Details */}
      <motion.div
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut', delay: 0.05 }}
        className="space-y-6"
      >
        <div>
          {product.isComingSoon ? (
            <span className="inline-block bg-[#c8a96e] text-black text-xs tracking-[3px] px-2 py-1 font-bebas">
              COMING SOON
            </span>
          ) : product.isNew && (
            <motion.span
              animate={{ opacity: [1, 0.6, 1] }}
              transition={{ repeat: Infinity, duration: 1.8 }}
              className="inline-block bg-[#ff2d2d] text-white text-xs tracking-[3px] px-2 py-1 font-bebas"
            >
              NEW RELEASE
            </motion.span>
          )}
          <h1 className="font-bebas text-4xl tracking-[3px] mt-2">{product.name}</h1>
          <p className="font-bebas text-2xl text-[#c8a96e] mt-1">₦{product.price.toLocaleString()} NGN</p>
        </div>

        {product.description && (
          <p className="text-[#888] text-sm leading-relaxed">{product.description}</p>
        )}

        {/* Sizes */}
        {product.sizes?.length > 0 && (
          <div>
            <p className="text-xs tracking-[3px] text-[#888] mb-2">SELECT SIZE</p>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map(s => (
                <motion.button
                  key={s}
                  onClick={() => setSelectedSize(s)}
                  whileTap={{ scale: 0.92 }}
                  className={`px-4 py-2 text-xs tracking-[2px] border transition-colors font-bebas ${selectedSize === s ? 'border-white text-white bg-[#1a1a1a]' : 'border-[#2a2a2a] text-[#888] hover:border-[#888]'}`}
                >
                  {s}
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* Colors */}
        {product.colors?.length > 0 && (
          <div>
            <p className="text-xs tracking-[3px] text-[#888] mb-2">SELECT COLOR</p>
            <div className="flex flex-wrap gap-2">
              {product.colors.map(c => (
                <motion.button
                  key={c}
                  onClick={() => setSelectedColor(c)}
                  whileTap={{ scale: 0.92 }}
                  className={`px-4 py-2 text-xs tracking-[2px] border transition-colors font-bebas ${selectedColor === c ? 'border-white text-white bg-[#1a1a1a]' : 'border-[#2a2a2a] text-[#888] hover:border-[#888]'}`}
                >
                  {c}
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* Quantity */}
        {!product.isSoldOut && !product.isComingSoon && (
          <div>
            <p className="text-xs tracking-[3px] text-[#888] mb-2">QUANTITY</p>
            <div className="inline-flex items-center border border-[#2a2a2a]">
              <button
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="w-10 h-10 flex items-center justify-center text-white hover:bg-[#1a1a1a] transition-colors font-bebas text-lg"
                aria-label="Decrease quantity"
              >
                −
              </button>
              <div className="w-12 h-10 flex items-center justify-center overflow-hidden relative">
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span
                    key={quantity}
                    initial={{ y: 16, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -16, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="font-bebas text-lg text-white absolute"
                  >
                    {quantity}
                  </motion.span>
                </AnimatePresence>
              </div>
              <button
                onClick={() => setQuantity(q => Math.min(20, q + 1))}
                className="w-10 h-10 flex items-center justify-center text-white hover:bg-[#1a1a1a] transition-colors font-bebas text-lg"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
          </div>
        )}

        {/* CTA — desktop */}
        <div className="hidden md:flex gap-3">
          {product.isComingSoon ? (
            <button
              onClick={handleNotify}
              className="w-full border border-[#c8a96e] text-[#c8a96e] hover:bg-[#25D366] hover:border-[#25D366] hover:text-white py-4 font-bebas text-lg tracking-[3px] transition-colors"
            >
              NOTIFY ME ON WHATSAPP
            </button>
          ) : product.isSoldOut ? (
            <button disabled className="w-full bg-[#888] text-black py-4 font-bebas text-xl tracking-[4px] cursor-not-allowed">SOLD OUT</button>
          ) : (
            <>
              <motion.button
                onClick={handleAddToCart}
                whileTap={{ scale: 0.97 }}
                className="w-1/2 border border-white text-white hover:bg-white hover:text-black py-4 font-bebas text-lg tracking-[3px] transition-colors"
              >
                ADD TO CART
              </motion.button>
              <motion.button
                onClick={handleBuyNow}
                whileTap={{ scale: 0.97 }}
                className="w-1/2 bg-[#ff2d2d] hover:bg-red-700 text-white py-4 font-bebas text-lg tracking-[3px] transition-colors"
              >
                BUY NOW
              </motion.button>
            </>
          )}
        </div>

        <div className="border-t border-[#2a2a2a] pt-4 space-y-2">
          <p className="text-[#555] text-xs tracking-[2px]">📦 Delivery within Lagos: 1–2 business days</p>
          <p className="text-[#555] text-xs tracking-[2px]">🔒 Secure checkout via Flutterwave</p>
          <p className="text-[#555] text-xs tracking-[2px]">📱 Pay with card, bank transfer, or USSD</p>
        </div>
      </motion.div>

      {/* Sticky mobile CTA */}
      {product.isComingSoon && (
        <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-[#0a0a0a] border-t border-[#2a2a2a] p-3">
          <button onClick={handleNotify} className="w-full border border-[#c8a96e] text-[#c8a96e] active:bg-[#25D366] active:border-[#25D366] active:text-white py-3 font-bebas text-sm tracking-[2px]">
            NOTIFY ME ON WHATSAPP
          </button>
        </div>
      )}
      {!product.isSoldOut && !product.isComingSoon && (
        <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-[#0a0a0a] border-t border-[#2a2a2a] p-3 flex gap-2">
          <button onClick={handleAddToCart} className="w-1/2 border border-white text-white py-3 font-bebas text-sm tracking-[2px]">
            ADD TO CART
          </button>
          <button onClick={handleBuyNow} className="w-1/2 bg-[#ff2d2d] text-white py-3 font-bebas text-sm tracking-[2px]">
            BUY NOW
          </button>
        </div>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxOpen && product.images?.[selectedImage] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxOpen(false)}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-6 cursor-zoom-out"
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 24 }}
              className="relative w-full max-w-2xl aspect-square"
            >
              <Image
                src={urlFor(product.images[selectedImage]).width(1200).height(1200).url()}
                alt={product.name}
                fill
                className="object-contain"
              />
            </motion.div>
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute top-6 right-6 text-white font-bebas text-2xl tracking-[2px]"
              aria-label="Close"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

/**
 * The full effect: hovering tilts the image in real 3D perspective (with a
 * glossy light sheen that tracks the cursor), while dragging left/right spins
 * through the product's photo set like a turntable. A quick tap (no real
 * drag) opens the zoom lightbox.
 */
function RotateViewer({
  product,
  selectedImage,
  setSelectedImage,
  onOpenLightbox,
}: {
  product: Product
  selectedImage: number
  setSelectedImage: (i: number) => void
  onOpenLightbox: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  const dragState = useRef({ dragging: false, startX: 0, moved: 0, startIndex: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const frameCount = product.images?.length || 1
  const canRotate = frameCount > 1
  const PIXELS_PER_FRAME = 45 // drag distance needed to advance one photo

  // 3D tilt — follows the cursor continuously, independent of the drag-to-rotate logic
  const rotateX = useMotionValue(0)
  const rotateY = useMotionValue(0)
  const springX = useSpring(rotateX, { stiffness: 200, damping: 20 })
  const springY = useSpring(rotateY, { stiffness: 200, damping: 20 })
  const glareX = useTransform(springY, [-10, 10], [0, 100])
  const glareY = useTransform(springX, [-10, 10], [100, 0])
  // (created once here — it used to be created inside the JSX, i.e. a new one on every render)
  const glareBackground = useTransform(
    [glareX, glareY] as any,
    ([gx, gy]: any) => `radial-gradient(circle at ${gx}% ${gy}%, rgba(255,255,255,0.35), transparent 55%)`
  )

  const handlePointerMoveTilt = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width
    const py = (e.clientY - rect.top) / rect.height
    rotateY.set((px - 0.5) * 16)
    rotateX.set((0.5 - py) * 16)
  }

  const resetTilt = () => {
    rotateX.set(0)
    rotateY.set(0)
  }

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return // right/middle click shouldn't start a drag or open the lightbox
    ref.current?.setPointerCapture(e.pointerId)
    dragState.current = { dragging: true, startX: e.clientX, moved: 0, startIndex: selectedImage }
    setIsDragging(true)
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    handlePointerMoveTilt(e)
    const s = dragState.current
    if (!s.dragging || !canRotate) return
    const delta = e.clientX - s.startX
    s.moved = Math.abs(delta)

    const framesToMove = Math.trunc(delta / PIXELS_PER_FRAME)
    let next = (s.startIndex - framesToMove) % frameCount
    if (next < 0) next += frameCount
    if (next !== selectedImage) setSelectedImage(next)
  }

  const endDrag = () => {
    if (!dragState.current.dragging) return
    const wasClick = dragState.current.moved < 6
    dragState.current.dragging = false
    setIsDragging(false)
    if (wasClick) onOpenLightbox()
  }

  // The gesture was interrupted (the browser took over to scroll the page, or the pointer left
  // the image) — that's not a tap, so it must not open the lightbox.
  const cancelDrag = () => {
    dragState.current.dragging = false
    setIsDragging(false)
    resetTilt()
  }

  const currentImg = product.images?.[selectedImage]

  return (
    <div style={{ perspective: 1200 }}>
      <motion.div
        ref={ref}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={cancelDrag}
        onPointerLeave={cancelDrag}
        style={{ rotateX: springX, rotateY: springY, transformStyle: 'preserve-3d' }}
        whileHover={{ scale: 1.02 }}
        className={`aspect-square bg-[#1a1a1a] relative border border-[#2a2a2a] overflow-hidden select-none touch-pan-y ${canRotate ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-zoom-in'}`}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {currentImg && (
            <motion.div
              key={currentImg._key}
              initial={{ opacity: 0.4 }}
              animate={{ opacity: 1 }}
              transition={{ duration: isDragging ? 0 : 0.2 }}
              className="absolute inset-0"
            >
              <Image
                src={urlFor(currentImg).width(1000).height(1000).url()}
                alt={product.name}
                fill
                className="object-cover pointer-events-none"
                sizes="(max-width:768px) 100vw, 50vw"
                priority
                draggable={false}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Glossy sheen that tracks the tilt for a real 3D feel */}
        <motion.div
          className="absolute inset-0 pointer-events-none mix-blend-overlay"
          style={{ background: glareBackground }}
        />

        {canRotate ? (
          <>
            <div className="absolute top-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/50 px-2.5 py-1 pointer-events-none">
              <span className="text-white text-xs">⟲</span>
              <span className="text-[9px] tracking-[2px] text-white/80">DRAG TO ROTATE</span>
            </div>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1 pointer-events-none">
              {product.images.map((img, i) => (
                <span
                  key={img._key}
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${i === selectedImage ? 'bg-white' : 'bg-white/30'}`}
                />
              ))}
            </div>
          </>
        ) : (
          <span className="absolute bottom-2 right-2 text-[9px] tracking-[2px] text-white/70 bg-black/40 px-2 py-1 pointer-events-none">
            TAP TO ZOOM
          </span>
        )}
      </motion.div>
    </div>
  )
}
