// src/lib/seo.ts
// One place for everything search engines and link previews read: site constants, per-page metadata,
// and the JSON-LD "structured data" (product prices/availability, breadcrumbs, organisation).
import type { Metadata } from 'next'
import type { Product, SiteSettings } from '@/types'
import { urlFor } from '../../sanity/lib/image'
import { toWaDigits } from './phone'

export const SITE_URL = 'https://sbgfashion.live' // always the live domain — previews/localhost must not become canonical
export const SITE_NAME = 'SBGFASHION'
export const DEFAULT_TITLE = 'SBGFASHION – Lagos Streetwear & Fashion Clothing Store'
export const DEFAULT_DESCRIPTION =
  'Shop SBGFASHION, a Lagos, Nigeria fashion and streetwear clothing store. Buy trendy tops, shirts, hoodies, bottoms, joggers, accessories and new drops online with nationwide delivery.'

// Baseline keyword set for pages that don't define their own — broad fashion/clothing search terms
// plus the brand and location, so the site shows up for generic "buy clothes" style queries too.
export const DEFAULT_KEYWORDS = [
  'SBGFASHION', 'SBG Fashion', 'Lagos streetwear', 'Nigerian streetwear brand',
  'fashion store Lagos', 'clothing store Nigeria', 'buy clothes online Nigeria',
  'trendy clothes Lagos', 'streetwear fashion', 'urban fashion Nigeria',
  'shop tops online', 'shop bottoms online', 'fashion accessories Nigeria',
]

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
  keywords?: string[]
}): Metadata {
  const { title, description, path, noindex = false, image = DEFAULT_OG_IMAGE, keywords } = opts
  const fullTitle = `${title} | ${SITE_NAME}`
  // Merge page-specific keywords (put first, they're more relevant) with the site-wide fashion/clothing set.
  const mergedKeywords = Array.from(new Set([...(keywords ?? []), ...DEFAULT_KEYWORDS]))
  return {
    title,
    description,
    keywords: mergedKeywords,
    alternates: { canonical: path },
    openGraph: { title: fullTitle, description, url: path, siteName: SITE_NAME, type: 'website', locale: 'en_NG', images: [image] },
    twitter: { card: 'summary_large_image', title: fullTitle, description, images: [image.url] },
    ...(noindex && { robots: { index: false, follow: false } }),
  }
}

// ---------------------------------------------------------------- categories
// Descriptions spell out the actual garment types people search for (t-shirts, hoodies, jeans, etc.)
// rather than just the category label — that's what matches real fashion/clothing search queries.
export const CATEGORY_SEO: Record<string, { name: string; title: string; description: string; keywords: string[] }> = {
  new: {
    name: 'New Releases',
    title: 'New Fashion Drops – Lagos Streetwear',
    description: 'The latest SBGFASHION drops. Shop new streetwear and fashion releases — fresh tops, bottoms and accessories from the Lagos clothing brand.',
    keywords: ['new fashion drops Lagos', 'latest streetwear release', 'new clothes Nigeria', 'new arrivals fashion'],
  },
  tops: {
    name: 'Tops',
    title: 'Tops, T-Shirts & Hoodies – Lagos Streetwear',
    description: 'Shop tops, t-shirts, shirts and hoodies from SBGFASHION, the Lagos streetwear and fashion clothing brand.',
    keywords: ['buy tops online Nigeria', 't-shirts Lagos', 'hoodies Nigeria', 'shirts online', 'streetwear tops'],
  },
  bottoms: {
    name: 'Bottoms',
    title: 'Bottoms, Joggers & Trousers – Lagos Streetwear',
    description: 'Shop bottoms, joggers, trousers and shorts from SBGFASHION, the Lagos streetwear and fashion clothing brand.',
    keywords: ['buy joggers online Nigeria', 'trousers Lagos', 'shorts online', 'streetwear bottoms', 'jeans Nigeria'],
  },
  accessories: {
    name: 'Accessories',
    title: 'Fashion Accessories – Lagos Streetwear',
    description: 'Shop fashion accessories — bags, caps, belts and jewelry — from SBGFASHION, the Lagos streetwear and clothing brand.',
    keywords: ['fashion accessories Nigeria', 'caps and bags Lagos', 'streetwear accessories', 'buy accessories online'],
  },
  footwear: {
    name: 'Footwear',
    title: 'Footwear & Sneakers – Lagos Streetwear',
    description: 'Shop footwear and sneakers from SBGFASHION, the Lagos streetwear and fashion clothing brand.',
    keywords: ['sneakers Nigeria', 'buy shoes online Lagos', 'streetwear footwear', 'fashion shoes'],
  },
  headwear: {
    name: 'Headwear',
    title: 'Headwear & Caps – Lagos Streetwear',
    description: 'Shop headwear, caps and beanies from SBGFASHION, the Lagos streetwear and fashion clothing brand.',
    keywords: ['caps Nigeria', 'beanies Lagos', 'streetwear headwear', 'fashion caps online'],
  },
  'pre-order': {
    name: 'Pre-Order & Coming Soon',
    title: 'Coming Soon & Pre-Order Fashion Drops',
    description: "Upcoming SBGFASHION clothing drops. See what's landing next in fashion, streetwear and accessories, and get notified when it's here.",
    keywords: ['coming soon fashion Lagos', 'pre-order streetwear', 'upcoming clothing drop Nigeria'],
  },
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
    // ClothingStore (a more specific LocalBusiness subtype than plain Organization) tells Google this
    // is a clothing retailer, which is what surfaces a business for local "fashion store near me" /
    // "clothing store Lagos" searches rather than just brand-name lookups.
    '@type': 'ClothingStore',
    name: SITE_NAME,
    alternateName: 'SBG Fashion',
    url: SITE_URL,
    logo: abs('/logo.png'),
    image: abs('/og-default.png'),
    description: DEFAULT_DESCRIPTION,
    priceRange: '$$',
    address: { '@type': 'PostalAddress', addressLocality: 'Lagos', addressCountry: 'NG' },
    areaServed: { '@type': 'Country', name: 'Nigeria' },
    ...(sameAs.length && { sameAs }),
    ...(digits.length >= 10 && { contactPoint: { '@type': 'ContactPoint', telephone: `+${digits}`, contactType: 'customer service', areaServed: 'NG', availableLanguage: 'English' } }),
  }
}

/** ItemList structured data for a category listing page — helps the listing earn a rich "carousel" result. */
export function itemListJsonLd(items: { name: string; slug: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: abs(`/products/${item.slug}`),
      name: item.name,
    })),
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
