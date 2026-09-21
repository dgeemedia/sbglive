// src/app/api/whatsapp/route.ts
// Lets client components (e.g. the product page) get the store's WhatsApp number.
// The number is already public on the site (footer + WhatsApp button).
import { NextResponse } from 'next/server'
import { getSiteSettings } from '@/lib/queries'
import { waDigitsFromSettings } from '@/lib/phone'

export async function GET(): Promise<Response> {
  try {
    const settings = await getSiteSettings()
    return NextResponse.json({ digits: waDigitsFromSettings(settings) })
  } catch {
    return NextResponse.json({ digits: '' })
  }
}
