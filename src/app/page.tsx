// src/app/page.tsx
import { getAllProducts, getComingSoon, getSiteSettings } from '@/lib/queries'
import ProductGrid from '@/components/shop/ProductGrid'
import HeroCarousel from '@/components/shop/HeroCarousel'
import ComingSoonGrid from '@/components/shop/ComingSoonGrid'
import Image from 'next/image'
import { urlFor } from '../../sanity/lib/image'

export const revalidate = 60

export default async function HomePage() {
  const [products, comingSoon, settings] = await Promise.all([
    getAllProducts(),
    getComingSoon(),
    getSiteSettings(),
  ])

  const heroTitle = settings?.heroTitle || 'SBG'
  const heroHighlight = settings?.heroHighlight ?? 'FASHION'
  const heroSubtitle = settings?.heroSubtitle || 'LAGOS • ALL PRODUCTS'
  const heroBg = settings?.heroBackgroundImage ? urlFor(settings.heroBackgroundImage).width(1600).url() : null
  const waDigits = (settings?.whatsappNumber || settings?.phone || '').replace(/[^\d]/g, '')

  return (
    <>
      {/* Hero — a slim label strip, the image roll is the real hero now */}
      <section className="bg-[#0a0a0a] pt-6 pb-6 border-b border-[#2a2a2a] relative overflow-hidden">
        {heroBg && (
          <Image src={heroBg} alt="" fill className="object-cover opacity-10" priority />
        )}
        <div className="flex items-center justify-center gap-3 relative z-10">
          <span className="h-px w-8 bg-[#2a2a2a]" />
          <p className="font-bebas text-sm tracking-[8px] text-[#888]">
            {heroTitle}<span className="text-[#ff2d2d]">{heroHighlight}</span> · {heroSubtitle}
          </p>
          <span className="h-px w-8 bg-[#2a2a2a]" />
        </div>

        <HeroCarousel products={products} />
      </section>

      {/* Coming Soon strip */}
      {comingSoon.length > 0 && (
        <section className="bg-[#111] border-b border-[#2a2a2a] px-4 py-6">
          <p className="font-bebas text-xs tracking-[6px] text-[#888] mb-4">COMING SOON</p>
          <ComingSoonGrid products={comingSoon} waDigits={waDigits} />
        </section>
      )}

      {/* Section label */}
      <div className="flex items-center gap-4 px-4 py-6">
        <h2 className="font-bebas text-xl tracking-[6px] text-white">ALL PRODUCTS</h2>
        <div className="flex-1 h-px bg-[#2a2a2a]" />
      </div>

      {/* Product grid */}
      <ProductGrid products={products} />
    </>
  )
}
