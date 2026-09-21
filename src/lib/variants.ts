// src/lib/variants.ts
// Size / colour rules shared by every "add to cart" shortcut (hero roll, product-card Quick Shop).
// A shortcut may only add an item straight to the cart when there is nothing for the customer
// to choose. If there is a real choice, the customer goes to the product page to make it —
// we never quietly pick a size for them.

type Options = { sizes?: string[] | null; colors?: string[] | null }

const list = (a?: string[] | null) => (a ?? []).map(s => s.trim()).filter(Boolean)

/** True when the customer has to pick something (more than one size, or more than one colour) */
export function needsVariantChoice(p: Options): boolean {
  return list(p.sizes).length > 1 || list(p.colors).length > 1
}

/** The only possible variant, when there is no real choice */
export function defaultVariant(p: Options): { size: string; color: string } {
  const sizes = list(p.sizes)
  const colors = list(p.colors)
  return {
    size: sizes.length === 1 ? sizes[0] : 'ONE SIZE',
    color: colors.length === 1 ? colors[0] : 'DEFAULT',
  }
}
