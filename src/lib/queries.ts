import { sanityClient } from '../../sanity/lib/client'
import type { Product } from '@/types'

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
  isSoldOut,
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
    `*[_type == "product" && isComingSoon == true][0...4] { ${PRODUCT_FIELDS} }`
  )
}
