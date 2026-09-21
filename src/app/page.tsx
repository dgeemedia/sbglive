// src/app/page.tsx
import { getAllProducts, getComingSoon, getSiteSettings } from '@/lib/queries'
import ProductGrid from '@/components/shop/ProductGrid'
import HeroCarousel from '@/components/shop/HeroCarousel'
import HeroLabelMarquee from '@/components/shop/HeroLabelMarquee'
import JsonLd from '@/components/seo/JsonLd'
import { DEFAULT_TITLE, organizationJsonLd, websiteJsonLd } from '@/lib/seo'
import type { Metadata } from 'next'
import ComingSoonGrid from '@/components/shop/ComingSoonGrid'
import Image from 'next/image'
import { urlFor } from '../../sanity/lib/image'
import { waDigitsFromSettings } from '@/lib/phone'

export const metadata: Metadata = {
  title: { absolute: DEFAULT_TITLE },
  alternates: { canonical: '/' },
}

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
  const waDigits = waDigitsFromSettings(settings)

  return (
    <>
      <JsonLd data={[organizationJsonLd(settings), websiteJsonLd()]} />
      {/* Hero — a scrolling label strip, then the scrolling product roll */}
      <section className="bg-[#0a0a0a] pt-6 pb-6 border-b border-[#2a2a2a] relative overflow-hidden">
        {heroBg && (
          <Image src={heroBg} alt="" fill className="object-cover opacity-10" priority />
        )}
        <HeroLabelMarquee title={heroTitle} highlight={heroHighlight} subtitle={heroSubtitle} />

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
