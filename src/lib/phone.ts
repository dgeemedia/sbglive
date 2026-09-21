// src/lib/phone.ts
// wa.me links need the number in international format with digits only (no "+", no leading 0).
// The owner types the number into Sanity Studio however they like — "0803 123 4567" is the
// natural way to write a Nigerian number, and wa.me silently fails on it. This turns whatever
// was typed into something wa.me accepts. One place, used by every WhatsApp link on the site.

export function toWaDigits(raw?: string | null): string {
  let d = (raw || '').replace(/\D/g, '')
  if (!d) return ''
  if (d.startsWith('00')) d = d.slice(2) // 00234… → 234…
  if (d.length === 11 && d.startsWith('0')) return '234' + d.slice(1) // 0803… → 234803…
  if (d.length === 14 && d.startsWith('2340')) return '234' + d.slice(4) // +234 (0)803… → 234803…
  return d
}

/** WhatsApp digits from the site settings: the dedicated WhatsApp number, else the phone number */
export function waDigitsFromSettings(
  settings?: { whatsappNumber?: string | null; phone?: string | null } | null
): string {
  return toWaDigits(settings?.whatsappNumber) || toWaDigits(settings?.phone)
}
