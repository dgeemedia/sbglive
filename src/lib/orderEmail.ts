// src/lib/orderEmail.ts
// The order-confirmation email. Everything a customer typed (their name, product names) is
// HTML-escaped before it goes into the email, so nobody can inject markup or links into a
// message that is sent from the store's own domain.

export function escapeHtml(v: unknown): string {
  return String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

const naira = (n: unknown) => `₦${(Number(n) || 0).toLocaleString('en-NG')}`

export interface EmailItem {
  productName?: string
  size?: string
  color?: string
  quantity?: number
  price?: number
}

export function buildOrderEmail({ name, reference, items, total }: {
  name: string
  reference: string
  items: EmailItem[]
  total: number
}): string {
  const cell = 'padding:8px;border-bottom:1px solid #2a2a2a;font-family:sans-serif;font-size:13px'
  const itemRows = (items || []).map(item =>
    `<tr>
      <td style="${cell};color:#e8e8e8">${escapeHtml(item.productName)}</td>
      <td style="${cell};color:#888">${escapeHtml(item.size)} / ${escapeHtml(item.color)}</td>
      <td style="${cell};color:#888">${escapeHtml(item.quantity)}</td>
      <td style="${cell};color:#c8a96e">${naira(item.price)}</td>
    </tr>`
  ).join('')

  const th = 'text-align:left;padding:8px;font-size:11px;letter-spacing:2px;color:#555;border-bottom:1px solid #2a2a2a'
  return `<!DOCTYPE html>
  <html>
  <body style="background:#0a0a0a;color:#e8e8e8;font-family:sans-serif;margin:0;padding:20px">
    <div style="max-width:560px;margin:0 auto;background:#111;border:1px solid #2a2a2a;padding:32px">
      <h1 style="font-size:28px;letter-spacing:4px;color:#ff2d2d;margin:0 0 4px">SBGFASHION</h1>
      <p style="color:#888;font-size:11px;letter-spacing:3px;margin:0 0 24px">ORDER CONFIRMED</p>
      <p style="color:#e8e8e8;margin-bottom:8px">Hey ${escapeHtml(name)},</p>
      <p style="color:#888;font-size:14px;line-height:1.6;margin-bottom:24px">Your order is confirmed and payment received. We will get it out to you ASAP.</p>
      <p style="font-size:12px;color:#555;letter-spacing:2px;margin-bottom:8px">REF: <span style="color:#c8a96e">${escapeHtml(reference)}</span></p>
      <table style="width:100%;border-collapse:collapse;margin-bottom:16px">
        <thead>
          <tr>
            <th style="${th}">ITEM</th>
            <th style="${th}">VARIANT</th>
            <th style="${th}">QTY</th>
            <th style="${th}">PRICE</th>
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
      </table>
      <div style="text-align:right;border-top:1px solid #2a2a2a;padding-top:12px">
        <span style="font-size:20px;color:#fff;letter-spacing:2px">TOTAL: ${naira(total)}</span>
      </div>
      <p style="color:#555;font-size:12px;margin-top:24px">Questions? Reply to this email or DM us on Instagram.</p>
    </div>
  </body>
  </html>`
}
