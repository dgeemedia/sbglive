// src/app/api/checkout/route.ts
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(req: NextRequest): Promise<Response> {
  const body = await req.json()
  const { email, amount, metadata, callback_url } = body

  if (!email || !amount) {
    return NextResponse.json({ error: 'Email and amount are required' }, { status: 400 })
  }

  // Unique transaction reference Flutterwave requires per payment attempt
  const tx_ref = `sbg_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`

  const customerName = [metadata?.firstName, metadata?.lastName].filter(Boolean).join(' ') || 'Customer'

  const payload = {
    tx_ref,
    amount,
    currency: 'NGN',
    redirect_url: callback_url || `${process.env.NEXT_PUBLIC_BASE_URL}/order-success`,
    customer: {
      email,
      phonenumber: metadata?.phone || '',
      name: customerName,
    },
    customizations: {
      title: 'SBGFASHION',
      description: 'Order payment',
      logo: `${process.env.NEXT_PUBLIC_BASE_URL}/logo.png`,
    },
    meta: {
      ...metadata,
    },
  }

  try {
    const response = await fetch('https://api.flutterwave.com/v3/payments', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    const data = await response.json()

    if (data.status === 'success') {
      return NextResponse.json({
        authorization_url: data.data.link,
        reference: tx_ref,
      })
    } else {
      return NextResponse.json({ error: data.message || 'Payment initialization failed' }, { status: 400 })
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
