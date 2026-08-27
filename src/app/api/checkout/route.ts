// src/app/api/checkout/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest): Promise<Response> {
  const body = await req.json()
  const { email, amount, metadata, callback_url } = body

  if (!email || !amount) {
    return NextResponse.json({ error: 'Email and amount are required' }, { status: 400 })
  }

  const payload = {
    email,
    amount: Math.round(amount * 100),
    currency: 'NGN',
    callback_url: callback_url || `${process.env.NEXT_PUBLIC_BASE_URL}/order-success`,
    metadata: {
      ...metadata,
      cancel_action: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout`,
    },
  }

  try {
    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    const data = await response.json()

    if (data.status) {
      return NextResponse.json({
        authorization_url: data.data.authorization_url,
        reference: data.data.reference,
      })
    } else {
      return NextResponse.json({ error: data.message }, { status: 400 })
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}