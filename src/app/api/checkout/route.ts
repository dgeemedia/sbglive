import { NextRequest, NextResponse } from 'next/server'
import https from 'https'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { email, amount, metadata, callback_url } = body

  if (!email || !amount) {
    return NextResponse.json({ error: 'Email and amount are required' }, { status: 400 })
  }

  const payload = JSON.stringify({
    email,
    amount: Math.round(amount * 100), // Paystack uses kobo (smallest unit)
    currency: 'NGN',
    callback_url: callback_url || `${process.env.NEXT_PUBLIC_BASE_URL}/order-success`,
    metadata: {
      ...metadata,
      cancel_action: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout`,
    },
  })

  return new Promise((resolve) => {
    const options = {
      hostname: 'api.paystack.co',
      port: 443,
      path: '/transaction/initialize',
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
    }

    const paystackReq = https.request(options, (paystackRes) => {
      let data = ''
      paystackRes.on('data', chunk => { data += chunk })
      paystackRes.on('end', () => {
        const parsed = JSON.parse(data)
        if (parsed.status) {
          resolve(NextResponse.json({ authorization_url: parsed.data.authorization_url, reference: parsed.data.reference }))
        } else {
          resolve(NextResponse.json({ error: parsed.message }, { status: 400 }))
        }
      })
    })

    paystackReq.on('error', (e) => {
      resolve(NextResponse.json({ error: e.message }, { status: 500 }))
    })

    paystackReq.write(payload)
    paystackReq.end()
  })
}
