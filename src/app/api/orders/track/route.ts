// src/app/api/orders/track/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { sanityWriteClient } from '../../../../../sanity/lib/client'
import { clientIp, rateLimit } from '@/lib/rateLimit'

export async function POST(req: NextRequest): Promise<Response> {
  // This is a public lookup, so slow down anyone hammering it with guesses
  const ip = clientIp(req)
  if (ip) {
    const limit = rateLimit(`track:${ip}`, 10, 60_000)
    if (!limit.ok) {
      return NextResponse.json(
        { error: 'Too many attempts. Please wait a minute and try again.' },
        { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } }
      )
    }
  }

  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
  const reference = typeof body?.reference === 'string' ? body.reference.trim() : ''
  const email = typeof body?.email === 'string' ? body.email.trim() : ''

  if (!reference || !email) {
    return NextResponse.json({ error: 'Reference and email are required' }, { status: 400 })
  }

  try {
    // Match on BOTH reference and email — this is a public endpoint, so we
    // never return an order to someone who only guesses the reference.
    const order = await sanityWriteClient.fetch(
      `*[_type == "order" && reference == $ref && lower(email) == lower($email)][0]{
        reference, status, total, createdAt,
        firstName, lastName, address, city, state,
        items[]{ productName, size, color, quantity, price }
      }`,
      { ref: reference, email }
    )

    if (!order) {
      return NextResponse.json({ error: 'No matching order found. Double-check your reference and email.' }, { status: 404 })
    }

    return NextResponse.json({ order })
  } catch {
    return NextResponse.json({ error: 'Something went wrong looking up your order.' }, { status: 500 })
  }
}
