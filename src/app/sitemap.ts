// src/app/sitemap.ts  →  served at /sitemap.xml
// Built from Sanity, so a new product appears in the sitemap without anyone editing code.
import type { MetadataRoute } from 'next'
import { getSitemapProducts } from '@/lib/queries'
import { CATEGORY_SEO, abs } from '@/lib/seo'

export const revalidate = 3600 // refresh hourly

// Pages worth indexing. (Checkout, order confirmation, order tracking and search are left out on purpose.)
const STATIC_PAGES = ['/gallery', '/contact', '/faq', '/returns', '/shipping-policy', '/size-guide', '/privacy-policy', '/terms-of-service']

const newest = (dates: string[]) => (dates.length ? new Date(Math.max(...dates.map(d => new Date(d).getTime()))) : undefined)

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getSitemapProducts()

  const entries: MetadataRoute.Sitemap = [{ url: abs('/'), lastModified: newest(products.map(p => p._updatedAt)) }]

  // Category pages — only ones that actually have products (an empty page is a "nothing here yet" page)
  for (const slug of Object.keys(CATEGORY_SEO)) {
    const inCategory =
      slug === 'new' ? products.filter(p => p.isNew)
      : slug === 'pre-order' ? products.filter(p => p.isComingSoon)
      : products.filter(p => p.category === slug)
    if (inCategory.length) entries.push({ url: abs(`/category/${slug}`), lastModified: newest(inCategory.map(p => p._updatedAt)) })
  }

  // No lastModified for these: we don't know when they changed, and a made-up date is worse than none
  for (const path of STATIC_PAGES) entries.push({ url: abs(path) })

  for (const p of products) entries.push({ url: abs(`/products/${p.slug}`), lastModified: new Date(p._updatedAt) })

  return entries
}
