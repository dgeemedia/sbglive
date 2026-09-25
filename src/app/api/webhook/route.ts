// src/app/api/webhook/route.ts
//
// CHANGE: added decrementStockForOrder(), called once right after an order is confirmed paid.
// For every line item, it finds the matching size/colour stock line on that product (see
// product.ts's new `stock` array) and subtracts the quantity sold, adding it to that line's
// running `sold` count. Products that don't use the stock array are left untouched — this is
// additive, not a requirement.
//
// This only runs inside the branch that already guards against double-processing (the order must
// have just transitioned pending -> paid via the ifRevisionId-guarded patch below), so a webhook
// retry can never decrement stock twice for the same order.
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

// A Flutterwave account has ONE webhook URL, so if another app shares the account, its payment
// events arrive here too. This store only acts on payments it started (references beginning
// "sbg_", see api/checkout/route.ts). Anything else is not ours: if WEBHOOK_FORWARD_URL is set we
// pass it on untouched (same body, same verif-hash) so the other app still receives its events;
// otherwise we just acknowledge it.
const OUR_PREFIX = 'sbg_'

async function passOn(rawBody: string, signature: string, alreadyForwarded: boolean): Promise<Response> {
  const url = process.env.WEBHOOK_FORWARD_URL?.trim()
  if (!url || alreadyForwarded) return received() // nowhere to send it (or it already came from a forward: never loop)
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'verif-hash': signature, 'x-sbg-forwarded': '1' },
      body: rawBody,
      signal: AbortSignal.timeout(20_000),
    })
    if (res.ok) return received()
    console.error(`Forwarding webhook to the other app failed: HTTP ${res.status}`)
  } catch (err) {
    console.error('Forwarding webhook to the other app failed:', err)
  }
  // 502 so Flutterwave retries it later — the other app must not lose its payment notification
  return NextResponse.json({ error: 'Could not forward webhook' }, { status: 502 })
}

const norm = (v: string | null | undefined, placeholder: string) => {
  const t = (v ?? '').trim()
  return t ? t.toLowerCase() : placeholder.toLowerCase()
}

/**
 * Subtract each paid line item's quantity from the matching size/colour stock line on its
 * product, and add it to that line's `sold` count. Silently skips products that aren't using
 * the `stock` array (see product.ts) and skips/logs a line that has no matching size/colour —
 * inventory bookkeeping must never fail the webhook or block the order/email.
 */
async function decrementStockForOrder(
  items: { productId?: string; size?: string; color?: string; quantity?: number }[]
): Promise<void> {
  const byProduct = new Map<string, typeof items>()
  for (const item of items) {
    if (!item.productId || !item.quantity) continue
    byProduct.set(item.productId, [...(byProduct.get(item.productId) ?? []), item])
  }

  for (const [productId, productItems] of byProduct) {
    try {
      const product: any = await sanityWriteClient.getDocument(productId)
      const stock: any[] = Array.isArray(product?.stock) ? product.stock : []
      if (stock.length === 0) continue // this product isn't using per-variant stock tracking

      const patch: Record<string, number> = {}
      for (const item of productItems) {
        const wantSize = norm(item.size, 'ONE SIZE')
        const wantColor = norm(item.color, 'DEFAULT')
        const line = stock.find((s) => norm(s.size, 'ONE SIZE') === wantSize && norm(s.color, 'DEFAULT') === wantColor)
        if (!line?._key) {
          console.error(
            `Order paid for a stock-tracked product but no matching size/colour line found: ` +
            `product ${productId}, size "${item.size}", colour "${item.color}". Stock not adjusted for this line.`
          )
          continue
        }
        const qty = item.quantity ?? 0
        patch[`stock[_key=="${line._key}"].quantity`] = Math.max(0, (line.quantity ?? 0) - qty)
        patch[`stock[_key=="${line._key}"].sold`] = (line.sold ?? 0) + qty
      }

      if (Object.keys(patch).length > 0) {
        await sanityWriteClient.patch(productId).set(patch).commit()
      }
    } catch (err) {
      // Never fail the webhook over inventory bookkeeping — the payment/order record must still succeed.
      console.error(`Could not update stock for product ${productId}:`, err)
    }
  }
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

  const ourPayment = typeof event?.data?.tx_ref === 'string' && event.data.tx_ref.startsWith(OUR_PREFIX)
  if (!ourPayment) return passOn(rawBody, signature, req.headers.get('x-sbg-forwarded') === '1')

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

    // We just (and only just) flipped this order to paid — safe to decrement stock exactly once.
    // Inventory bookkeeping must never take down the webhook, so this is a hard try/catch.
    try {
      await decrementStockForOrder(order.items || [])
    } catch (err) {
      console.error(`Order ${tx_ref} marked paid, but stock update failed:`, err)
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
