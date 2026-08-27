// src/app/api/products/route.ts
import { NextResponse } from 'next/server'
import { getAllProducts } from '@/lib/queries'

export async function GET() {
  const products = await getAllProducts()
  return NextResponse.json(products)
}
