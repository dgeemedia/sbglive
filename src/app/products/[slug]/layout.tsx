// src/app/products/[slug]/layout.tsx
// The product page itself is a client component (it can't export metadata or render server-side
// structured data), so the title, description, preview image and Product/Breadcrumb JSON-LD live here.
// This is what Google reads, and what shows when a product link is shared on WhatsApp / Instagram.
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import JsonLd from '@/components/seo/JsonLd'
import { loadProduct } from '@/lib/productLoader'
import { CATEGORY_SEO, breadcrumbJsonLd, pageMeta, productJsonLd, truncate } from '@/lib/seo'
import { urlFor } from '../../../../sanity/lib/image'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const { product, failed } = await loadProduct(slug)
  if (!product) return failed ? {} : { title: 'Product not found', robots: { index: false, follow: false } }

  const description = truncate(product.description) || `${product.name} — ₦${product.price.toLocaleString('en-NG')}. Lagos streetwear from SBGFASHION.`
  const first = product.images?.[0]
  const categorySeo = CATEGORY_SEO[product.category]
  // Product name + its category's search terms (e.g. "t-shirts Lagos") so the page ranks for both
  // the specific item and the broader fashion/clothing searches it belongs to.
  const keywords = [product.name, ...(categorySeo ? [categorySeo.name, ...categorySeo.keywords] : [])]
  // No photo yet? Fall back to the default share image rather than sending no preview at all
  return pageMeta({
    title: product.name,
    description,
    path: `/products/${slug}`,
    keywords,
    ...(first && { image: { url: urlFor(first).width(1200).height(630).fit('crop').url(), width: 1200, height: 630, alt: first.alt || product.name } }),
  })
}

export default async function ProductLayout({ children, params }: { children: React.ReactNode; params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const { product, failed } = await loadProduct(slug)
  // A URL with no product behind it answers 404 (not a 200 "not found" page, which Google treats as a soft 404)
  if (!product && !failed) notFound()
  return (
    <>
      {product && (
        <JsonLd
          data={[
            productJsonLd(product),
            breadcrumbJsonLd([
              { name: 'Home', path: '/' },
              ...(CATEGORY_SEO[product.category] ? [{ name: CATEGORY_SEO[product.category].name, path: `/category/${product.category}` }] : []),
              { name: product.name, path: `/products/${slug}` },
            ]),
          ]}
        />
      )}
      {children}
    </>
  )
}
