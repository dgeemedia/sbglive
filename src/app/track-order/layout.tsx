// src/app/track-order/layout.tsx
// This page is a client component, which can't set its own title — so its metadata lives here.
import type { Metadata } from 'next'
import { pageMeta } from '@/lib/seo'

export const metadata: Metadata = pageMeta({
  title: 'Track Your Order',
  description: 'Check the status of your SBGFASHION order.',
  path: '/track-order',
  noindex: true,
})

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
