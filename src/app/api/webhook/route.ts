import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { sanityWriteClient } from '../../../../sanity/lib/client'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  const rawBody = await req.text()
  const signature = req.headers.get('x-paystack-signature')

  // Verify webhook signature
  const hash = crypto
    .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY!)
    .update(rawBody)
    .digest('hex')

  if (hash !== signature) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  const event = JSON.parse(rawBody)

  if (event.event === 'charge.success') {
    const { reference, metadata, customer, amount } = event.data

    try {
      // Save order to Sanity
      const order = await sanityWriteClient.create({
        _type: 'order',
        reference,
        email: customer.email,
        phone: customer.phone || metadata?.phone,
        firstName: metadata?.firstName || customer.first_name || '',
        lastName: metadata?.lastName || customer.last_name || '',
        address: metadata?.address || '',
        city: metadata?.city || '',
        state: metadata?.state || '',
        status: 'paid',
        total: amount / 100,
        items: metadata?.items || [],
        createdAt: new Date().toISOString(),
      })

      // Send confirmation email
      if (customer.email) {
        await resend.emails.send({
          from: process.env.EMAIL_FROM || 'orders@sbglive.live',
          to: customer.email,
          subject: `Order Confirmed – ${reference}`,
          html: buildOrderEmail({
            name: metadata?.firstName || 'Customer',
            reference,
            items: metadata?.items || [],
            total: amount / 100,
          }),
        })
      }

      return NextResponse.json({ received: true, orderId: order._id })
    } catch (err) {
      console.error('Webhook processing error:', err)
      return NextResponse.json({ error: 'Failed to process order' }, { status: 500 })
    }
  }

  return NextResponse.json({ received: true })
}

function buildOrderEmail({ name, reference, items, total }: {
  name: string; reference: string; items: any[]; total: number
}) {
  const itemRows = items.map((item: any) =>
    `<tr>
      <td style="padding:8px;border-bottom:1px solid #2a2a2a;font-family:sans-serif;font-size:13px;color:#e8e8e8">${item.productName}</td>
      <td style="padding:8px;border-bottom:1px solid #2a2a2a;font-family:sans-serif;font-size:13px;color:#888">${item.size} / ${item.color}</td>
      <td style="padding:8px;border-bottom:1px solid #2a2a2a;font-family:sans-serif;font-size:13px;color:#888">${item.quantity}</td>
      <td style="padding:8px;border-bottom:1px solid #2a2a2a;font-family:sans-serif;font-size:13px;color:#c8a96e">₦${item.price?.toLocaleString()}</td>
    </tr>`
  ).join('')

  return `
  <!DOCTYPE html>
  <html>
  <body style="background:#0a0a0a;color:#e8e8e8;font-family:sans-serif;margin:0;padding:20px">
    <div style="max-width:560px;margin:0 auto;background:#111;border:1px solid #2a2a2a;padding:32px">
      <h1 style="font-family:Georgia,serif;font-size:28px;letter-spacing:4px;color:#ff2d2d;margin:0 0 4px">sbglive</h1>
      <p style="color:#888;font-size:11px;letter-spacing:3px;margin:0 0 24px">ORDER CONFIRMED</p>
      <p style="color:#e8e8e8;margin-bottom:8px">Hey ${name},</p>
      <p style="color:#888;font-size:14px;line-height:1.6;margin-bottom:24px">Your order has been confirmed and payment received. We'll get it out to you ASAP.</p>
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
