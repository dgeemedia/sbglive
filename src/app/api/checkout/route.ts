// src/app/api/checkout/route.ts
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { getCheckoutProducts } from '@/lib/queries'
import { parseCartLines, priceCart } from '@/lib/checkout'

const clean = (v: unknown, max = 200) => (typeof v === 'string' ? v.trim().slice(0, max) : '')

export async function POST(req: NextRequest): Promise<Response> {
  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
  const { email, amount, metadata, callback_url } = body ?? {}

  if (!email || !amount) {
    return NextResponse.json({ error: 'Email and amount are required' }, { status: 400 })
  }

  // The browser only tells us WHAT is in the cart. Prices, names and availability come
  // from Sanity, and the amount we charge is computed here — never taken from the browser.
  const parsed = parseCartLines(metadata?.items)
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: parsed.status })
  }

  let products
  try {
    products = await getCheckoutProducts([...new Set(parsed.lines.map(l => l.productId))])
  } catch {
    return NextResponse.json({ error: "We couldn't verify your cart right now. Please try again." }, { status: 503 })
  }

  const priced = priceCart(parsed.lines, products, amount)
  if (!priced.ok) {
    return NextResponse.json(
      { error: priced.error, ...(priced.code && { code: priced.code }), ...(priced.latest && { latest: priced.latest }) },
      { status: priced.status }
    )
  }

  // Customer details: only known fields, as plain trimmed strings
  const firstName = clean(metadata?.firstName)
  const lastName = clean(metadata?.lastName)
  const phone = clean(metadata?.phone, 40)
  const address = clean(metadata?.address)
  const city = clean(metadata?.city)
  const state = clean(metadata?.state)

  // Unique transaction reference Flutterwave requires per payment attempt
  const tx_ref = `sbg_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`

  const customerName = [firstName, lastName].filter(Boolean).join(' ') || 'Customer'

  const payload = {
    tx_ref,
    amount: priced.total, // computed from Sanity prices above
    currency: 'NGN',
    redirect_url: callback_url || `${process.env.NEXT_PUBLIC_BASE_URL}/order-success`,
    customer: {
      email,
      phonenumber: phone,
      name: customerName,
    },
    customizations: {
      title: 'SBGFASHION',
      description: 'Order payment',
      logo: `${process.env.NEXT_PUBLIC_BASE_URL}/logo.png`,
    },
    // The webhook saves the order (and emails the customer) from this meta, so `items`
    // is the server-built list with real Sanity names and prices.
    meta: {
      firstName,
      lastName,
      phone,
      address,
      city,
      state,
      items: priced.items,
      custom_fields: [
        { display_name: 'Customer Name', variable_name: 'customer_name', value: customerName },
        { display_name: 'Phone', variable_name: 'phone', value: phone },
        { display_name: 'Delivery', variable_name: 'address', value: `${address}, ${city}, ${state}` },
      ],
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
