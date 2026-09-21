// src/app/faq/layout.tsx
// This page is a client component, which can't set its own title — so its metadata lives here.
import type { Metadata } from 'next'
import { pageMeta } from '@/lib/seo'

export const metadata: Metadata = pageMeta({
  title: 'FAQ',
  description: 'Answers to common questions about delivery, payment, returns, sizing and tracking your order at SBGFASHION.',
  path: '/faq',
})

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
