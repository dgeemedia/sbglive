// src/lib/productLoader.ts
import { cache } from 'react'
import { getProductBySlug } from '@/lib/queries'

/**
 * One Sanity query per request, shared by the product page, its layout and generateMetadata.
 * `failed` matters: "no such product" must become a real 404, but a momentary Sanity error must NOT —
 * telling Google a live product doesn't exist could get its page dropped from search.
 */
export const loadProduct = cache(async (slug: string) => {
  try {
    return { product: await getProductBySlug(slug), failed: false }
  } catch {
    return { product: null, failed: true }
  }
})
