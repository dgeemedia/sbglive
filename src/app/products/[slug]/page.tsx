// src/app/products/[slug]/page.tsx
'use client'
import { useEffect, useState, useRef } from 'react'
import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion'
import type { Product } from '@/types'
import { useCart } from '@/hooks/useCart'
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
  const { addItem, openCart } = useCart()

  useEffect(() => {
    fetch(`/api/products/${slug}`)
      .then(r => r.json())
      .then(data => { setProduct(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [slug])

  // Reset transient selections whenever a different product loads
  useEffect(() => {
    setSelectedImage(0)
    setQuantity(1)
  }, [product?._id])

  const validateSelection = () => {
    if (product?.sizes?.length && !selectedSize) {
      toast.error('Please select a size', toastErrorOptions)
      return false
    }
    return true
  }

  const buildCartItem = () => {
    if (!product) return null
    return {
      _id: product._id,
      name: product.name,
      price: product.price,
      image: `/api/image?ref=${product.images?.[0]?.asset?._ref}`,
      size: selectedSize || 'ONE SIZE',
      color: selectedColor || 'DEFAULT',
      quantity,
      slug: product.slug,
    }
  }

  const handleAddToCart = () => {
    if (!validateSelection()) return
    const item = buildCartItem()
    if (!item) return
    addItem(item)
    toast.success('Added to cart', toastOptions)
    openCart()
  }

  const handleBuyNow = () => {
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
      className="max-w-6xl mx-auto px-4 py-10 pb-32 md:pb-10 grid grid-cols-1 md:grid-cols-2 gap-10"
    >
      {/* Images */}
      <motion.div
        initial={{ opacity: 0, x: -24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <TiltImage
          product={product}
          selectedImage={selectedImage}
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
                <Image src={`/api/image?ref=${img.asset._ref}`} alt="" fill className="object-cover" />
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
          {product.isNew && (
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
        {!product.isSoldOut && (
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
          {product.isSoldOut ? (
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
      {!product.isSoldOut && (
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
                src={`/api/image?ref=${product.images[selectedImage].asset._ref}`}
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

function TiltImage({
  product,
  selectedImage,
  onOpenLightbox,
}: {
  product: Product
  selectedImage: number
  onOpenLightbox: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  const rotateX = useMotionValue(0)
  const rotateY = useMotionValue(0)
  const springX = useSpring(rotateX, { stiffness: 200, damping: 20 })
  const springY = useSpring(rotateY, { stiffness: 200, damping: 20 })
  const glareX = useTransform(springY, [-10, 10], [0, 100])
  const glareY = useTransform(springX, [-10, 10], [100, 0])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width
    const py = (e.clientY - rect.top) / rect.height
    rotateY.set((px - 0.5) * 18) // left/right tilt
    rotateX.set((0.5 - py) * 18) // up/down tilt
  }

  const handleMouseLeave = () => {
    rotateX.set(0)
    rotateY.set(0)
  }

  const currentImg = product.images?.[selectedImage]

  return (
    <div style={{ perspective: 1200 }}>
      <motion.div
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={onOpenLightbox}
        style={{ rotateX: springX, rotateY: springY, transformStyle: 'preserve-3d' }}
        whileHover={{ scale: 1.02 }}
        className="aspect-square bg-[#1a1a1a] relative border border-[#2a2a2a] overflow-hidden cursor-zoom-in select-none"
      >
        <AnimatePresence mode="wait">
          {currentImg && (
            <motion.div
              key={currentImg._key}
              initial={{ opacity: 0, scale: 1.03 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
              className="absolute inset-0"
            >
              <Image
                src={`/api/image?ref=${currentImg.asset._ref}`}
                alt={product.name}
                fill
                className="object-cover pointer-events-none"
                sizes="(max-width:768px) 100vw, 50vw"
                priority
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sheen that tracks the tilt for a subtle glossy 3D feel */}
        <motion.div
          className="absolute inset-0 pointer-events-none mix-blend-overlay"
          style={{
            background: useTransform(
              [glareX, glareY] as any,
              ([gx, gy]: any) => `radial-gradient(circle at ${gx}% ${gy}%, rgba(255,255,255,0.35), transparent 55%)`
            ),
          }}
        />

        <span className="absolute bottom-2 right-2 text-[9px] tracking-[2px] text-white/70 bg-black/40 px-2 py-1 pointer-events-none">
          TAP TO ZOOM
        </span>
      </motion.div>
    </div>
  )
}
