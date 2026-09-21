// src/app/products/[slug]/layout.tsx
// The product page itself is a client component (it can't export metadata), so the title,
// description and preview image live here. This is what shows when a product link is shared
// on WhatsApp / Instagram / Google — before, every product link looked like the homepage.
import type { Metadata } from 'next'
import { getProductBySlug } from '@/lib/queries'
import { urlFor } from '../../../../sanity/lib/image'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  try {
    const product = await getProductBySlug(slug)
    if (!product) return { title: 'Product not found – SBGFASHION' }

    const title = `${product.name} – SBGFASHION`
    const description = product.description?.trim()
      ? product.description.trim().slice(0, 160)
      : `${product.name} — ₦${product.price.toLocaleString('en-NG')}. Lagos streetwear from SBGFASHION.`
    const image = product.images?.[0] ? urlFor(product.images[0]).width(1200).height(630).fit('crop').url() : undefined

    return {
      title,
      description,
      alternates: { canonical: `/products/${slug}` },
      openGraph: { title, description, type: 'website', url: `/products/${slug}`, ...(image && { images: [{ url: image, width: 1200, height: 630, alt: product.name }] }) },
      twitter: { card: image ? 'summary_large_image' : 'summary', title, description, ...(image && { images: [image] }) },
    }
  } catch {
    return {}
  }
}

export default function ProductLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
