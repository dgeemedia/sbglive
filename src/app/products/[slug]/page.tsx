// src/app/products/[slug]/page.tsx
'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import type { Product } from '@/types'
import { useCart } from '@/hooks/useCart'
import toast from 'react-hot-toast'

export default function ProductPage() {
  const { slug } = useParams()
  const [product, setProduct] = useState<Product | null>(null)
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedColor, setSelectedColor] = useState('')
  const [loading, setLoading] = useState(true)
  const { addItem, openCart } = useCart()

  useEffect(() => {
    fetch(`/api/products/${slug}`)
      .then(r => r.json())
      .then(data => { setProduct(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [slug])

  const handleAddToCart = () => {
    if (!product) return
    if (product.sizes?.length && !selectedSize) {
      toast.error('Please select a size', { style: { background: '#111', color: '#fff', border: '1px solid #ff2d2d' } })
      return
    }
    addItem({
      _id: product._id,
      name: product.name,
      price: product.price,
      image: `/api/image?ref=${product.images?.[0]?.asset?._ref}`,
      size: selectedSize || 'ONE SIZE',
      color: selectedColor || 'DEFAULT',
      quantity: 1,
      slug: product.slug,
    })
    toast.success('Added to cart', { style: { background: '#111', color: '#fff', border: '1px solid #2a2a2a' } })
    openCart()
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center font-bebas text-2xl tracking-[4px] text-[#888]">LOADING...</div>
  }
  if (!product) {
    return <div className="min-h-screen flex items-center justify-center font-bebas text-2xl tracking-[4px] text-[#888]">PRODUCT NOT FOUND</div>
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-2 gap-10">
      {/* Images */}
      <div>
        <div className="aspect-square bg-[#1a1a1a] relative mb-3 border border-[#2a2a2a]">
          {product.images?.[selectedImage] && (
            <Image
              src={`/api/image?ref=${product.images[selectedImage].asset._ref}`}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width:768px) 100vw, 50vw"
            />
          )}
        </div>
        {product.images?.length > 1 && (
          <div className="flex gap-2">
            {product.images.map((img, i) => (
              <button
                key={img._key}
                onClick={() => setSelectedImage(i)}
                className={`w-16 h-16 relative border transition-colors ${selectedImage === i ? 'border-white' : 'border-[#2a2a2a] hover:border-[#888]'}`}
              >
                <Image src={`/api/image?ref=${img.asset._ref}`} alt="" fill className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Details */}
      <div className="space-y-6">
        <div>
          {product.isNew && <span className="bg-[#ff2d2d] text-white text-xs tracking-[3px] px-2 py-1 font-bebas">NEW RELEASE</span>}
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
                <button
                  key={s}
                  onClick={() => setSelectedSize(s)}
                  className={`px-4 py-2 text-xs tracking-[2px] border transition-colors font-bebas ${selectedSize === s ? 'border-white text-white bg-[#1a1a1a]' : 'border-[#2a2a2a] text-[#888] hover:border-[#888]'}`}
                >
                  {s}
                </button>
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
                <button
                  key={c}
                  onClick={() => setSelectedColor(c)}
                  className={`px-4 py-2 text-xs tracking-[2px] border transition-colors font-bebas ${selectedColor === c ? 'border-white text-white bg-[#1a1a1a]' : 'border-[#2a2a2a] text-[#888] hover:border-[#888]'}`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        {product.isSoldOut ? (
          <button disabled className="w-full bg-[#888] text-black py-4 font-bebas text-xl tracking-[4px] cursor-not-allowed">SOLD OUT</button>
        ) : (
          <button onClick={handleAddToCart} className="w-full bg-[#ff2d2d] hover:bg-red-700 text-white py-4 font-bebas text-xl tracking-[4px] transition-colors">
            ADD TO CART
          </button>
        )}

        <div className="border-t border-[#2a2a2a] pt-4 space-y-2">
          <p className="text-[#555] text-xs tracking-[2px]">📦 Delivery within Lagos: 1–2 business days</p>
          <p className="text-[#555] text-xs tracking-[2px]">🔒 Secure checkout via Paystack</p>
          <p className="text-[#555] text-xs tracking-[2px]">📱 Pay with card, bank transfer, or USSD</p>
        </div>
      </div>
    </div>
  )
}
