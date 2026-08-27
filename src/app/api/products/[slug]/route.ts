// src/app/api/products/[slug]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getProductBySlug } from '@/lib/queries'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
): Promise<Response> {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(product)
}