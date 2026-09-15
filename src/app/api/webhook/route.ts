// src/app/api/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { sanityWriteClient } from '../../../../sanity/lib/client'

export async function POST(req: NextRequest): Promise<Response> {
  const rawBody = await req.text()

  // Flutterwave signs webhooks with a static secret hash you set yourself
  // in the dashboard (Settings → Webhooks), sent back verbatim — not an HMAC.
  const signature = req.headers.get('verif-hash')
  if (!signature || signature !== process.env.FLUTTERWAVE_SECRET_HASH) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  const event = JSON.parse(rawBody)

  if (event.event === 'charge.completed' && event.data?.status === 'successful') {
    const { id, tx_ref, customer, amount, meta } = event.data

    try {
      // Never trust the webhook payload alone for money — re-verify the
      // transaction directly against Flutterwave before recording it.
      const verifyRes = await fetch(
        `https://api.flutterwave.com/v3/transactions/${id}/verify`,
        { headers: { Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}` } }
      )
      const verified = await verifyRes.json()
      if (verified.status !== 'success' || verified.data?.status !== 'successful') {
        return NextResponse.json({ error: 'Verification failed' }, { status: 400 })
      }

      // Avoid double-recording the same order if Flutterwave retries the webhook
      const existing = await sanityWriteClient.fetch(
        `*[_type == "order" && reference == $ref][0]{_id}`,
        { ref: tx_ref }
      )
      if (existing) {
        return NextResponse.json({ received: true })
      }

      await sanityWriteClient.create({
        _type: 'order',
        reference: tx_ref,
        email: customer.email,
        phone: customer.phone_number || meta?.phone,
        firstName: meta?.firstName || '',
        lastName: meta?.lastName || '',
        address: meta?.address || '',
        city: meta?.city || '',
        state: meta?.state || '',
        status: 'paid',
        total: amount,
        items: meta?.items || [],
        createdAt: new Date().toISOString(),
      })

      // Send email lazily — only import Resend at runtime
      if (customer.email && process.env.RESEND_API_KEY) {
        const { Resend } = await import('resend')
        const resend = new Resend(process.env.RESEND_API_KEY)
        await resend.emails.send({
          from: process.env.EMAIL_FROM || 'orders@sbgfashion.org',
          to: customer.email,
          subject: `Order Confirmed – ${tx_ref}`,
          html: buildOrderEmail({
            name: meta?.firstName || 'Customer',
            reference: tx_ref,
            items: meta?.items || [],
            total: amount,
          }),
        })
      }

      return NextResponse.json({ received: true })
    } catch (err: any) {
      console.error('Webhook error:', err)
      return NextResponse.json({ error: err.message }, { status: 500 })
    }
  }

  return NextResponse.json({ received: true })
}

function buildOrderEmail({ name, reference, items, total }: {
  name: string
  reference: string
  items: any[]
  total: number
}) {
  const itemRows = items.map((item: any) =>
    `<tr>
      <td style="padding:8px;border-bottom:1px solid #2a2a2a;font-family:sans-serif;font-size:13px;color:#e8e8e8">${item.productName}</td>
      <td style="padding:8px;border-bottom:1px solid #2a2a2a;font-family:sans-serif;font-size:13px;color:#888">${item.size} / ${item.color}</td>
      <td style="padding:8px;border-bottom:1px solid #2a2a2a;font-family:sans-serif;font-size:13px;color:#888">${item.quantity}</td>
      <td style="padding:8px;border-bottom:1px solid #2a2a2a;font-family:sans-serif;font-size:13px;color:#c8a96e">₦${item.price?.toLocaleString()}</td>
    </tr>`
  ).join('')

  return `<!DOCTYPE html>
  <html>
  <body style="background:#0a0a0a;color:#e8e8e8;font-family:sans-serif;margin:0;padding:20px">
    <div style="max-width:560px;margin:0 auto;background:#111;border:1px solid #2a2a2a;padding:32px">
      <h1 style="font-size:28px;letter-spacing:4px;color:#ff2d2d;margin:0 0 4px">SBGFASHION</h1>
      <p style="color:#888;font-size:11px;letter-spacing:3px;margin:0 0 24px">ORDER CONFIRMED</p>
      <p style="color:#e8e8e8;margin-bottom:8px">Hey ${name},</p>
      <p style="color:#888;font-size:14px;line-height:1.6;margin-bottom:24px">Your order is confirmed and payment received. We will get it out to you ASAP.</p>
      <p style="font-size:12px;color:#555;letter-spacing:2px;margin-bottom:8px">REF: <span style="color:#c8a96e">${reference}</span></p>
      <table style="width:100%;border-collapse:collapse;margin-bottom:16px">
        <thead>
          <tr>
            <th style="text-align:left;padding:8px;font-size:11px;letter-spacing:2px;color:#555;border-bottom:1px solid #2a2a2a">ITEM</th>
            <th style="text-align:left;padding:8px;font-size:11px;letter-spacing:2px;color:#555;border-bottom:1px solid #2a2a2a">VARIANT</th>
            <th style="text-align:left;padding:8px;font-size:11px;letter-spacing:2px;color:#555;border-bottom:1px solid #2a2a2a">QTY</th>
            <th style="text-align:left;padding:8px;font-size:11px;letter-spacing:2px;color:#555;border-bottom:1px solid #2a2a2a">PRICE</th>
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
      </table>
      <div style="text-align:right;border-top:1px solid #2a2a2a;padding-top:12px">
        <span style="font-size:20px;color:#fff;letter-spacing:2px">TOTAL: ₦${total?.toLocaleString()}</span>
      </div>
      <p style="color:#555;font-size:12px;margin-top:24px">Questions? Reply to this email or DM us on Instagram.</p>
    </div>
  </body>
  </html>`
}
