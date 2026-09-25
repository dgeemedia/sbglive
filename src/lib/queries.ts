// src/lib/queries.ts
//
// CHANGES from your original:
// 1. PRODUCT_FIELDS now pulls `stock` and a computed `stockTotal`, and `isSoldOut` additionally
//    goes true when every stock line for a product is at 0 (only for products actually using the
//    new per-variant inventory — see product.ts). Products with no `stock` entries behave exactly
//    as before.
// 2. getCheckoutProducts now also returns `stock`, so checkout.ts can validate the quantity
//    requested against real remaining units per size/colour, not just a whole-product flag.
import { sanityClient } from '../../sanity/lib/client'
import type { Product, SiteSettings } from '@/types'
import type { CheckoutProduct } from '@/lib/checkout'

export async function getSiteSettings(): Promise<SiteSettings | null> {
  return sanityClient.fetch(
    `*[_type == "siteSettings"][0]{
      introVideo{ asset->{ url } },
      heroTitle,
      heroHighlight,
      heroSubtitle,
      heroBackgroundImage,
      address,
      phone,
      whatsappNumber,
      socialLinks[]{ platform, url }
    }`
  )
}

const PRODUCT_FIELDS = `
  _id,
  name,
  "slug": slug.current,
  price,
  images[]{_key, asset, alt},
  category,
  sizes,
  colors,
  description,
  inStock,
  stock,
  // Total units left, only meaningful for products that use per-size/colour stock tracking.
  // null (not 0) for products that don't use it, so the front end can tell "not tracked" apart
  // from "tracked and empty".
  "stockTotal": select(count(stock) > 0 => math::sum(stock[].quantity)),
  // "Sold out" if the owner ticked Sold Out, OR unticked In Stock, OR (for products using the new
  // stock array) every stock line is down to zero. A Coming Soon product is never "sold out"
  // though — owners untick In Stock / leave stock at 0 for those because there's no stock yet.
  "isSoldOut": isSoldOut == true
    || (inStock == false && isComingSoon != true)
    || (count(stock) > 0 && isComingSoon != true && math::sum(stock[].quantity) <= 0),
  isNew,
  isComingSoon,
  tags
`

export async function getAllProducts(): Promise<Product[]> {
  return sanityClient.fetch(
    `*[_type == "product"] | order(order asc, _createdAt desc) { ${PRODUCT_FIELDS} }`
  )
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  return sanityClient.fetch(
    `*[_type == "product" && slug.current == $slug][0] { ${PRODUCT_FIELDS} }`,
    { slug }
  )
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
  return sanityClient.fetch(
    `*[_type == "product" && category == $category] | order(order asc) { ${PRODUCT_FIELDS} }`,
    { category }
  )
}

export async function getNewReleases(): Promise<Product[]> {
  return sanityClient.fetch(
    `*[_type == "product" && isNew == true] | order(_createdAt desc)[0...8] { ${PRODUCT_FIELDS} }`
  )
}

export async function getComingSoon(): Promise<Product[]> {
  return sanityClient.fetch(
    `*[_type == "product" && isComingSoon == true] | order(order asc)[0...4] { ${PRODUCT_FIELDS} }`
  )
}

export async function getAllComingSoon(): Promise<Product[]> {
  return sanityClient.fetch(
    `*[_type == "product" && isComingSoon == true] | order(order asc) { ${PRODUCT_FIELDS} }`
  )
}

/**
 * The facts checkout is allowed to trust: real price, name and availability straight
 * from Sanity. Bypasses the CDN so a price, "coming soon", or stock change the owner just made
 * is what customers are charged / blocked on. Now also carries `stock`, so checkout.ts can check
 * the specific size/colour the customer chose against real remaining units.
 */
export async function getCheckoutProducts(ids: string[]): Promise<CheckoutProduct[]> {
  if (!ids.length) return []
  return sanityClient
    .withConfig({ useCdn: false })
    .fetch(
      `*[_type == "product" && _id in $ids]{
        _id, name, price, sizes, colors, stock,
        "isSoldOut": isSoldOut == true
          || (inStock == false && isComingSoon != true)
          || (count(stock) > 0 && isComingSoon != true && math::sum(stock[].quantity) <= 0),
        isComingSoon
      }`,
      { ids }
    )
}

/** Just what the sitemap needs — slug, category and when it last changed */
export async function getSitemapProducts(): Promise<{ slug: string; category?: string; isNew?: boolean; isComingSoon?: boolean; _updatedAt: string }[]> {
  return sanityClient.fetch(
    `*[_type == "product" && defined(slug.current)]{ "slug": slug.current, category, isNew, isComingSoon, _updatedAt }`
  )
}
