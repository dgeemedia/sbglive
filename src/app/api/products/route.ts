// src/app/api/products/route.ts
import { NextResponse } from 'next/server'
import { getAllProducts } from '@/lib/queries'

export async function GET() {
  try {
    const products = await getAllProducts()
    return NextResponse.json(products)
  } catch {
    return NextResponse.json({ error: 'Could not load products' }, { status: 500 })
  }
}
