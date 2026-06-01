'use client'
import { useEffect, Suspense } from 'react'
import { useCart } from '@/hooks/useCart'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

function Content() {
  const { clearCart } = useCart()
  const params = useSearchParams()
  const reference = params.get('reference')
  useEffect(() => { clearCart() }, [clearCart])
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-6">✅</div>
        <h1 className="font-bebas text-5xl tracking-[6px] text-white mb-2">ORDER CONFIRMED</h1>
        <p className="text-[#888] text-sm tracking-[2px] mb-2">PAYMENT SUCCESSFUL</p>
        {reference && <p className="text-[#555] text-xs tracking-[2px] mb-8">REF: <span className="text-[#c8a96e]">{reference}</span></p>}
        <p className="text-[#888] text-sm leading-relaxed mb-8">Check your email for order confirmation. We will reach out with delivery updates.</p>
        <Link href="/" className="inline-block bg-[#ff2d2d] hover:bg-red-700 text-white px-8 py-3 font-bebas text-lg tracking-[4px] transition-colors">
          CONTINUE SHOPPING
        </Link>
      </div>
    </div>
  )
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-bebas text-2xl tracking-[4px] text-[#888]">LOADING...</div>}>
      <Content />
    </Suspense>
  )
}
