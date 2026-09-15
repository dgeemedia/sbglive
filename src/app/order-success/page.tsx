// src/app/order-success/page.tsx
'use client'
import { useEffect, useState, Suspense } from 'react'
import { motion } from 'framer-motion'
import { useCart } from '@/hooks/useCart'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

type VerifyState = 'checking' | 'successful' | 'failed'

function Content() {
  const { clearCart } = useCart()
  const params = useSearchParams()
  const status = params.get('status') // flutterwave: successful | cancelled | failed
  const txRef = params.get('tx_ref')
  const transactionId = params.get('transaction_id')
  const [state, setState] = useState<VerifyState>('checking')

  useEffect(() => {
    if (status === 'cancelled' || !transactionId) {
      setState('failed')
      return
    }
    fetch(`/api/checkout/verify?transaction_id=${transactionId}&tx_ref=${txRef || ''}`)
      .then(r => r.json())
      .then(data => {
        if (data.status === 'successful') {
          clearCart()
          setState('successful')
        } else {
          setState('failed')
        }
      })
      .catch(() => setState('failed'))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactionId, status])

  if (state === 'checking') {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center px-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          className="w-10 h-10 border-2 border-[#2a2a2a] border-t-[#ff2d2d] rounded-full mb-4"
        />
        <p className="text-[#888] text-xs tracking-[3px] font-bebas">CONFIRMING PAYMENT...</p>
      </div>
    )
  }

  if (state === 'failed') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <div className="text-6xl mb-6">⚠️</div>
          <h1 className="font-bebas text-4xl tracking-[6px] text-white mb-2">PAYMENT NOT COMPLETED</h1>
          <p className="text-[#888] text-sm tracking-[2px] mb-8">
            {status === 'cancelled' ? 'YOU CANCELLED THE PAYMENT' : 'WE COULD NOT CONFIRM THIS PAYMENT'}
          </p>
          <Link href="/checkout" className="inline-block bg-[#ff2d2d] hover:bg-red-700 text-white px-8 py-3 font-bebas text-lg tracking-[4px] transition-colors">
            TRY AGAIN
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-md"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.1 }}
          className="text-6xl mb-6"
        >
          ✅
        </motion.div>
        <h1 className="font-bebas text-5xl tracking-[6px] text-white mb-2">ORDER CONFIRMED</h1>
        <p className="text-[#888] text-sm tracking-[2px] mb-2">PAYMENT SUCCESSFUL</p>
        {txRef && <p className="text-[#555] text-xs tracking-[2px] mb-8">REF: <span className="text-[#c8a96e]">{txRef}</span></p>}
        <p className="text-[#888] text-sm leading-relaxed mb-8">Check your email for order confirmation. We will reach out with delivery updates.</p>
        <Link href="/" className="inline-block bg-[#ff2d2d] hover:bg-red-700 text-white px-8 py-3 font-bebas text-lg tracking-[4px] transition-colors">
          CONTINUE SHOPPING
        </Link>
      </motion.div>
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
