// src/components/layout/Navbar.tsx
'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useCart } from '@/hooks/useCart'

const links = [
  { label: 'HOME', href: '/' },
  { label: 'NEW RELEASE', href: '/category/new' },
  { label: 'TOPS', href: '/category/tops' },
  { label: 'BOTTOMS', href: '/category/bottoms' },
  { label: 'ACCESSORIES', href: '/category/accessories' },
  { label: 'PRE-ORDER', href: '/category/pre-order' },
  { label: 'CONTACT', href: '/contact' },
]

export default function Navbar() {
  const { count, openCart } = useCart()
  return (
    <nav className="bg-[#111] border-b border-[#2a2a2a] sticky top-0 z-50">
      <div className="flex items-center justify-between px-6 h-14">
        <Link href="/" className="flex items-center gap-3 font-bebas text-3xl tracking-[4px] text-white">
          {/* Decorative (the words beside it name the brand). Hidden under 400px wide so the
              wordmark and the cart button keep all the room they had before. */}
          <Image src="/logo.png" alt="" width={36} height={36} className="hidden min-[400px]:block w-9 h-9 rounded-full" />
          <span>SBG<span className="text-[#ff2d2d]">FASHION</span></span>
        </Link>
        <div className="flex items-center gap-5">
          <Link href="/search" className="text-[#888] hover:text-white text-xs tracking-[2px] transition-colors">SEARCH</Link>
          <button
            onClick={openCart}
            className="bg-[#ff2d2d] hover:bg-red-700 text-white px-4 py-2 font-bebas text-base tracking-[2px] transition-colors"
          >
            CART ({count()})
          </button>
        </div>
      </div>
      <div className="flex overflow-x-auto border-t border-[#2a2a2a]">
        {links.map(l => (
          <Link
            key={l.label}
            href={l.href}
            className="text-[#888] hover:text-white hover:bg-[#1a1a1a] px-4 py-2.5 text-xs tracking-[2px] whitespace-nowrap border-r border-[#2a2a2a] transition-colors"
          >
            {l.label}
          </Link>
        ))}
      </div>
    </nav>
  )
}
