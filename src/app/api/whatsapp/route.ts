// src/app/api/whatsapp/route.ts
// Lets client components (e.g. the product page) get the store's WhatsApp number.
// The number is already public on the site (footer + WhatsApp button).
import { NextResponse } from 'next/server'
import { getSiteSettings } from '@/lib/queries'

export async function GET(): Promise<Response> {
  const settings = await getSiteSettings()
  const digits = (settings?.whatsappNumber || settings?.phone || '').replace(/[^\d]/g, '')
  return NextResponse.json({ digits })
}
