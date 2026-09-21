// src/app/api/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { sanityWriteClient } from '../../../../sanity/lib/client'
import { buildOrderEmail } from '@/lib/orderEmail'

const received = () => NextResponse.json({ received: true })

// Constant-time comparison so the secret can't be guessed byte by byte from response timing
function sameSecret(a: string, b: string): boolean {
  const x = Buffer.from(a)
  const y = Buffer.from(b)
  return x.length === y.length && crypto.timingSafeEqual(x, y)
}

export async function POST(req: NextRequest): Promise<Response> {
  const rawBody = await req.text()

  // Flutterwave signs webhooks with a static secret hash you set yourself
  // in the dashboard (Settings → Webhooks), sent back verbatim — not an HMAC.
  const secretHash = process.env.FLUTTERWAVE_SECRET_HASH
  const signature = req.headers.get('verif-hash')
  if (!secretHash || !signature || !sameSecret(signature, secretHash)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  let event: any
  try {
    event = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  if (event?.event !== 'charge.completed' || event?.data?.status !== 'successful') {
    return received()
  }

  const { id, tx_ref, customer } = event.data
  if (!id || typeof tx_ref !== 'string' || !tx_ref) return received()

  try {
    // Never trust the webhook payload alone for money — re-verify the
    // transaction directly against Flutterwave, and check it is the same payment.
    const verifyRes = await fetch(
      `https://api.flutterwave.com/v3/transactions/${encodeURIComponent(String(id))}/verify`,
      { headers: { Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}` } }
    )
    const verified = await verifyRes.json()
    const v = verified?.data
    if (
      verified?.status !== 'success' ||
      v?.status !== 'successful' ||
      v?.tx_ref !== tx_ref ||
      v?.currency !== 'NGN'
    ) {
      return NextResponse.json({ error: 'Verification failed' }, { status: 400 })
    }
    const paidAmount = Number(v.amount)

    // The order was saved as "pending" when checkout started (see api/checkout/route.ts)
    const orderId = `order-${tx_ref}`
    let order: any = await sanityWriteClient.getDocument(orderId)

    if (!order) {
      // Not found: a payment that began before this version was deployed. Those carried the
      // cart inside Flutterwave's `meta`, so use that if it's there — and if it isn't, still record
      // the payment (never lose a paid order) with a note telling the owner to look it up.
      const meta = v.meta ?? event.data.meta ?? {}
      const metaItems = Array.isArray(meta.items) ? meta.items : []
      order = await sanityWriteClient.createIfNotExists({
        _id: orderId,
        _type: 'order',
        reference: tx_ref,
        email: customer?.email || '',
        phone: customer?.phone_number || meta.phone || '',
        firstName: meta.firstName || '',
        lastName: meta.lastName || '',
        address: meta.address || '',
        city: meta.city || '',
        state: meta.state || '',
        status: 'pending',
        total: paidAmount,
        items: metaItems.map((item: any, i: number) => ({ _key: `line${i}`, ...item })),
        createdAt: new Date().toISOString(),
        ...(metaItems.length === 0 && {
          notes: `ITEMS NOT RECORDED — find transaction ${id} (${tx_ref}) in the Flutterwave dashboard to see what was ordered.`,
        }),
      })
    }

    // Already processed (Flutterwave retries webhooks) — do nothing, and never email twice
    if (order.status !== 'pending') return received()

    // Paid less than the order total? Don't mark it paid — flag it for the owner instead.
    if (paidAmount + 0.01 < Number(order.total)) {
      console.error(`Underpayment on ${tx_ref}: paid ${paidAmount}, expected ${order.total}`)
      await sanityWriteClient
        .patch(orderId)
        .set({ notes: `UNDERPAID — received ₦${paidAmount}, expected ₦${order.total}. Transaction ${id}. Not marked paid.` })
        .commit()
      return received()
    }

    // ifRevisionId makes this atomic: if two retries race, only one gets to mark it paid (and email)
    try {
      await sanityWriteClient
        .patch(orderId)
        .ifRevisionId(order._rev)
        .set({ status: 'paid', transactionId: String(id), paidAt: new Date().toISOString() })
        .commit()
    } catch (err: any) {
      if (err?.statusCode === 409) return received() // the other request won
      throw err
    }

    // The order is safely recorded. An email problem must not fail the webhook (Flutterwave
    // would retry, find the order already paid, and the email would never go out anyway).
    const to = order.email || customer?.email
    if (to && process.env.RESEND_API_KEY) {
      try {
        const { Resend } = await import('resend')
        const resend = new Resend(process.env.RESEND_API_KEY)
        await resend.emails.send({
          from: process.env.EMAIL_FROM || 'orders@sbgfashion.live',
          to,
          subject: `Order Confirmed – ${tx_ref}`,
          html: buildOrderEmail({
            name: order.firstName || 'Customer',
            reference: tx_ref,
            items: order.items || [],
            total: Number(order.total),
          }),
        })
      } catch (err) {
        console.error(`Order ${tx_ref} saved as paid, but the confirmation email failed:`, err)
      }
    }

    return received()
  } catch (err) {
    console.error('Webhook error:', err)
    // 500 so Flutterwave retries — safe, because processing is idempotent
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
