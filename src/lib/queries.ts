// src/lib/queries.ts
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
  // "Sold out" if the owner ticked Sold Out, OR unticked In Stock. A Coming Soon product is never
  // "sold out" though — owners untick In Stock for those because there's no stock yet.
  "isSoldOut": isSoldOut == true || (inStock == false && isComingSoon != true),
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
 * from Sanity. Bypasses the CDN so a price or "coming soon" change the owner just made
 * is what customers are charged / blocked on.
 */
export async function getCheckoutProducts(ids: string[]): Promise<CheckoutProduct[]> {
  if (!ids.length) return []
  return sanityClient
    .withConfig({ useCdn: false })
    .fetch(`*[_type == "product" && _id in $ids]{ _id, name, price, sizes, colors, "isSoldOut": isSoldOut == true || (inStock == false && isComingSoon != true), isComingSoon }`, { ids })
}
