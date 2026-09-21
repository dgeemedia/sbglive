// src/app/gallery/page.tsx
import type { Metadata } from 'next'
import { pageMeta } from '@/lib/seo'
import Link from 'next/link'
import Image from 'next/image'
import { getAllProducts } from '@/lib/queries'
import { urlFor } from '../../../sanity/lib/image'

export const metadata: Metadata = pageMeta({
  title: 'Gallery',
  description: 'Browse the SBGFASHION gallery — streetwear pieces from Lagos.',
  path: '/gallery',
})

export const revalidate = 60

export default async function GalleryPage() {
  const products = await getAllProducts()
  const photos = products.flatMap(p =>
    (p.images || []).map(img => ({ key: `${p._id}-${img._key}`, img, product: p }))
  )

  return (
    <div>
      <div className="flex items-center gap-4 px-4 py-8">
        <h1 className="font-bebas text-2xl tracking-[6px] text-white">GALLERY</h1>
        <div className="flex-1 h-px bg-[#2a2a2a]" />
      </div>

      {photos.length === 0 ? (
        <p className="text-[#888] text-sm text-center py-20 tracking-[2px]">NO PHOTOS YET</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-[#2a2a2a] pb-16">
          {photos.map(({ key, img, product }) => (
            <Link key={key} href={`/products/${product.slug}`} className="group relative aspect-square bg-[#0a0a0a] overflow-hidden">
              <Image
                src={urlFor(img).width(500).height(500).url()}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width:768px) 50vw, 25vw"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="font-bebas text-xs tracking-[2px] text-white">{product.name}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
