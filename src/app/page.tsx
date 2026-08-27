// src/app/page.tsx
import { getAllProducts, getComingSoon } from '@/lib/queries'
import ProductGrid from '@/components/shop/ProductGrid'
import Image from 'next/image'
import { urlFor } from '../../sanity/lib/image'

export const revalidate = 60

export default async function HomePage() {
  const [products, comingSoon] = await Promise.all([
    getAllProducts(),
    getComingSoon(),
  ])

  return (
    <>
      {/* Hero */}
      <section className="bg-[#0a0a0a] py-16 text-center border-b border-[#2a2a2a] relative overflow-hidden">
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: 'repeating-linear-gradient(45deg, #ff2d2d 0, #ff2d2d 1px, transparent 0, transparent 50%)', backgroundSize: '20px 20px' }}
        />
        <h1 className="font-bebas text-[clamp(60px,12vw,140px)] leading-none tracking-[10px] text-white relative">
          SBG<span className="text-[#ff2d2d]">live</span>
        </h1>
        <p className="text-[#888] text-xs tracking-[6px] mt-2">LAGOS • ALL PRODUCTS</p>
      </section>

      {/* Coming Soon strip */}
      {comingSoon.length > 0 && (
        <section className="bg-[#111] border-b border-[#2a2a2a] px-4 py-6">
          <p className="font-bebas text-xs tracking-[6px] text-[#888] mb-4">COMING SOON</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {comingSoon.map(p => {
              const img = p.images?.[0] ? urlFor(p.images[0]).width(400).url() : null
              return (
                <div key={p._id} className="border border-[#2a2a2a] p-3 text-center">
                  <div className="aspect-square bg-[#1a1a1a] relative mb-3">
                    {img && <Image src={img} alt={p.name} fill className="object-cover opacity-60" />}
                  </div>
                  <p className="font-bebas text-sm tracking-[2px] mb-2">{p.name}</p>
                  <button className="w-full border border-[#2a2a2a] hover:border-[#c8a96e] hover:text-[#c8a96e] text-[#888] py-1.5 text-xs tracking-[2px] transition-colors font-bebas">
                    NOTIFY ME
                  </button>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* Section label */}
      <div className="flex items-center gap-4 px-4 py-6">
        <h2 className="font-bebas text-xl tracking-[6px] text-white">ALL PRODUCTS</h2>
        <div className="flex-1 h-px bg-[#2a2a2a]" />
      </div>

      {/* Product grid */}
      <ProductGrid products={products} />
    </>
  )
}
