// src/app/api/checkout/verify/route.ts
// Called from the order-success page right after Flutterwave redirects the
// customer back. Confirms the transaction actually succeeded before we show
// a "confirmed" state — the webhook (api/webhook/route.ts) remains the
// source of truth for actually recording the paid order.
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest): Promise<Response> {
  const { searchParams } = new URL(req.url)
  const transactionId = searchParams.get('transaction_id')
  const txRef = searchParams.get('tx_ref')

  if (!transactionId) {
    return NextResponse.json({ status: 'failed', error: 'Missing transaction_id' }, { status: 400 })
  }

  try {
    const response = await fetch(
      `https://api.flutterwave.com/v3/transactions/${transactionId}/verify`,
      { headers: { Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}` } }
    )
    const data = await response.json()

    const isSuccessful =
      data.status === 'success' &&
      data.data?.status === 'successful' &&
      data.data?.currency === 'NGN' &&
      (!txRef || data.data?.tx_ref === txRef)

    return NextResponse.json({
      status: isSuccessful ? 'successful' : 'failed',
      reference: data.data?.tx_ref || txRef,
      amount: data.data?.amount,
    })
  } catch (err: any) {
    return NextResponse.json({ status: 'failed', error: err.message }, { status: 500 })
  }
}
