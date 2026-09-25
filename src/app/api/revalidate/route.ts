// src/app/api/revalidate/route.ts
//
// Sanity calls this the moment an editor hits Publish. It verifies the request really came
// from Sanity (using the shared secret you'll set on the webhook), then busts the relevant
// cached page(s) immediately — instead of waiting for the 60s `revalidate` window on the pages
// themselves.
//
// Setup:
// 1. npm install @sanity/webhook
// 2. Add to .env.local (and your Vercel project env vars): SANITY_REVALIDATE_SECRET=<random string>
// 3. In Sanity: sanity.io/manage → your project → API → Webhooks → Create webhook
//      URL:      https://sbgfashion.live/api/revalidate
//      Dataset:  production
//      Trigger:  Create, Update, Delete
//      Filter:   _type in ["siteSettings", "product"]     (add more types here if needed)
//      Secret:   the same random string you put in SANITY_REVALIDATE_SECRET
//      Projection: { _type, "slug": slug.current, category }
import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { isValidSignature, SIGNATURE_HEADER_NAME } from '@sanity/webhook'

export async function POST(req: NextRequest) {
  const body = await req.text() // must read as raw text — signature is computed over the exact bytes
  const signature = req.headers.get(SIGNATURE_HEADER_NAME)
  const secret = process.env.SANITY_REVALIDATE_SECRET

  if (!secret) {
    return NextResponse.json({ message: 'SANITY_REVALIDATE_SECRET is not set' }, { status: 500 })
  }
  if (!signature || !isValidSignature(body, signature, secret)) {
    return NextResponse.json({ message: 'Invalid signature' }, { status: 401 })
  }

  const payload = JSON.parse(body) as { _type?: string; slug?: string; category?: string }

  // siteSettings (intro video, hero, contact info, etc.) is read by the root layout, which every
  // page shares — so bust the whole site, not just one path.
  if (payload._type === 'siteSettings') {
    revalidatePath('/', 'layout')
  } else if (payload._type === 'product') {
    revalidatePath('/') // homepage may list it
    if (payload.slug) revalidatePath(`/products/${payload.slug}`)
    if (payload.category) revalidatePath(`/category/${payload.category}`)
    revalidatePath('/gallery')
  } else {
    revalidatePath('/')
  }

  return NextResponse.json({ revalidated: true, now: Date.now() })
}