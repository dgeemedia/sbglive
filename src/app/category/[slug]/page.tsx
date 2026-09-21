// src/app/category/[slug]/page.tsx
import { cache } from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import JsonLd from '@/components/seo/JsonLd'
import { CATEGORY_SEO, breadcrumbJsonLd, pageMeta } from '@/lib/seo'
import ProductGrid from '@/components/shop/ProductGrid'
import ComingSoonGrid from '@/components/shop/ComingSoonGrid'
import {
  getNewReleases,
  getProductsByCategory,
  getAllComingSoon,
  getSiteSettings,
} from '@/lib/queries'
import { waDigitsFromSettings } from '@/lib/phone'

const CATEGORY_MAP: Record<string, { title: string; kind: 'products' | 'comingsoon'; fetch: () => Promise<any[]> }> = {
  new: { title: 'NEW RELEASE', kind: 'products', fetch: getNewReleases },
  tops: { title: 'TOPS', kind: 'products', fetch: () => getProductsByCategory('tops') },
  bottoms: { title: 'BOTTOMS', kind: 'products', fetch: () => getProductsByCategory('bottoms') },
  accessories: { title: 'ACCESSORIES', kind: 'products', fetch: () => getProductsByCategory('accessories') },
  footwear: { title: 'FOOTWEAR', kind: 'products', fetch: () => getProductsByCategory('footwear') },
  headwear: { title: 'HEADWEAR', kind: 'products', fetch: () => getProductsByCategory('headwear') },
  'pre-order': { title: 'PRE-ORDER', kind: 'comingsoon', fetch: getAllComingSoon },
}

export const revalidate = 60

// generateMetadata and the page both need the items — cache() makes that one Sanity query, not two
const loadItems = cache(async (slug: string) => CATEGORY_MAP[slug]?.fetch())

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const seo = CATEGORY_SEO[slug]
  if (!seo || !CATEGORY_MAP[slug]) return {}
  let items: any[] = []
  try { items = (await loadItems(slug)) ?? [] } catch {}
  // An empty category is a "nothing here yet" page — keep it out of search results until it has products
  return pageMeta({ title: seo.title, description: seo.description, path: `/category/${slug}`, noindex: items.length === 0 })
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const config = CATEGORY_MAP[slug]
  if (!config) notFound()

  const [items, settings] = await Promise.all([loadItems(slug).then(r => r ?? []), getSiteSettings()])
  const waDigits = waDigitsFromSettings(settings)

  return (
    <div>
      <JsonLd data={breadcrumbJsonLd([{ name: 'Home', path: '/' }, { name: CATEGORY_SEO[slug]?.name ?? config.title, path: `/category/${slug}` }])} />
      <div className="flex items-center gap-4 px-4 py-8">
        <h1 className="font-bebas text-2xl tracking-[6px] text-white">{config.title}</h1>
        <div className="flex-1 h-px bg-[#2a2a2a]" />
        <span className="text-[#555] text-xs tracking-[2px]">{items.length} ITEM{items.length !== 1 ? 'S' : ''}</span>
      </div>

      {items.length === 0 ? (
        <p className="text-[#888] text-sm text-center py-20 tracking-[2px]">NOTHING HERE YET — CHECK BACK SOON</p>
      ) : config.kind === 'comingsoon' ? (
        <div className="px-4 pb-16">
          <ComingSoonGrid products={items} waDigits={waDigits} />
        </div>
      ) : (
        <ProductGrid products={items} />
      )}
    </div>
  )
}
