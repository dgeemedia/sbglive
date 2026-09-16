// src/app/api/orders/track/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { sanityWriteClient } from '../../../../../sanity/lib/client'

export async function POST(req: NextRequest): Promise<Response> {
  const { reference, email } = await req.json()

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
      { ref: reference.trim(), email: email.trim() }
    )

    if (!order) {
      return NextResponse.json({ error: 'No matching order found. Double-check your reference and email.' }, { status: 404 })
    }

    return NextResponse.json({ order })
  } catch (err: any) {
    return NextResponse.json({ error: 'Something went wrong looking up your order.' }, { status: 500 })
  }
}
