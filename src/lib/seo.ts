// src/lib/seo.ts
// One place for everything search engines and link previews read: site constants, per-page metadata,
// and the JSON-LD "structured data" (product prices/availability, breadcrumbs, organisation).
import type { Metadata } from 'next'
import type { Product, SiteSettings } from '@/types'
import { urlFor } from '../../sanity/lib/image'
import { toWaDigits } from './phone'

export const SITE_URL = 'https://sbgfashion.live' // always the live domain — previews/localhost must not become canonical
export const SITE_NAME = 'SBGFASHION'
export const DEFAULT_TITLE = 'SBGFASHION – Lagos Streetwear'
export const DEFAULT_DESCRIPTION =
  'SBGFASHION is a Lagos streetwear brand pushing the limits of fashion and culture. Shop new drops, tops, bottoms and accessories.'

// 1200x630 is the size WhatsApp, Facebook, X and LinkedIn all show as a large preview card
export const DEFAULT_OG_IMAGE = { url: '/og-default.png', width: 1200, height: 630, alt: 'SBGFASHION – Lagos streetwear' }

export const abs = (path: string) => new URL(path, SITE_URL).toString()

/** Cut text to ~max characters on a word boundary (meta descriptions over ~160 get truncated by Google) */
export function truncate(text: string | undefined | null, max = 155): string {
  const clean = (text ?? '').replace(/\s+/g, ' ').trim()
  if (clean.length <= max) return clean
  const cut = clean.slice(0, max - 1)
  return cut.slice(0, cut.lastIndexOf(' ') > 60 ? cut.lastIndexOf(' ') : cut.length).replace(/[,.;:!\-–—\s]+$/, '') + '…'
}

/**
 * Metadata for a normal page. Every page goes through this because Next.js REPLACES (doesn't merge)
 * a layout's openGraph/twitter when a page sets its own — so each page must carry the preview image
 * itself, and the canonical URL must be set per page (a canonical on the root layout would be
 * inherited by every page and point the whole site at the homepage).
 */
export function pageMeta(opts: {
  title: string
  description: string
  path: string
  noindex?: boolean
  image?: { url: string; width?: number; height?: number; alt?: string }
}): Metadata {
  const { title, description, path, noindex = false, image = DEFAULT_OG_IMAGE } = opts
  const fullTitle = `${title} | ${SITE_NAME}`
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title: fullTitle, description, url: path, siteName: SITE_NAME, type: 'website', locale: 'en_NG', images: [image] },
    twitter: { card: 'summary_large_image', title: fullTitle, description, images: [image.url] },
    ...(noindex && { robots: { index: false, follow: false } }),
  }
}

// ---------------------------------------------------------------- categories
export const CATEGORY_SEO: Record<string, { name: string; title: string; description: string }> = {
  new: { name: 'New Releases', title: 'New Releases – Lagos Streetwear', description: 'The latest SBGFASHION drops. Shop new releases from the Lagos streetwear brand.' },
  tops: { name: 'Tops', title: 'Tops – Lagos Streetwear', description: 'Shop tops from SBGFASHION, the Lagos streetwear brand.' },
  bottoms: { name: 'Bottoms', title: 'Bottoms – Lagos Streetwear', description: 'Shop bottoms from SBGFASHION, the Lagos streetwear brand.' },
  accessories: { name: 'Accessories', title: 'Accessories – Lagos Streetwear', description: 'Shop accessories from SBGFASHION, the Lagos streetwear brand.' },
  footwear: { name: 'Footwear', title: 'Footwear – Lagos Streetwear', description: 'Shop footwear from SBGFASHION, the Lagos streetwear brand.' },
  headwear: { name: 'Headwear', title: 'Headwear – Lagos Streetwear', description: 'Shop headwear from SBGFASHION, the Lagos streetwear brand.' },
  'pre-order': { name: 'Pre-Order & Coming Soon', title: 'Coming Soon & Pre-Order', description: "Upcoming SBGFASHION drops. See what's landing next and get notified when it's here." },
}

// ---------------------------------------------------------------- JSON-LD
/**
 * Serialise structured data for a <script> tag. "<" is escaped so text from the CMS (a product
 * description containing "</script>") can never break out of the tag and inject markup.
 */
export function safeJson(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029')
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({ '@type': 'ListItem', position: i + 1, name: item.name, item: abs(item.path) })),
  }
}

export function websiteJsonLd() {
  return { '@context': 'https://schema.org', '@type': 'WebSite', name: SITE_NAME, alternateName: 'SBG Fashion', url: SITE_URL }
}

export function organizationJsonLd(settings?: SiteSettings | null) {
  const sameAs = (settings?.socialLinks ?? []).map(l => l?.url).filter((u): u is string => !!u && /^https?:\/\//i.test(u))
  const digits = toWaDigits(settings?.phone) || toWaDigits(settings?.whatsappNumber)
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: abs('/logo.png'),
    description: DEFAULT_DESCRIPTION,
    address: { '@type': 'PostalAddress', addressLocality: 'Lagos', addressCountry: 'NG' },
    ...(sameAs.length && { sameAs }),
    ...(digits.length >= 10 && { contactPoint: { '@type': 'ContactPoint', telephone: `+${digits}`, contactType: 'customer service', areaServed: 'NG', availableLanguage: 'English' } }),
  }
}

/**
 * Product structured data (what earns price / availability in Google results).
 * It must match what the page shows: sold-out items say OutOfStock, and a Coming Soon item can't be
 * bought yet so it carries NO offer at all (claiming a price/availability we don't honour breaks
 * Google's merchant rules).
 */
export function productJsonLd(product: Product) {
  const url = abs(`/products/${product.slug}`)
  const images = (product.images ?? []).slice(0, 5).map(img => urlFor(img).width(1200).url())
  const categoryName = CATEGORY_SEO[product.category]?.name
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: truncate(product.description, 5000) || `${product.name} by ${SITE_NAME} — Lagos streetwear.`,
    url,
    sku: product.slug,
    brand: { '@type': 'Brand', name: SITE_NAME },
    ...(categoryName && { category: categoryName }),
    ...(images.length && { image: images }),
    ...(!product.isComingSoon && {
      offers: {
        '@type': 'Offer',
        url,
        priceCurrency: 'NGN',
        price: Number(product.price),
        availability: product.isSoldOut ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock',
        itemCondition: 'https://schema.org/NewCondition',
        seller: { '@type': 'Organization', name: SITE_NAME },
      },
    }),
  }
}
