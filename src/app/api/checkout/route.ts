// src/app/api/checkout/route.ts
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { getCheckoutProducts } from '@/lib/queries'
import { parseCartLines, priceCart } from '@/lib/checkout'
import { clientIp, rateLimit } from '@/lib/rateLimit'
import { sanityWriteClient } from '../../../../sanity/lib/client'

const clean = (v: unknown, max = 200) => (typeof v === 'string' ? v.trim().slice(0, max) : '')
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const unavailable = () =>
  NextResponse.json({ error: 'Payments are temporarily unavailable. Please try again later.' }, { status: 503 })

export async function POST(req: NextRequest): Promise<Response> {
  // Where the money goes. Flutterwave only pays out to the client's bank account when the
  // payment names their subaccount (RS_…). If it's missing, EVERY payment would settle to
  // the main Flutterwave account instead — so we refuse to create a payment at all rather
  // than silently send a customer's money to the wrong place.
  const subaccountId = process.env.FLUTTERWAVE_SUBACCOUNT_ID?.trim()
  if (!subaccountId || !subaccountId.startsWith('RS_')) {
    console.error('FLUTTERWAVE_SUBACCOUNT_ID is missing or not an RS_… subaccount id — refusing to create a payment')
    return unavailable()
  }

  // Customers are sent back here after paying, so it must be our own site (never the browser's say-so)
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL?.trim().replace(/\/+$/, '')
  if (!baseUrl) {
    console.error('NEXT_PUBLIC_BASE_URL is not set — refusing to create a payment')
    return unavailable()
  }

  // Every call creates a payment link and an order record, so cap how fast one visitor can do it
  const ip = clientIp(req)
  if (ip) {
    const limit = rateLimit(`checkout:${ip}`, 12, 60_000)
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
  const { amount, metadata } = body ?? {}
  const email = clean(body?.email, 254).toLowerCase()

  if (!email || !amount) {
    return NextResponse.json({ error: 'Email and amount are required' }, { status: 400 })
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 })
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
  if (!firstName || !phone || !address || !city || !state) {
    return NextResponse.json({ error: 'Please fill in your name, phone number and full delivery address.' }, { status: 400 })
  }

  // Unique transaction reference Flutterwave requires per payment attempt
  const tx_ref = `sbg_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`
  const orderId = `order-${tx_ref}`
  const customerName = [firstName, lastName].filter(Boolean).join(' ') || 'Customer'

  // Save the order BEFORE sending the customer to pay, as "pending". The webhook then only has to
  // flip it to "paid" — it never depends on Flutterwave handing our cart data back, so a paid
  // order can't end up with missing items or address. If we can't save it, we don't take payment.
  try {
    await sanityWriteClient.createIfNotExists({
      _id: orderId,
      _type: 'order',
      reference: tx_ref,
      email,
      phone,
      firstName,
      lastName,
      address,
      city,
      state,
      status: 'pending',
      total: priced.total,
      items: priced.items.map((item, i) => ({ _key: `line${i}`, ...item })),
      createdAt: new Date().toISOString(),
    })
  } catch (err) {
    console.error('Could not save pending order:', err)
    return unavailable()
  }

  // Undo the pending order if we never got as far as a payment link (so Studio isn't cluttered)
  const discardPendingOrder = () => sanityWriteClient.delete(orderId).catch(() => {})

  const payload = {
    tx_ref,
    amount: priced.total, // computed from Sanity prices above
    currency: 'NGN',
    redirect_url: `${baseUrl}/order-success`,
    // Split this payment to the client's subaccount. No split_type/split_value here, so the
    // subaccount's own default split (set in the Flutterwave dashboard) is what applies.
    subaccounts: [{ id: subaccountId }],
    customer: {
      email,
      phonenumber: phone,
      name: customerName,
    },
    customizations: {
      title: 'SBGFASHION',
      description: 'Order payment',
      logo: `${baseUrl}/logo.png`,
    },
    // Flat text only, so it shows on the Flutterwave dashboard for reference.
    // The order itself lives in Sanity (saved above), keyed by tx_ref.
    meta: { firstName, lastName, phone, address, city, state },
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

    if (data.status === 'success' && data.data?.link) {
      return NextResponse.json({
        authorization_url: data.data.link,
        reference: tx_ref,
      })
    }

    // Full detail goes to the server log (handy when setting up keys / subaccounts);
    // the customer just gets a plain message.
    console.error('Flutterwave rejected the payment request:', data)
    await discardPendingOrder()
    return NextResponse.json({ error: 'We could not start your payment. Please try again.' }, { status: 502 })
  } catch (err) {
    console.error('Flutterwave request failed:', err)
    await discardPendingOrder()
    return NextResponse.json({ error: 'We could not reach the payment provider. Please try again.' }, { status: 502 })
  }
}
