// src/app/page.tsx
import { getAllProducts, getComingSoon, getSiteSettings } from '@/lib/queries'
import ProductGrid from '@/components/shop/ProductGrid'
import HeroCarousel from '@/components/shop/HeroCarousel'
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {comingSoon.map(p => {
              const img = p.images?.[0] ? urlFor(p.images[0]).width(400).url() : null
              return (
                <div key={p._id} className="border border-[#2a2a2a] p-3 text-center">
                  <div className="aspect-square bg-[#1a1a1a] relative mb-3">
                    {img && <Image src={img} alt={p.name} fill className="object-cover opacity-60" />}
                  </div>
                  <p className="font-bebas text-sm tracking-[2px] mb-2">{p.name}</p>
                  <button className="w-full border border-[#2a2a2a] hover:border-[#c8a96e] hover:text-[#c8a96e] text-[#888] py-1.5 text-xs tracking-[2px] transition-colors font-bebas">
                    NOTIFY ME
                  </button>
                </div>
              )
            })}
          </div>
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
