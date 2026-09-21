// src/app/order-success/layout.tsx
// This page is a client component, which can't set its own title — so its metadata lives here.
import type { Metadata } from 'next'
import { pageMeta } from '@/lib/seo'

export const metadata: Metadata = pageMeta({
  title: 'Order Confirmation',
  description: 'Your SBGFASHION order confirmation.',
  path: '/order-success',
  noindex: true,
})

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
