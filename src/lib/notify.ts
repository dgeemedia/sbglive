// src/lib/notify.ts
// One place for the "Notify me when it drops" WhatsApp message, used by the
// Coming Soon grid and the product page.
export function buildNotifyUrl(
  product: { name: string; price: number },
  waDigits: string,
  opts?: { size?: string; color?: string }
): string {
  const details = [opts?.size, opts?.color].filter(Boolean).join(', ')
  const message =
    `Hi! I'd like to be notified when "${product.name}"${details ? ` (${details})` : ''} ` +
    `(₦${product.price.toLocaleString()}) drops. Please let me know when it's available 🙏`
  return waDigits
    ? `https://wa.me/${waDigits}?text=${encodeURIComponent(message)}`
    : `https://wa.me/?text=${encodeURIComponent(message)}`
}
