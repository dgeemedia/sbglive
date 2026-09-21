// src/app/products/[slug]/page.tsx
import ProductView from '@/components/shop/ProductView'
import { loadProduct } from '@/lib/productLoader'
import { getSitemapProducts } from '@/lib/queries'

// Rendered ahead of time and refreshed every minute: fast for shoppers and crawlers, and a price or
// stock change in Sanity shows up within a minute. (Checkout always re-checks the real price anyway.)
export const revalidate = 60

export async function generateStaticParams() {
  const products = await getSitemapProducts()
  return products.map(p => ({ slug: p.slug }))
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const { product } = await loadProduct(slug)
  // key={slug}: moving from one product to another starts the view fresh (no leftover size/photo choice)
  return <ProductView key={slug} slug={slug} initialProduct={product} />
}
