// src/lib/checkout.ts
// Server-side cart validation and pricing. The browser tells us WHAT is in the cart
// (product ids, sizes, colours, quantities) but never what things COST — prices,
// names and availability always come from Sanity, and the amount we charge is
// computed here. Pure functions on purpose (no Sanity / network) so they're easy to test.
//
// CHANGE: CheckoutProduct now carries `stock`, and priceCart has a new step (2.5) that rejects
// an order when the quantity requested exceeds what's actually left for that size/colour. Products
// that don't use the stock array (see product.ts) are untouched — this only kicks in when `stock`
// has entries.

export interface StockLine {
  size?: string | null
  color?: string | null
  quantity?: number | null
}

export interface CheckoutProduct {
  _id: string
  name: string
  price: number
  sizes?: string[] | null
  colors?: string[] | null
  isSoldOut?: boolean // already true when the owner unticked "In Stock" (not for Coming Soon items — see queries.ts)
  isComingSoon?: boolean
  stock?: StockLine[] | null
}

export interface CartLine {
  productId: string
  size: string
  color: string
  quantity: number
  clientName: string // only ever used to name an item in an error message
}

/** One order line, built entirely from Sanity data — this is what gets saved on the order */
export interface PricedItem {
  productName: string
  productId: string
  size: string
  color: string
  quantity: number
  price: number
}

export const MAX_LINES = 50
export const MAX_QTY = 999

type Fail = {
  ok: false
  status: number
  error: string
  code?: 'PRICE_CHANGED'
  latest?: { productId: string; price: number }[]
}

const fail = (error: string, status = 400): Fail => ({ ok: false, status, error })
const short = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '')

/** Step 1 — check the shape of what the browser sent. Never trusts prices. */
export function parseCartLines(raw: unknown): { ok: true; lines: CartLine[] } | Fail {
  if (!Array.isArray(raw) || raw.length === 0) return fail('Your cart is empty')
  if (raw.length > MAX_LINES) return fail('Your cart has too many items. Please split it into smaller orders.')

  const lines: CartLine[] = []
  for (const item of raw) {
    const productId = short(item?.productId, 100)
    const quantity = item?.quantity
    if (!productId || typeof quantity !== 'number' || !Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QTY) {
      return fail('Your cart contains an invalid item. Please remove it and try again.')
    }
    lines.push({
      productId,
      size: short(item?.size, 60) || 'ONE SIZE',
      color: short(item?.color, 60) || 'DEFAULT',
      quantity,
      clientName: short(item?.productName, 100),
    })
  }
  return { ok: true, lines }
}

const round2 = (n: number) => Math.round(n * 100) / 100

/**
 * Check the size / colour the browser sent against what the product really offers.
 * - Nothing to choose (no options listed) -> normalised to ONE SIZE / DEFAULT.
 * - Exactly one option -> that option (also rescues older saved carts that sent the placeholder).
 * - Several options -> must match one of them (case-insensitive); returns the product's own spelling.
 */
function matchOption(options: string[] | null | undefined, sent: string, placeholder: string): string | null {
  const list = (options ?? []).map(o => o.trim()).filter(Boolean)
  if (list.length === 0) return placeholder
  if (list.length === 1) return sent === placeholder || sent.toLowerCase() === list[0].toLowerCase() ? list[0] : null
  return list.find(o => o.toLowerCase() === sent.toLowerCase()) ?? null
}

const norm = (v: string | null | undefined, placeholder: string) => {
  const t = (v ?? '').trim()
  return t ? t.toLowerCase() : placeholder.toLowerCase()
}

/**
 * Units left for one size/colour combination.
 * Returns `null` when the product isn't using per-variant stock tracking at all (empty/absent
 * `stock` array) — callers should treat `null` as "not tracked, don't block the order on it".
 * Returns a number (possibly 0) when it IS tracked but no line matches, treated as 0 remaining.
 */
function remainingFor(stock: StockLine[] | null | undefined, size: string, color: string): number | null {
  if (!stock || stock.length === 0) return null
  const line = stock.find(
    (s) => norm(s.size, 'ONE SIZE') === norm(size, 'ONE SIZE') && norm(s.color, 'DEFAULT') === norm(color, 'DEFAULT')
  )
  return Math.max(0, line?.quantity ?? 0)
}

/**
 * Step 2 — price the cart from Sanity's data.
 * Rejects anything that can't be bought, and rejects the request if the amount the
 * browser showed the customer doesn't match what we calculate.
 */
export function priceCart(
  lines: CartLine[],
  products: CheckoutProduct[],
  clientAmount: unknown
): { ok: true; items: PricedItem[]; total: number } | Fail {
  const byId = new Map(products.map(p => [p._id, p]))

  // 1) availability — collect every problem so the customer sees them all at once
  const problems = { comingSoon: new Set<string>(), soldOut: new Set<string>(), missing: new Set<string>() }
  for (const l of lines) {
    const p = byId.get(l.productId)
    if (!p) problems.missing.add(l.clientName || 'An item in your cart')
    else if (p.isComingSoon) problems.comingSoon.add(p.name)
    else if (p.isSoldOut) problems.soldOut.add(p.name)
    else if (typeof p.price !== 'number' || !Number.isFinite(p.price) || p.price <= 0) problems.missing.add(p.name)
  }
  const sentences: string[] = []
  const list = (s: Set<string>) => [...s].join(', ')
  const verb = (s: Set<string>) => (s.size > 1 ? 'are' : 'is')
  if (problems.comingSoon.size) sentences.push(`${list(problems.comingSoon)} ${verb(problems.comingSoon)} coming soon and can't be ordered yet.`)
  if (problems.soldOut.size) sentences.push(`${list(problems.soldOut)} ${verb(problems.soldOut)} sold out.`)
  if (problems.missing.size) sentences.push(`${list(problems.missing)} ${verb(problems.missing)} no longer available.`)
  if (sentences.length) {
    const count = problems.comingSoon.size + problems.soldOut.size + problems.missing.size
    return fail(`${sentences.join(' ')} Please remove ${count > 1 ? 'them' : 'it'} from your cart.`)
  }

  // 2) size / colour must be something the product really comes in
  const variants = new Map<CartLine, { size: string; color: string }>()
  const badVariant = new Set<string>()
  for (const l of lines) {
    const p = byId.get(l.productId)!
    const size = matchOption(p.sizes, l.size, 'ONE SIZE')
    const color = matchOption(p.colors, l.color, 'DEFAULT')
    if (size === null || color === null) badVariant.add(p.name)
    else variants.set(l, { size, color })
  }
  if (badVariant.size) {
    const n = badVariant.size
    return fail(
      `The size or color for ${list(badVariant)} ${verb(badVariant)} missing or no longer available. ` +
      `Please remove ${n > 1 ? 'them' : 'it'} from your cart and add ${n > 1 ? 'them' : 'it'} again.`
    )
  }

  // 2.5) requested quantity must not exceed real remaining stock, for products that track it
  const insufficient: string[] = []
  for (const l of lines) {
    const p = byId.get(l.productId)!
    const v = variants.get(l)!
    const remaining = remainingFor(p.stock, v.size, v.color)
    if (remaining !== null && l.quantity > remaining) {
      const variantLabel = [v.size !== 'ONE SIZE' ? v.size : null, v.color !== 'DEFAULT' ? v.color : null]
        .filter(Boolean)
        .join(' / ')
      insufficient.push(
        remaining === 0
          ? `${p.name}${variantLabel ? ` (${variantLabel})` : ''} just sold out.`
          : `Only ${remaining} left of ${p.name}${variantLabel ? ` (${variantLabel})` : ''} — you asked for ${l.quantity}.`
      )
    }
  }
  if (insufficient.length) {
    return fail(`${insufficient.join(' ')} Please update your cart and try again.`)
  }

  // 3) build the order lines + total purely from Sanity data
  const items: PricedItem[] = lines.map(l => {
    const p = byId.get(l.productId)!
    const v = variants.get(l)!
    return { productName: p.name, productId: p._id, size: v.size, color: v.color, quantity: l.quantity, price: p.price }
  })
  const total = round2(items.reduce((sum, i) => sum + i.price * i.quantity, 0))

  // 4) the amount the customer was shown must match — otherwise prices changed (or someone tampered)
  const shown = Number(clientAmount)
  if (!Number.isFinite(shown) || Math.abs(shown - total) > 0.01) {
    const latest = [...new Map(items.map(i => [i.productId, i.price])).entries()].map(([productId, price]) => ({ productId, price }))
    return {
      ok: false,
      status: 409,
      code: 'PRICE_CHANGED',
      error: 'Some prices have changed. Your cart has been updated — please review the new total and pay again.',
      latest,
    }
  }

  return { ok: true, items, total }
}
